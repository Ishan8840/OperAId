"use client";

import { useState } from "react";
import { ZoomIn, ZoomOut, RotateCw, Download } from "lucide-react";

// Mock file data - will be replaced with Supabase data
const mockFileData = {
  "1": {
    name: "Patient_001_MRI_Brain.dcm",
    type: "MRI",
    date: "2024-01-15",
    patient: "John Doe",
    bodyPart: "Brain",
    imageUrl: "/api/placeholder/600/400", // Placeholder - will be replaced with Supabase storage
    metadata: {
      studyDate: "2024-01-15",
      modality: "MRI",
      sliceThickness: "1.0mm",
      fieldStrength: "3.0T"
    }
  },
  "2": {
    name: "Patient_002_CT_Spine.dcm",
    type: "CT",
    date: "2024-01-14",
    patient: "Jane Smith",
    bodyPart: "Spine",
    imageUrl: "/api/placeholder/600/400",
    metadata: {
      studyDate: "2024-01-14",
      modality: "CT",
      sliceThickness: "0.5mm",
      kvp: "120kV"
    }
  }
};

const MedicalFileViewer = ({ selectedFileId }) => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);
  
  const fileData = selectedFileId ? mockFileData[selectedFileId] : null;

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 500));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 25, 25));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleDownload = () => {
    if (fileData) {
      // TODO: Implement download functionality with Supabase
      console.log("Download file:", fileData.name);
    }
  };

  if (!selectedFileId || !fileData) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-300 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No File Selected</h3>
          <p className="text-gray-500">Select a medical file from the sidebar to view it here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">{fileData.name}</h1>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
              <span>Patient: {fileData.patient}</span>
              <span>•</span>
              <span>Date: {fileData.date}</span>
              <span>•</span>
              <span>Type: {fileData.type}</span>
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            
            <span className="px-3 py-1 bg-gray-100 rounded text-sm font-medium min-w-[60px] text-center">
              {zoomLevel}%
            </span>
            
            <button
              onClick={handleZoomIn}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleRotate}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
              title="Rotate"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleDownload}
              className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Image Viewer */}
      <div className="flex-1 overflow-auto bg-gray-50 p-4">
        <div className="flex items-center justify-center min-h-full">
          <div 
            className="bg-white shadow-lg rounded-lg overflow-hidden"
            style={{
              transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
              transition: "transform 0.2s ease-in-out"
            }}
          >
            {/* Placeholder for medical image - will be replaced with Supabase storage */}
            <div className="w-96 h-64 bg-gray-800 flex items-center justify-center text-white">
              <div className="text-center">
                <div className="text-4xl mb-2">🏥</div>
                <div className="text-lg font-medium">{fileData.type} Scan</div>
                <div className="text-sm opacity-75">{fileData.bodyPart}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metadata Panel */}
      <div className="bg-gray-50 border-t border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">File Metadata</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          {Object.entries(fileData.metadata).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
              <span className="text-gray-800 font-medium">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MedicalFileViewer;