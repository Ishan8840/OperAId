"use client";

import { useState } from "react";
import { FileText, Image, Folder, Search, Settings, Mic, MicOff, Volume2 } from "lucide-react";

// Mock data - will be replaced with Supabase data
const mockFiles = [
  { id: "1", name: "Patient_001_MRI_Brain.dcm", type: "mri", size: "24.5 MB", date: "2024-01-15" },
  { id: "2", name: "Patient_002_CT_Spine.dcm", type: "ct", size: "18.2 MB", date: "2024-01-14" },
  { id: "3", name: "Patient_003_MRI_Knee.dcm", type: "mri", size: "32.1 MB", date: "2024-01-13" },
  { id: "4", name: "Patient_004_Xray_Chest.dcm", type: "xray", size: "4.8 MB", date: "2024-01-12" },
];

const SurgicalAssistantSidebar = ({ 
  selectedFileId, 
  onFileSelect, 
  isAudioMuted, 
  onToggleAudio,
  onShowAudioTest,
  liveTranscription 
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter files based on search query
  const filteredFiles = mockFiles.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFileIcon = (type) => {
    switch (type) {
      case "mri":
      case "ct":
      case "xray":
        return <Image className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-80 h-full bg-gray-50 border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Folder className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold text-gray-800">Medical Files</h2>
        </div>
        
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Recent Files</h3>
          <div className="space-y-2">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                onClick={() => onFileSelect(file.id)}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
                  selectedFileId === file.id
                    ? "bg-blue-100 border border-blue-300"
                    : "bg-white hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {getFileIcon(file.type)}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-800 truncate">
                    {file.name}
                  </div>
                  <div className="text-xs text-gray-500 flex justify-between">
                    <span>{file.size}</span>
                    <span>{file.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredFiles.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No files found</p>
            </div>
          )}
        </div>

        {/* Supabase Integration Placeholder */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Database Status</h3>
          <div className="p-3 bg-gray-100 rounded-lg">
            <p className="text-xs text-gray-600 mb-2">
              Connect to Supabase to access:
            </p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Real-time file sync</li>
              <li>• Patient records</li>
              <li>• Image storage</li>
              <li>• Speech transcripts</li>
            </ul>
            <p className="text-xs text-gray-500 mt-2">
              Files: <code className="bg-gray-200 px-1 rounded">components/SurgicalAssistantSidebar.js</code> (lines 7-12, 98-112)
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 space-y-3">
        {/* Live Transcription */}
        {liveTranscription && (
          <div className="mb-3">
            <h4 className="text-xs font-medium text-gray-600 mb-1">Live Transcription:</h4>
            <div className="p-2 bg-blue-50 rounded text-xs text-gray-700 max-h-16 overflow-y-auto">
              {liveTranscription || "Listening..."}
            </div>
          </div>
        )}
        
        {/* Audio Control Button */}
        <button
          onClick={onToggleAudio}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
            isAudioMuted
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-green-500 hover:bg-green-600 text-white"
          }`}
        >
          {isAudioMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          {isAudioMuted ? "Audio Muted" : "Audio Active"}
        </button>
        
        {/* Audio Test Button */}
        <button 
          onClick={onShowAudioTest}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
        >
          <Volume2 className="w-4 h-4" />
          Audio Test
        </button>
      </div>
    </div>
  );
};

export default SurgicalAssistantSidebar;