"use client";

import { useState, useRef } from "react";

export default function Page() {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState("");
  const [downloadURL, setDownloadURL] = useState("");
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);

  const startRecording = async () => {
    // Get microphone access
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;

    mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: "audio/webm" });
    audioChunksRef.current = [];

    mediaRecorderRef.current.ondataavailable = (e) => {
      audioChunksRef.current.push(e.data);
    };

    mediaRecorderRef.current.onstop = async () => {
      // Convert recorded WebM to WAV
      const webmBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const wavBlob = await convertToWav(webmBlob);

      const url = URL.createObjectURL(wavBlob);
      setAudioURL(url);
      setDownloadURL(url);

      // Stop all microphone tracks
      streamRef.current.getTracks().forEach((track) => track.stop());
    };

    mediaRecorderRef.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  // Convert WebM blob to WAV blob
  const convertToWav = async (blob) => {
    const arrayBuffer = await blob.arrayBuffer();
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

    const numOfChan = audioBuffer.numberOfChannels;
    const length = audioBuffer.length * numOfChan * 2 + 44;
    const bufferArray = new ArrayBuffer(length);
    const view = new DataView(bufferArray);

    let offset = 0;
    const writeString = (str) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset++, str.charCodeAt(i));
      }
    };

    // RIFF header
    writeString("RIFF");
    view.setUint32(offset, length - 8, true);
    offset += 4;
    writeString("WAVE");

    // fmt subchunk
    writeString("fmt ");
    view.setUint32(offset, 16, true);
    offset += 4;
    view.setUint16(offset, 1, true); // PCM
    offset += 2;
    view.setUint16(offset, numOfChan, true);
    offset += 2;
    view.setUint32(offset, audioBuffer.sampleRate, true);
    offset += 4;
    view.setUint32(offset, audioBuffer.sampleRate * numOfChan * 2, true);
    offset += 4;
    view.setUint16(offset, numOfChan * 2, true);
    offset += 2;
    view.setUint16(offset, 16, true);
    offset += 2;

    // data subchunk
    writeString("data");
    view.setUint32(offset, length - offset - 4, true);
    offset += 4;

    // Interleave channels
    const interleave = (input) => {
      const output = new Float32Array(input[0].length * input.length);
      let index = 0;
      for (let i = 0; i < input[0].length; i++) {
        for (let j = 0; j < input.length; j++) {
          output[index++] = input[j][i];
        }
      }
      return output;
    };

    const channels = [];
    for (let i = 0; i < numOfChan; i++) {
      channels.push(audioBuffer.getChannelData(i));
    }

    const interleaved = interleave(channels);
    for (let i = 0; i < interleaved.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, interleaved[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }

    return new Blob([view], { type: "audio/wav" });
  };

  return (
  <div className="flex justify-center items-start py-16 px-4">
    <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-800 text-center">
        Audio Recording Test (WAV)
      </h1>

      {/* Recording Button */}
      <button
        onClick={recording ? stopRecording : startRecording}
        className={`px-6 py-2 font-semibold rounded-lg shadow-md transition-colors duration-200
          ${recording ? "bg-red-400 hover:bg-red-500 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"}`}
      >
        {recording ? "Stop Recording" : "Start Recording"}
      </button>

      {/* Playback & Download */}
      {audioURL && (
        <div className="flex flex-col gap-2">
          <h2 className="font-semibold text-gray-700">Playback:</h2>
          <audio src={audioURL} controls className="w-full rounded-lg" />
          <a
            href={downloadURL}
            download="recording.wav"
            className="inline-block mt-2 px-5 py-2 bg-green-400 hover:bg-green-500 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 text-center"
          >
            Download recording.wav
          </a>
        </div>
      )}
    </div>
  </div>
);

}
