import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zowartvtptsthbbpppic.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpvd2FydHZ0cHRzdGhiYnBwcGljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4NTM2OTksImV4cCI6MjA5NTQyOTY5OX0.cZF-nuc3_rmoxyVi-syS_Pp1z-R4gPLuE-9oplMjmMc'

export const supabase = createClient(supabaseUrl, supabaseKey)
