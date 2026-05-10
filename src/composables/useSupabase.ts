import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { ref } from 'vue'
import type { ScheduledSession, StructurePhase, StravaLap, TrainingPhase, TrainingObjective, Sport } from '../types/session'

// Database types
interface DbSession {
  id: string
  user_id: number | null
  sport: Sport
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
  // Cycling metrics
  normalized_power: number | null
  device_watts: boolean | null
  suffer_score: number | null
  kilojoules: number | null
  calories: number | null
  intensity_factor: number | null
  variability_index: number | null
  aerobic_decoupling: number | null
  average_vam: number | null
  // Planned intensity (1-10)
  intensity: number | null
  // Zwift workout XML
  zwift_workout: string | null
  // Planned session info (when replaced by Strava)
  planned_title: string | null
  planned_description: string | null
  // User-provided context from Strava
  perceived_exertion: number | null
  private_note: string | null
  strava_description: string | null
  created_at: string
  updated_at: string
}

interface DbUserSettings {
  user_id: number
  theme: string
  intervals_athlete_id: string | null
  intervals_api_key: string | null
  training_phases: TrainingPhase[] | null
  training_objectives: TrainingObjective[] | null
  // Athlete profile
  ftp: number | null
  max_hr: number | null
  resting_hr: number | null
  environment: string | null
  // AI API key (stored securely in DB)
  gemini_api_key: string | null
  updated_at: string
}

interface DbOAuthTokens {
  id: number
  user_id: number | null
  provider: 'strava' | 'google'
  access_token: string
  refresh_token: string
  expires_at: number
  updated_at: string
}

interface DbWeeklyGuidelines {
  id: number
  user_id: number | null
  week_start: string
  guidelines: string
  created_at: string
  updated_at: string
}

// Singleton client
let supabase: SupabaseClient | null = null
let currentUserId: number | null = null

const isInitialized = ref(false)
const initError = ref<string | null>(null)

