import { ref, computed } from 'vue'
import type { SessionTemplate, Sport } from '../types/session'

const STRAVA_CLIENT_ID = import.meta.env.VITE_STRAVA_CLIENT_ID || '118625'
const REDIRECT_URI = window.location.origin
const STORAGE_KEY = 'strava-tokens'
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

interface StravaTokens {
  access_token: string
  refresh_token: string
  expires_at: number
}

interface StravaActivity {
  id: number
  name: string
  type: string
  sport_type: string
  start_date_local: string
  moving_time: number // seconds
  distance: number // meters
  total_elevation_gain: number
}

const tokens = ref<StravaTokens | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

// Load tokens from localStorage
const savedTokens = localStorage.getItem(STORAGE_KEY)
if (savedTokens) {
  tokens.value = JSON.parse(savedTokens)
}

export function useStrava() {
  const isConnected = computed(() => tokens.value !== null)

  const saveTokens = (newTokens: StravaTokens) => {
    tokens.value = newTokens
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTokens))
  }

  const clearTokens = () => {
    tokens.value = null
    localStorage.removeItem(STORAGE_KEY)
  }

  const authorize = () => {
    const scope = 'activity:read_all'
    const authUrl = `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${scope}`
    window.location.href = authUrl
  }

  const handleCallback = async (code: string): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      // Use Edge Function instead of direct API call
      const response = await fetch(`${SUPABASE_URL}/functions/v1/strava-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          redirect_uri: REDIRECT_URI,
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Échec de l\'authentification Strava')
      }

      const data = await response.json()
      saveTokens({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: data.expires_at,
      })

      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erreur inconnue'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const refreshAccessToken = async (): Promise<boolean> => {
    if (!tokens.value) return false

    try {
      // Use Edge Function instead of direct API call
      const response = await fetch(`${SUPABASE_URL}/functions/v1/strava-refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refresh_token: tokens.value.refresh_token,
        }),
      })

      if (!response.ok) {
        clearTokens()
        return false
      }

      const data = await response.json()
      saveTokens({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: data.expires_at,
      })

      return true
    } catch {
      clearTokens()
      return false
    }
  }

  const getValidToken = async (): Promise<string | null> => {
    if (!tokens.value) return null

    // Check if token is expired (with 60s buffer)
    const now = Math.floor(Date.now() / 1000)
    if (tokens.value.expires_at < now + 60) {
      const refreshed = await refreshAccessToken()
      if (!refreshed) return null
    }

    return tokens.value!.access_token
  }

  const fetchActivities = async (days: number = 7): Promise<StravaActivity[]> => {
    isLoading.value = true
    error.value = null

    try {
      const accessToken = await getValidToken()
      if (!accessToken) {
        throw new Error('Non connecté à Strava')
      }

      const after = Math.floor(Date.now() / 1000) - days * 24 * 60 * 60
      const response = await fetch(
        `https://www.strava.com/api/v3/athlete/activities?after=${after}&per_page=100`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      )

      if (!response.ok) {
        if (response.status === 401) {
          clearTokens()
          throw new Error('Session expirée, reconnectez-vous')
        }
        throw new Error('Erreur lors de la récupération des activités')
      }

      return await response.json()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erreur inconnue'
      return []
    } finally {
      isLoading.value = false
    }
  }

  const mapStravaToSport = (activity: StravaActivity): Sport | null => {
    const type = activity.sport_type || activity.type
    const cyclingTypes = ['Ride', 'VirtualRide', 'MountainBikeRide', 'GravelRide', 'EBikeRide']
    const runningTypes = ['Run', 'TrailRun', 'VirtualRun', 'Treadmill', 'Soccer', 'Football']
    const strengthTypes = ['WeightTraining', 'Workout', 'Crossfit', 'Yoga', 'HIIT']

    if (cyclingTypes.includes(type)) return 'cycling'
    if (runningTypes.includes(type)) return 'running'
    if (strengthTypes.includes(type)) return 'strength'

    return null
  }

  const convertToSessions = (activities: StravaActivity[]): { session: SessionTemplate; date: string }[] => {
    return activities
      .map((activity) => {
        const sport = mapStravaToSport(activity)
        if (!sport) return null

        const durationMin = Math.round(activity.moving_time / 60)
        const distanceKm = Math.round(activity.distance / 1000 * 10) / 10
        const date = activity.start_date_local.split('T')[0]

        const session: SessionTemplate = {
          sport,
          type: 'strava',
          title: activity.name,
          duration_min: durationMin,
          description: `${distanceKm} km${activity.total_elevation_gain ? ` • ${Math.round(activity.total_elevation_gain)}m D+` : ''}`,
          structure: [],
          actual_km: distanceKm,
          actual_elevation: activity.total_elevation_gain ? Math.round(activity.total_elevation_gain) : 0,
        }

        return { session, date }
      })
      .filter((item): item is { session: SessionTemplate; date: string } => item !== null)
  }

  const disconnect = () => {
    clearTokens()
  }

  return {
    isConnected,
    isLoading,
    error,
    authorize,
    handleCallback,
    fetchActivities,
    convertToSessions,
    disconnect,
  }
}
