"use client";

import React, { useState, useMemo } from "react";
import { Download, RotateCw, ZoomIn, ZoomOut, User, Calendar, FileText, Stethoscope, Activity } from "lucide-react";
import { usePatients } from "../hooks/usePatients";

const MedicalFileViewer = ({ selectedFileId, queryResults = [] }) => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);
  const { patients, loading } = usePatients();

  // Find selected scan
  const selectedScan = useMemo(() => {
    if (!selectedFileId || !patients.length) return null;

    for (const patient of patients) {
      const scan = patient.scans?.find((s) => s.id === selectedFileId);
      if (scan) {
        return {
          ...scan,
          patient: {
            name: patient.name,
            dob: patient.dob,
            record: patient.record,
          },
          annotations: patient.annotations?.filter((a) => a.scan_id === scan.id) || [],
        };
      }
    }
    return null;
  }, [selectedFileId, patients]);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 25, 300));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 25, 25));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleDownload = () => selectedScan?.image_url && window.open(selectedScan.image_url, "_blank");

  const formatFunctionName = (name) => {
    if (!name) return "AI Response";
    return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // No selection & query results
  if (!selectedScan && queryResults.length > 0) {
    return (
      <div className="flex-1 flex flex-col bg-white overflow-y-auto">
        <div className="border-b border-gray-200 p-4 flex items-center gap-2">
          <Activity className="w-6 h-6 text-blue-600" />
          <h1 className="text-xl font-semibold text-gray-800">Query Results</h1>
        </div>
        <div className="p-6 space-y-4">
          {queryResults.map((result, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="bg-blue-50 px-4 py-3 border-b border-blue-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">{formatFunctionName(result.function)}</h3>
                {result.arguments && (
                  <div className="text-xs text-gray-600 bg-white px-3 py-1 rounded">
                    {Object.entries(result.arguments)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(", ")}
                  </div>
                )}
              </div>
              <div className="p-4 space-y-2">
                {Array.isArray(result.result) && result.result.every((r) => r.image_url) ? (
                  result.result.map((scan, i) => (
                    <div key={i} className="bg-white rounded-lg shadow p-2">
                      <h4 className="font-semibold text-gray-800">{scan.scan_type} Scan for {scan.patient_name}</h4>
                      <p className="text-sm text-gray-600">Date: {new Date(scan.scan_date).toLocaleDateString()}</p>
                      <img
                        src={scan.image_url}
                        alt={`${scan.scan_type} scan`}
                        className="mt-2 max-w-full rounded-lg border border-gray-200"
                      />
                    </div>
                  ))
                ) : (
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap break-words bg-gray-50 p-4 rounded">
                    {typeof result.result === "string"
                      ? result.result
                      : JSON.stringify(result.result, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // No scan selected
  if (!selectedScan) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Stethoscope className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No Content Selected</h3>
          <p className="text-gray-500">Select a scan from the sidebar or speak a query</p>
        </div>
      </div>
    );
  }

  // Selected scan view
  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">{selectedScan.scan_type} Scan</h1>
          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" /> <span>{selectedScan.patient.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" /> <span>{new Date(selectedScan.scan_date).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleZoomOut} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"><ZoomOut className="w-4 h-4" /></button>
          <span className="px-3 py-1 bg-gray-100 rounded text-sm font-medium">{zoomLevel}%</span>
          <button onClick={handleZoomIn} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"><ZoomIn className="w-4 h-4" /></button>
          <button onClick={handleRotate} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"><RotateCw className="w-4 h-4" /></button>
          <button onClick={handleDownload} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Download className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex">
        {/* Image Viewer */}
        <div className="flex-1 flex items-center justify-center bg-gray-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-full max-h-full overflow-auto">
            {selectedScan.image_url ? (
              <img
                src={selectedScan.image_url}
                alt={`${selectedScan.scan_type} scan`}
                className="max-w-full max-h-full object-contain"
                style={{ transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`, transition: "transform 0.2s" }}
              />
            ) : (
              <div className="w-96 h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                <FileText className="w-16 h-16 text-gray-400" />
                <span className="ml-2 text-gray-500">No image available</span>
              </div>
            )}
          </div>
        </div>

        {/* Details Panel */}
        <div className="w-80 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto">
          <h3 className="font-semibold text-gray-800 mb-4">Patient Information</h3>
          <div className="space-y-4">
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div><span className="font-medium text-gray-600">Name:</span> <span className="ml-2 text-gray-800">{selectedScan.patient.name}</span></div>
                <div><span className="font-medium text-gray-600">DOB:</span> <span className="ml-2 text-gray-800">{new Date(selectedScan.patient.dob).toLocaleDateString()}</span></div>
                <div><span className="font-medium text-gray-600">Record:</span> <span className="ml-2 text-gray-800">{selectedScan.patient.record || "N/A"}</span></div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-800 mb-2">Annotations</h4>
              {selectedScan.annotations.length > 0 ? (
                <div className="space-y-2">
                  {selectedScan.annotations.map((annotation) => (
                    <div key={annotation.id} className="bg-white p-3 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-800">{annotation.note}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(annotation.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 bg-white p-3 rounded-lg border border-gray-200">No annotations available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalFileViewer;
