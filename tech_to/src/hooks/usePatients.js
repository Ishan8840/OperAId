import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const usePatients = () => {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPatientsWithScans()
  }, [])

  const fetchPatientsWithScans = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('patients')
        .select(`
          *,
          scans (
            id,
            scan_type,
            scan_date,
            image_url
          ),
          annotations (
            id,
            note,
            created_at
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPatients(data || [])
    } catch (error) {
      setError(error.message)
      console.error('Error fetching patients:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPatientScans = async (patientId) => {
    try {
      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .eq('patient_id', patientId)
        .order('scan_date', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching patient scans:', error)
      return []
    }
  }

  const getAnnotations = async (scanId) => {
    try {
      const { data, error } = await supabase
        .from('annotations')
        .select('*')
        .eq('scan_id', scanId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching annotations:', error)
      return []
    }
  }

  return {
    patients,
    loading,
    error,
    refetch: fetchPatientsWithScans,
    getPatientScans,
    getAnnotations
  }
}