import { useState, useEffect } from 'react'

// Mock hook to provide fallback when Supabase is not available
export const useMedicalFiles = () => {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Use mock data when Supabase is not available
    const mockFiles = [
      {
        id: 1,
        name: "Fake Dude 1",
        type: "mri",
        size: "12.3 MB",
        date: "2024-01-15",
        patient_name: "John Doe",
        image_url: "https://example.com/scan1.jpg",
        scan_date: "2024-01-15",
        patient_id: 1
      },
      {
        id: 2,
        name: "Fake Dude 2",
        type: "ct",
        size: "8.7 MB",
        date: "2024-01-14",
        patient_name: "Jane Smith",
        image_url: "https://example.com/scan2.jpg",
        scan_date: "2024-01-14",
        patient_id: 2
      }
    ]
    
    setFiles(mockFiles)
    setLoading(false)
  }, [])

  const uploadScan = async (file, patientId, scanType = 'MRI') => {
    try {
      // Mock upload - would connect to Supabase in production
      console.log('Mock upload:', file.name, patientId, scanType)
      return { success: true }
    } catch (error) {
      setError(error.message)
      throw error
    }
  }

  const refetch = () => {
    // Mock refetch
    setLoading(false)
  }

  return {
    files,
    loading,
    error,
    uploadScan,
    refetch
  }
}