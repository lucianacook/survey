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
    const { fingerprint } = await req.json()

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check rate limit
    if (fingerprint) {
      const { data: rateLimit } = await supabaseAdmin
        .from('rate_limits')
        .select('*')
        .eq('fingerprint_hash', fingerprint)
        .single()

      if (rateLimit && rateLimit.submission_count >= 3) {
        if (rateLimit.blocked_until && new Date(rateLimit.blocked_until) > new Date()) {
          return new Response(
            JSON.stringify({
              canSubmit: false,
              message: 'You have already completed this survey. Thank you!'
            }),
            { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          )
        }
      }
    }

    // Create anonymous session
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInAnonymously()

    if (authError) throw authError

    return new Response(
      JSON.stringify({
        canSubmit: true,
        sessionId: authData.user.id,
        token: authData.session.access_token
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }
})
