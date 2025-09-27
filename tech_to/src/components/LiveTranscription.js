"use client";

import { useState, useRef, useEffect } from "react";

const LiveTranscription = ({ isActive, onTranscriptionUpdate }) => {
  const [isListening, setIsListening] = useState(false);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isActive && !isListening) {
      startLiveTranscription();
    } else if (!isActive && isListening) {
      stopLiveTranscription();
    }

    return () => {
      stopLiveTranscription();
    };
  }, [isActive]);

  const startLiveTranscription = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setIsListening(true);

      // Send audio chunks every 3 seconds for live transcription
      intervalRef.current = setInterval(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
          mediaRecorderRef.current.stop();
          setupNewRecorder();
        }
      }, 3000);

      setupNewRecorder();
    } catch (error) {
      console.error("Error accessing microphone:", error);
      onTranscriptionUpdate("Microphone access denied");
    }
  };

  const setupNewRecorder = () => {
    if (!streamRef.current) return;

    mediaRecorderRef.current = new MediaRecorder(streamRef.current, { 
      mimeType: "audio/webm" 
    });
    audioChunksRef.current = [];

    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) {
        audioChunksRef.current.push(e.data);
      }
    };

    mediaRecorderRef.current.onstop = async () => {
      if (audioChunksRef.current.length > 0) {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await sendAudioForTranscription(audioBlob);
      }
    };

    mediaRecorderRef.current.start();
  };

  const sendAudioForTranscription = async (audioBlob) => {
    // Convert to WAV
    const wavBlob = await convertToWav(audioBlob);
    
    const formData = new FormData();
    formData.append("audio", wavBlob, "live_recording.wav");

    try {
      const response = await fetch("http://127.0.0.1:8000/get_data", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("Backend response:", data);
      
      // Update transcription
      if (data.transcription && data.transcription.trim()) {
        onTranscriptionUpdate(data.transcription);
      }
      
      // Check for scan results and extract image URL
      let imageUrl = null;
      if (data.results && data.results.length > 0) {
        const scanResult = data.results[0];
        if (scanResult.function === "get_patient_scans" && scanResult.result) {
          // Extract image URL from the result string
          const match = scanResult.result.match(/Image URL: (.*?)\n/);
          if (match && match[1]) {
            imageUrl = match[1].trim();
          }
        }
      }
      
      // Dispatch custom event with transcription, results, and image URL
      if (data.results && data.results.length > 0) {
        console.log("Dispatching results:", data.results);
        window.dispatchEvent(new CustomEvent('transcriptionUpdate', {
          detail: {
            transcription: data.transcription,
            results: data.results,
            imageUrl: imageUrl
          }
        }));
      }
    } catch (error) {
      console.error("Error sending audio for transcription:", error);
      onTranscriptionUpdate("Connection error - check backend");
    }
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

  const stopLiveTranscription = () => {
    setIsListening(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  return null;
};

export default LiveTranscription;