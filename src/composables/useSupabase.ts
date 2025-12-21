import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { ref } from 'vue'
import type { ScheduledSession, StructurePhase, StravaLap, TrainingPhase } from '../types/session'

// Database types
interface DbSession {
  id: string
  sport: 'cycling' | 'running' | 'strength'
  type: string
  title: string
  date: string
  duration_min: number
  description: string
  structure: StructurePhase[]
  actual_km: number | null
  actual_elevation: number | null
  // Strava detailed data
  strava_id: number | null
  laps: StravaLap[] | null
  average_heartrate: number | null
  max_heartrate: number | null
  average_watts: number | null
  max_watts: number | null
  average_cadence: number | null
  coach_feedback: string | null
  created_at: string
  updated_at: string
}

interface DbUserSettings {
  id: number
  theme: string
  intervals_athlete_id: string | null
  intervals_api_key: string | null
  training_phases: TrainingPhase[] | null
  updated_at: string
}

interface DbOAuthTokens {
  id: number
  provider: 'strava' | 'google'
  access_token: string
  refresh_token: string
  expires_at: number
  updated_at: string
}

// Singleton client
let supabase: SupabaseClient | null = null

const isInitialized = ref(false)
const initError = ref<string | null>(null)

export function useSupabase() {
  const getClient = (): SupabaseClient => {
    if (!supabase) {
      const url = import.meta.env.VITE_SUPABASE_URL
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

      if (!url || !anonKey) {
        throw new Error('Supabase URL and Anon Key must be set in environment variables')
      }

      supabase = createClient(url, anonKey)
      isInitialized.value = true
    }
    return supabase
  }

  // Sessions CRUD
  const fetchSessions = async (): Promise<ScheduledSession[]> => {
    const { data, error } = await getClient()
      .from('sessions')
      .select('*')
      .order('date', { ascending: true })

    if (error) {
      console.error('Error fetching sessions:', error)
      throw error
    }

    return (data as DbSession[]).map(dbToSession)
  }

  const createSession = async (session: ScheduledSession): Promise<ScheduledSession> => {
    const dbSession = sessionToDb(session)

    const { data, error } = await getClient()
      .from('sessions')
      .insert(dbSession)
      .select()
      .single()

    if (error) {
      console.error('Error creating session:', error)
      throw error
    }

    return dbToSession(data as DbSession)
  }

  const updateSession = async (session: ScheduledSession): Promise<ScheduledSession> => {
    const dbSession = sessionToDb(session)

    const { data, error } = await getClient()
      .from('sessions')
      .update(dbSession)
      .eq('id', session.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating session:', error)
      throw error
    }

    return dbToSession(data as DbSession)
  }

  const deleteSession = async (id: string): Promise<void> => {
    const { error } = await getClient()
      .from('sessions')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting session:', error)
      throw error
    }
  }

  const upsertSession = async (session: ScheduledSession): Promise<ScheduledSession> => {
    const dbSession = sessionToDb(session)

    const { data, error } = await getClient()
      .from('sessions')
      .upsert(dbSession, { onConflict: 'id' })
      .select()
      .single()

    if (error) {
      console.error('Error upserting session:', error)
      throw error
    }

    return dbToSession(data as DbSession)
  }

  const upsertSessions = async (sessions: ScheduledSession[]): Promise<ScheduledSession[]> => {
    if (sessions.length === 0) return []

    // Deduplicate by ID (keep last occurrence)
    const uniqueMap = new Map<string, ScheduledSession>()
    sessions.forEach(s => uniqueMap.set(s.id, s))
    const uniqueSessions = Array.from(uniqueMap.values())

    const dbSessions = uniqueSessions.map(sessionToDb)

    console.log('Upserting unique sessions:', dbSessions.length)

    const { data, error } = await getClient()
      .from('sessions')
      .upsert(dbSessions, { onConflict: 'id' })
      .select()

    if (error) {
      console.error('Error upserting sessions:', error)
      throw error
    }

    return (data as DbSession[]).map(dbToSession)
  }

  const deleteSessionsByDateAndType = async (date: string, excludeType: string): Promise<void> => {
    const { error } = await getClient()
      .from('sessions')
      .delete()
      .eq('date', date)
      .neq('type', excludeType)

    if (error) {
      console.error('Error deleting sessions by date:', error)
      throw error
    }
  }

  // User Settings
  const fetchSettings = async (): Promise<DbUserSettings | null> => {
    const { data, error } = await getClient()
      .from('user_settings')
      .select('*')
      .eq('id', 1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // No rows
      console.error('Error fetching settings:', error)
      throw error
    }

    return data as DbUserSettings
  }

  const updateSettings = async (settings: Partial<DbUserSettings>): Promise<DbUserSettings> => {
    const { data, error } = await getClient()
      .from('user_settings')
      .update(settings)
      .eq('id', 1)
      .select()
      .single()

    if (error) {
      console.error('Error updating settings:', error)
      throw error
    }

    return data as DbUserSettings
  }

  // OAuth Tokens
  const fetchOAuthTokens = async (provider: 'strava' | 'google'): Promise<DbOAuthTokens | null> => {
    const { data, error } = await getClient()
      .from('oauth_tokens')
      .select('*')
      .eq('provider', provider)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // No rows
      console.error('Error fetching OAuth tokens:', error)
      throw error
    }

    return data as DbOAuthTokens
  }

  const upsertOAuthTokens = async (
    provider: 'strava' | 'google',
    tokens: { access_token: string; refresh_token: string; expires_at: number }
  ): Promise<DbOAuthTokens> => {
    const { data, error } = await getClient()
      .from('oauth_tokens')
      .upsert({
        id: provider === 'strava' ? 1 : 2,
        provider,
        ...tokens
      }, { onConflict: 'provider' })
      .select()
      .single()

    if (error) {
      console.error('Error upserting OAuth tokens:', error)
      throw error
    }

    return data as DbOAuthTokens
  }

  const deleteOAuthTokens = async (provider: 'strava' | 'google'): Promise<void> => {
    const { error } = await getClient()
      .from('oauth_tokens')
      .delete()
      .eq('provider', provider)

    if (error) {
      console.error('Error deleting OAuth tokens:', error)
      throw error
    }
  }

  // Helpers
  const dbToSession = (db: DbSession): ScheduledSession => ({
    id: db.id,
    sport: db.sport,
    type: db.type,
    title: db.title,
    date: db.date,
    duration_min: db.duration_min,
    description: db.description || '',
    structure: db.structure || [],
    ...(db.actual_km !== null && { actual_km: db.actual_km }),
    ...(db.actual_elevation !== null && { actual_elevation: db.actual_elevation }),
    ...(db.strava_id !== null && { strava_id: db.strava_id }),
    ...(db.laps && db.laps.length > 0 && { laps: db.laps }),
    ...(db.average_heartrate !== null && { average_heartrate: db.average_heartrate }),
    ...(db.max_heartrate !== null && { max_heartrate: db.max_heartrate }),
    ...(db.average_watts !== null && { average_watts: db.average_watts }),
    ...(db.max_watts !== null && { max_watts: db.max_watts }),
    ...(db.average_cadence !== null && { average_cadence: db.average_cadence }),
    ...(db.coach_feedback && { coach_feedback: db.coach_feedback }),
  })

  const sessionToDb = (session: ScheduledSession): Omit<DbSession, 'created_at' | 'updated_at'> => ({
    id: session.id,
    sport: session.sport,
    type: session.type,
    title: session.title,
    date: session.date,
    duration_min: session.duration_min,
    description: session.description || '',
    structure: session.structure || [],
    actual_km: session.actual_km ?? null,
    actual_elevation: session.actual_elevation ?? null,
    strava_id: session.strava_id ?? null,
    laps: session.laps ?? null,
    average_heartrate: session.average_heartrate ? Math.round(session.average_heartrate) : null,
    max_heartrate: session.max_heartrate ? Math.round(session.max_heartrate) : null,
    average_watts: session.average_watts ? Math.round(session.average_watts) : null,
    max_watts: session.max_watts ? Math.round(session.max_watts) : null,
    average_cadence: session.average_cadence ? Math.round(session.average_cadence) : null,
    coach_feedback: session.coach_feedback ?? null,
  })

  return {
    getClient,
    isInitialized,
    initError,
    // Sessions
    fetchSessions,
    createSession,
    updateSession,
    deleteSession,
    upsertSession,
    upsertSessions,
    deleteSessionsByDateAndType,
    // Settings
    fetchSettings,
    updateSettings,
    // OAuth
    fetchOAuthTokens,
    upsertOAuthTokens,
    deleteOAuthTokens,
  }
}
