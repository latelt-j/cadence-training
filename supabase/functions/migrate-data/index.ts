import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { user_id } = await req.json()

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing user_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Use service role to bypass RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check if there are any rows with null user_id (orphan data)
    const { count: sessionsCount } = await supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .is('user_id', null)

    if (!sessionsCount || sessionsCount === 0) {
      return new Response(
        JSON.stringify({ migrated: false, message: 'No orphan data to migrate' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Migrate sessions
    const { error: sessionsError } = await supabase
      .from('sessions')
      .update({ user_id })
      .is('user_id', null)

    if (sessionsError) {
      console.error('Error migrating sessions:', sessionsError)
    }

    // Migrate user_settings (update the row with user_id = 0)
    const { error: settingsError } = await supabase
      .from('user_settings')
      .update({ user_id })
      .eq('user_id', 0)

    if (settingsError) {
      console.error('Error migrating user_settings:', settingsError)
    }

    // Migrate weekly_guidelines
    const { error: guidelinesError } = await supabase
      .from('weekly_guidelines')
      .update({ user_id })
      .is('user_id', null)

    if (guidelinesError) {
      console.error('Error migrating weekly_guidelines:', guidelinesError)
    }

    // Migrate oauth_tokens (if any with null user_id)
    const { error: tokensError } = await supabase
      .from('oauth_tokens')
      .update({ user_id })
      .is('user_id', null)

    if (tokensError) {
      console.error('Error migrating oauth_tokens:', tokensError)
    }

    return new Response(
      JSON.stringify({
        migrated: true,
        message: `Migrated ${sessionsCount} sessions and associated data to user ${user_id}`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