export function useSupabase() {
  const setCurrentUser = (userId: number | null) => {
    if (currentUserId !== userId) {
      currentUserId = userId
      supabase = null // Force recreation with new headers
    }
  }

  const getCurrentUserId = (): number | null => {
    return currentUserId
  }

  const getClient = (): SupabaseClient => {
    if (!supabase) {
      const url = import.meta.env.VITE_SUPABASE_URL
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

      if (!url || !anonKey) {
        throw new Error('Supabase URL and Anon Key must be set in environment variables')
      }

      supabase = createClient(url, anonKey, {
        global: {
          headers: currentUserId ? { 'x-user-id': currentUserId.toString() } : {},
        },
      })
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
    if (!currentUserId) return null

    const { data, error } = await getClient()
      .from('user_settings')
      .select('*')
      .eq('user_id', currentUserId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // No rows
      console.error('Error fetching settings:', error)
      throw error
    }

    return data as DbUserSettings
  }

  const updateSettings = async (settings: Partial<DbUserSettings>): Promise<DbUserSettings> => {
    if (!currentUserId) throw new Error('User not authenticated')

    const { data, error } = await getClient()
      .from('user_settings')
      .upsert({ ...settings, user_id: currentUserId }, { onConflict: 'user_id' })
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
    if (!currentUserId) return null

    const { data, error } = await getClient()
      .from('oauth_tokens')
      .select('*')
      .eq('user_id', currentUserId)
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
    tokens: { access_token: string; refresh_token: string; expires_at: number },
    userId?: number
  ): Promise<DbOAuthTokens> => {
    const effectiveUserId = userId ?? currentUserId
    if (!effectiveUserId) throw new Error('User not authenticated')

    const { data, error } = await getClient()
      .from('oauth_tokens')
      .upsert({
        user_id: effectiveUserId,
        provider,
        ...tokens
      }, { onConflict: 'user_id,provider' })
      .select()
      .single()

    if (error) {
      console.error('Error upserting OAuth tokens:', error)
      throw error
    }

    return data as DbOAuthTokens
  }

  const deleteOAuthTokens = async (provider: 'strava' | 'google'): Promise<void> => {
    if (!currentUserId) return

    const { error } = await getClient()
      .from('oauth_tokens')
      .delete()
      .eq('user_id', currentUserId)
      .eq('provider', provider)

    if (error) {
      console.error('Error deleting OAuth tokens:', error)
      throw error
    }
  }

  // Weekly Guidelines
  const fetchWeeklyGuidelines = async (weekStart: string): Promise<string | null> => {
    if (!currentUserId) return null

    const { data, error } = await getClient()
      .from('weekly_guidelines')
      .select('guidelines')
      .eq('user_id', currentUserId)
      .eq('week_start', weekStart)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // No rows
      console.error('Error fetching weekly guidelines:', error)
      throw error
    }

    return (data as DbWeeklyGuidelines)?.guidelines || null
  }

  const upsertWeeklyGuidelines = async (weekStart: string, guidelines: string): Promise<void> => {
    if (!currentUserId) throw new Error('User not authenticated')

    const { error } = await getClient()
      .from('weekly_guidelines')
      .upsert({
        user_id: currentUserId,
        week_start: weekStart,
        guidelines
      }, { onConflict: 'user_id,week_start' })

    if (error) {
      console.error('Error upserting weekly guidelines:', error)
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
    // Cycling metrics
    ...(db.normalized_power !== null && { normalized_power: db.normalized_power }),
    ...(db.device_watts !== null && { device_watts: db.device_watts }),
    ...(db.suffer_score !== null && { suffer_score: db.suffer_score }),
    ...(db.kilojoules !== null && { kilojoules: db.kilojoules }),
    ...(db.calories !== null && { calories: db.calories }),
    ...(db.intensity_factor !== null && { intensity_factor: db.intensity_factor }),
    ...(db.variability_index !== null && { variability_index: db.variability_index }),
    ...(db.aerobic_decoupling !== null && { aerobic_decoupling: db.aerobic_decoupling }),
    ...(db.average_vam !== null && { average_vam: db.average_vam }),
    // Planned intensity
    ...(db.intensity !== null && { intensity: db.intensity }),
    // Zwift workout
    ...(db.zwift_workout && { zwift_workout: db.zwift_workout }),
    // Planned session info
    ...(db.planned_title && { planned_title: db.planned_title }),
    ...(db.planned_description && { planned_description: db.planned_description }),
    // User-provided context from Strava
    ...(db.perceived_exertion !== null && { perceived_exertion: db.perceived_exertion }),
    ...(db.private_note && { private_note: db.private_note }),
    ...(db.strava_description && { strava_description: db.strava_description }),
  })

  const sessionToDb = (session: ScheduledSession): Omit<DbSession, 'created_at' | 'updated_at'> => ({
    id: session.id,
    user_id: currentUserId,
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
    // Cycling metrics
    normalized_power: session.normalized_power ? Math.round(session.normalized_power) : null,
    device_watts: session.device_watts ?? null,
    suffer_score: session.suffer_score ? Math.round(session.suffer_score) : null,
    kilojoules: session.kilojoules ?? null,
    calories: session.calories ? Math.round(session.calories) : null,
    intensity_factor: session.intensity_factor ?? null,
    variability_index: session.variability_index ?? null,
    aerobic_decoupling: session.aerobic_decoupling ?? null,
    average_vam: session.average_vam ? Math.round(session.average_vam) : null,
    // Planned intensity
    intensity: session.intensity ?? null,
    // Zwift workout
    zwift_workout: session.zwift_workout ?? null,
    // Planned session info
    planned_title: session.planned_title ?? null,
    planned_description: session.planned_description ?? null,
    // User-provided context from Strava
    perceived_exertion: session.perceived_exertion ?? null,
    private_note: session.private_note ?? null,
    strava_description: session.strava_description ?? null,
  })

  return {
    getClient,
    setCurrentUser,
    getCurrentUserId,
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
    // Weekly Guidelines
    fetchWeeklyGuidelines,
    upsertWeeklyGuidelines,
  }
}
