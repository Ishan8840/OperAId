"use client";

import { useState } from "react";
import { 
  FileText, Image, Folder, Search, 
  Mic, MicOff, Volume2, Database, ChevronDown, ChevronUp 
} from "lucide-react";
import { usePatients } from "../hooks/usePatients";

const SurgicalAssistantSidebar = ({ 
  selectedFileId, 
  onFileSelect, 
  isAudioMuted, 
  onToggleAudio,
  onShowAudioTest,
  liveTranscription,
  queryResults = []
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(true);
  const { patients, loading, error } = usePatients();

  // Flatten patients -> scans into file objects
  const files = patients.flatMap(patient =>
    (patient.scans || []).map(scan => ({
      id: scan.id,
      name: patient.name || `Patient ${patient.id}`,
      type: scan.scan_type,
      size: scan.size || "Unknown",
      date: scan.scan_date,
      patient_name: patient.name,
      image_url: scan.image_url,
      scan_date: scan.scan_date,
      patient_id: patient.id,
    }))
  );

  // Filter files based on search query
  const filteredFiles = files.filter(file =>
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

  const formatFunctionName = (name) => {
    if (!name) return "AI Response";
    return name
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <div className="w-80 h-screen bg-gray-50 border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
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

      {/* Query Results Section */}
      {queryResults.length > 0 && (
        <div className="border-b border-gray-200 flex-shrink-0">
          <button
            onClick={() => setShowResults(!showResults)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
          >
            <h3 className="text-sm font-medium text-gray-700">Query Results</h3>
            {showResults ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {showResults && (
            <div className="px-4 pb-4 max-h-64 overflow-y-auto">
              <div className="space-y-2">
                {queryResults.map((result, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                    <div className="text-xs font-medium text-blue-600 mb-1">
                      {formatFunctionName(result.function)}
                    </div>
                    <div className="text-xs text-gray-700 whitespace-pre-wrap break-words">
                      {typeof result.result === 'string' 
                        ? result.result.substring(0, 200) + (result.result.length > 200 ? '...' : '')
                        : JSON.stringify(result.result, null, 2).substring(0, 200) + '...'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* File List */}
      <div className="px-4 pt-4 flex-shrink-0">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Recent Files</h3>
      </div>
      
      <div className="px-4 overflow-y-auto flex-1">
        <div className="space-y-2 pb-4">
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

      {/* Database Status */}
      <div className="p-4 pb-2 flex-shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <Database className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-medium text-gray-600">Database Status</h3>
        </div>
        <div className="p-3 bg-white border border-gray-200 rounded-lg space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Supabase Connection</span>
            <div className={`w-2 h-2 rounded-full ${error ? "bg-red-500" : "bg-green-500"}`} />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Files Loaded</span>
            <span className="text-xs text-gray-600">{files.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Status</span>
            <span className="text-xs text-gray-600">{loading ? "Loading..." : "Ready"}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 space-y-4 flex-shrink-0">
        {liveTranscription && (
          <div>
            <h4 className="text-xs font-medium text-gray-600 mb-2">Live Transcription:</h4>
            <div className="p-3 bg-blue-50 rounded text-xs text-gray-700 max-h-16 overflow-y-auto">
              {liveTranscription || "Listening..."}
            </div>
          </div>
        )}
        
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