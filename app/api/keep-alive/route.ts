import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient(
    'https://zowartvtptsthbbpppic.supabase.co',
    process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpvd2FydHZ0cHRzdGhiYnBwcGljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4NTM2OTksImV4cCI6MjA5NTQyOTY5OX0.cZF-nuc3_rmoxyVi-syS_Pp1z-R4gPLuE-9oplMjmMc'
  )

  const { error } = await supabase.from('profiles').select('id').limit(1)

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, timestamp: new Date().toISOString() })
}
