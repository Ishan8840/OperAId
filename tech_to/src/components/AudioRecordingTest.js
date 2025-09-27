"use client";

import { useState, useRef } from "react";

const AudioRecordingTest = () => {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState("");
  const [downloadURL, setDownloadURL] = useState("");
  const [transcription, setTranscription] = useState("");
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;

    mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: "audio/webm" });
    audioChunksRef.current = [];

    mediaRecorderRef.current.ondataavailable = (e) => {
      audioChunksRef.current.push(e.data);
    };

    mediaRecorderRef.current.onstop = async () => {
      const webmBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const wavBlob = await convertToWav(webmBlob);

      const url = URL.createObjectURL(wavBlob);
      setAudioURL(url);
      setDownloadURL(url);

      streamRef.current?.getTracks().forEach((track) => track.stop());

      // Send to FastAPI
      const formData = new FormData();
      formData.append("audio", wavBlob, "recording.wav");

      try {
        const response = await fetch("http://127.0.0.1:8000/get_data", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();
        setTranscription(data.transcription);
      } catch (error) {
        console.error("Error sending audio:", error);
      }
    };

    mediaRecorderRef.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

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

    writeString("RIFF");
    view.setUint32(offset, length - 8, true);
    offset += 4;
    writeString("WAVE");

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

    writeString("data");
    view.setUint32(offset, length - offset - 4, true);
    offset += 4;

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
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex flex-col gap-4">
        {/* Recording Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={recording ? stopRecording : startRecording}
            className={`px-4 py-2 font-medium rounded-lg transition-colors duration-200 ${
              recording 
                ? "bg-red-500 hover:bg-red-600 text-white" 
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            {recording ? "Stop Recording" : "Start Recording"}
          </button>
          {recording && (
            <span className="flex items-center gap-2 text-red-600">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
              Recording...
            </span>
          )}
        </div>

        {/* Playback & Download */}
        {audioURL && (
          <div className="flex flex-col gap-2">
            <audio src={audioURL} controls className="w-full h-10" />
            <a
              href={downloadURL}
              download="recording.wav"
              className="inline-block px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded transition-colors duration-200 text-center w-fit"
            >
              Download WAV
            </a>
          </div>
        )}

        {transcription && (
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Transcription:</h3>
            <p className="text-gray-600 bg-gray-50 p-3 rounded text-sm">{transcription}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioRecordingTest;