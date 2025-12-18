import { ref, computed } from 'vue'
import type { SessionTemplate, Sport, StravaLap } from '../types/session'

const STRAVA_CLIENT_ID = import.meta.env.VITE_STRAVA_CLIENT_ID || '118625'
const REDIRECT_URI = window.location.origin
const STORAGE_KEY = 'strava-tokens'
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

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
  average_heartrate?: number
  max_heartrate?: number
  average_watts?: number
  max_watts?: number
  average_cadence?: number
}

interface StravaDetailedActivity extends StravaActivity {
  laps?: {
    name: string
    elapsed_time: number
    moving_time: number
    distance: number
    average_speed: number
    max_speed: number
    average_heartrate?: number
    max_heartrate?: number
    average_watts?: number
    average_cadence?: number
    total_elevation_gain?: number
  }[]
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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
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

  const fetchActivityDetail = async (activityId: number): Promise<StravaDetailedActivity | null> => {
    try {
      const accessToken = await getValidToken()
      if (!accessToken) return null

      const response = await fetch(
        `https://www.strava.com/api/v3/activities/${activityId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      )

      if (!response.ok) return null

      return await response.json()
    } catch {
      return null
    }
  }

  // Fetch details for specific activities (or all if not specified)
  const fetchActivitiesWithDetails = async (
    days: number = 7,
    activitiesToFetch?: StravaActivity[]
  ): Promise<StravaDetailedActivity[]> => {
    isLoading.value = true
    error.value = null

    try {
      // Use provided activities or fetch all
      const activities = activitiesToFetch ?? await fetchActivities(days)

      // Fetch details for each activity (with laps)
      const detailedActivities: StravaDetailedActivity[] = []

      for (const activity of activities) {
        const detail = await fetchActivityDetail(activity.id)
        if (detail) {
          detailedActivities.push(detail)
        } else {
          // Fallback to basic activity if detail fetch fails
          detailedActivities.push(activity as StravaDetailedActivity)
        }
      }

      return detailedActivities
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

  const convertToSessions = (activities: StravaDetailedActivity[]): { session: SessionTemplate; date: string }[] => {
    return activities
      .map((activity) => {
        const sport = mapStravaToSport(activity)
        if (!sport) return null

        const durationMin = Math.round(activity.moving_time / 60)
        const distanceKm = Math.round(activity.distance / 1000 * 10) / 10
        const date = activity.start_date_local.split('T')[0]

        // Convert Strava laps to our format
        const laps: StravaLap[] = activity.laps?.map(lap => ({
          name: lap.name,
          elapsed_time: lap.elapsed_time,
          moving_time: lap.moving_time,
          distance: lap.distance,
          average_speed: lap.average_speed,
          max_speed: lap.max_speed,
          average_heartrate: lap.average_heartrate,
          max_heartrate: lap.max_heartrate,
          average_watts: lap.average_watts,
          average_cadence: lap.average_cadence,
          total_elevation_gain: lap.total_elevation_gain,
        })) || []

        const session: SessionTemplate = {
          sport,
          type: 'strava',
          title: activity.name,
          duration_min: durationMin,
          description: `${distanceKm} km${activity.total_elevation_gain ? ` • ${Math.round(activity.total_elevation_gain)}m D+` : ''}`,
          structure: [],
          actual_km: distanceKm,
          actual_elevation: activity.total_elevation_gain ? Math.round(activity.total_elevation_gain) : 0,
          strava_id: activity.id,
          laps: laps.length > 0 ? laps : undefined,
          average_heartrate: activity.average_heartrate,
          max_heartrate: activity.max_heartrate,
          average_watts: activity.average_watts,
          max_watts: activity.max_watts,
          average_cadence: activity.average_cadence,
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
    fetchActivityDetail,
    fetchActivitiesWithDetails,
    convertToSessions,
    disconnect,
  }
}
