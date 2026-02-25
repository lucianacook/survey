import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { responses, fingerprint } = await req.json()

    // Check if already submitted
    const { data: existing } = await supabase
      .from('survey_responses')
      .select('status')
      .eq('session_id', user.id)
      .single()

    if (existing?.status === 'completed') {
      return new Response(
        JSON.stringify({ error: 'Already submitted', code: 'ALREADY_SUBMITTED' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Validate response size
    if (JSON.stringify(responses).length > 100000) {
      throw new Error('Response too large')
    }

    // Update to completed
    const { error } = await supabase
      .from('survey_responses')
      .upsert({
        session_id: user.id,
        responses,
        status: 'completed',
        completed_at: new Date().toISOString(),
        fingerprint_hash: fingerprint,
      })

    if (error) throw error

    // Increment rate limit
    if (fingerprint) {
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )
      await supabaseAdmin.rpc('increment_rate_limit', { fp: fingerprint })
    }

    return new Response(
      JSON.stringify({ success: true, submittedAt: new Date().toISOString() }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }
})
