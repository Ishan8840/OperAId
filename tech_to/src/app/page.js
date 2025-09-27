"use client";

import { useState } from "react";
import SurgicalAssistantSidebar from "../components/SurgicalAssistantSidebar.js";
import MedicalFileViewer from "../components/MedicalFileViewer.js";
import AudioRecordingTest from "../components/AudioRecordingTest.js";
import LiveTranscription from "../components/LiveTranscription.js";


const Index = () => {
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [showAudioTest, setShowAudioTest] = useState(false);
  const [liveTranscription, setLiveTranscription] = useState("");

  const handleFileSelect = (fileId) => {
    setSelectedFileId(fileId);
  };

  const handleToggleAudio = () => {
    setIsAudioMuted(prev => !prev);
    if (!isAudioMuted) {
      setLiveTranscription("");
    }
  };

  const handleShowAudioTest = () => {
    setShowAudioTest(true);
  };

  const handleTranscriptionUpdate = (transcription) => {
    setLiveTranscription(transcription);
  };

  return (
    <div className="flex min-h-screen w-full bg-gray-100">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-12 flex items-center bg-white border-b border-gray-200 shadow-sm">
        <h1 className="ml-4 text-lg font-semibold text-gray-800">
          Surgical AI Assistant
        </h1>
      </header>

      {/* Main layout */}
      <div className="flex w-full pt-12">
        {/* Live Transcription Component (invisible) */}
        <LiveTranscription 
          isActive={!isAudioMuted}
          onTranscriptionUpdate={handleTranscriptionUpdate}
        />
        
        <SurgicalAssistantSidebar
          selectedFileId={selectedFileId}
          onFileSelect={handleFileSelect}
          isAudioMuted={isAudioMuted}
          onToggleAudio={handleToggleAudio}
          onShowAudioTest={handleShowAudioTest}
          liveTranscription={!isAudioMuted ? liveTranscription : ""}
        />
        
        {showAudioTest ? (
          <div className="flex-1 p-6">
            <div className="mb-4 flex items-center gap-4">
              <button 
                onClick={() => setShowAudioTest(false)}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                ← Back to Files
              </button>
              <h2 className="text-xl font-semibold text-gray-800">Live Audio Transcription</h2>
            </div>
            <AudioRecordingTest />
          </div>
        ) : (
          <MedicalFileViewer selectedFileId={selectedFileId} />
        )}
      </div>
    </div>
  );
};

export default Index;
