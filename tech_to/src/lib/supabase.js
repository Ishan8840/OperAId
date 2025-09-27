import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://avqekanfqbqeoetnncri.supabase.co/'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2cWVrYW5mcWJxZW9ldG5uY3JpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5ODU0OTQsImV4cCI6MjA3NDU2MTQ5NH0.mRVwqfg_XAPZ_Jzs2kXEs88NNJyP-O3yVYOXja7v50s'

export const supabase = createClient(supabaseUrl, supabaseKey)
