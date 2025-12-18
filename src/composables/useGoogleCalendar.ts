import { ref, computed } from 'vue'
import type { ScheduledSession } from '../types/session'
import { SPORT_CONFIG } from '../types/session'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const REDIRECT_URI = window.location.origin
const STORAGE_KEY = 'google-calendar-tokens'
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

interface GoogleTokens {
  access_token: string
  refresh_token: string
  expires_at: number
}

const tokens = ref<GoogleTokens | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

// Load tokens from localStorage
const savedTokens = localStorage.getItem(STORAGE_KEY)
if (savedTokens) {
  tokens.value = JSON.parse(savedTokens)
}

export function useGoogleCalendar() {
  const isConnected = computed(() => tokens.value !== null)

  const saveTokens = (newTokens: GoogleTokens) => {
    tokens.value = newTokens
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTokens))
  }

  const clearTokens = () => {
    tokens.value = null
    localStorage.removeItem(STORAGE_KEY)
  }

  const authorize = () => {
    const scope = 'https://www.googleapis.com/auth/calendar.events'
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: scope,
      access_type: 'offline',
      prompt: 'consent',
      state: 'google',
    })
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  }

  const handleCallback = async (code: string): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      // Use Edge Function instead of direct API call
      const response = await fetch(`${SUPABASE_URL}/functions/v1/google-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          code,
          redirect_uri: REDIRECT_URI,
          grant_type: 'authorization_code',
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Échec de l\'authentification Google')
      }

      const data = await response.json()
      saveTokens({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
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
    if (!tokens.value?.refresh_token) return false

    try {
      // Use Edge Function instead of direct API call
      const response = await fetch(`${SUPABASE_URL}/functions/v1/google-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          refresh_token: tokens.value.refresh_token,
          grant_type: 'refresh_token',
        }),
      })

      if (!response.ok) {
        clearTokens()
        return false
      }

      const data = await response.json()
      saveTokens({
        access_token: data.access_token,
        refresh_token: data.refresh_token || tokens.value.refresh_token,
        expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
      })

      return true
    } catch {
      clearTokens()
      return false
    }
  }

  const getValidToken = async (): Promise<string | null> => {
    if (!tokens.value) return null

    const now = Math.floor(Date.now() / 1000)
    if (tokens.value.expires_at < now + 60) {
      const refreshed = await refreshAccessToken()
      if (!refreshed) return null
    }

    return tokens.value!.access_token
  }

  const syncToCalendar = async (sessions: ScheduledSession[]): Promise<{ added: number; updated: number }> => {
    isLoading.value = true
    error.value = null

    let added = 0
    let updated = 0

    try {
      const accessToken = await getValidToken()
      if (!accessToken) {
        throw new Error('Non connecté à Google')
      }

      // Filter to current week only
      const now = new Date()
      const day = now.getDay()
      const diff = now.getDate() - day + (day === 0 ? -6 : 1)
      const weekStart = new Date(now)
      weekStart.setDate(diff)
      weekStart.setHours(0, 0, 0, 0)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      weekEnd.setHours(23, 59, 59, 999)

      const weekSessions = sessions.filter(s => {
        const sessionDate = new Date(s.date)
        return sessionDate >= weekStart && sessionDate <= weekEnd
      })

      for (const session of weekSessions) {
        const config = SPORT_CONFIG[session.sport]
        const eventId = session.id.replace(/-/g, '').toLowerCase()

        const event = {
          id: eventId,
          summary: `${config.emoji} ${session.title}`,
          description: `${session.description || ''}\n\nDurée: ${session.duration_min} min\nType: ${session.type}\n\n📱 Cadence`,
          start: {
            date: session.date,
          },
          end: {
            date: session.date,
          },
          colorId: session.sport === 'cycling' ? '7' : session.sport === 'running' ? '5' : '11',
        }

        // Try to update existing event, or create new one
        try {
          const updateResponse = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
            {
              method: 'PUT',
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(event),
            }
          )

          if (updateResponse.ok) {
            updated++
          } else if (updateResponse.status === 404) {
            // Event doesn't exist, create it (remove id field)
            const { id: _, ...eventWithoutId } = event
            const createResponse = await fetch(
              'https://www.googleapis.com/calendar/v3/calendars/primary/events',
              {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(eventWithoutId),
              }
            )

            if (createResponse.ok) {
              added++
            }
          }
        } catch {
          // Continue with other events
        }
      }

      return { added, updated }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erreur inconnue'
      return { added: 0, updated: 0 }
    } finally {
      isLoading.value = false
    }
  }

  const deleteAllEvents = async (): Promise<number> => {
    isLoading.value = true
    let deleted = 0

    try {
      const accessToken = await getValidToken()
      if (!accessToken) {
        throw new Error('Non connecté à Google')
      }

      // Search for all Cadence events (they have "📱 Cadence" in description)
      const searchResponse = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?q=Cadence&maxResults=500`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )

      if (!searchResponse.ok) {
        return 0
      }

      const data = await searchResponse.json()
      const events = data.items || []

      for (const event of events) {
        // Verify it's a Cadence event
        if (event.description?.includes('📱 Cadence')) {
          try {
            const response = await fetch(
              `https://www.googleapis.com/calendar/v3/calendars/primary/events/${event.id}`,
              {
                method: 'DELETE',
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            )

            if (response.ok || response.status === 204) {
              deleted++
            }
          } catch {
            // Continue with other events
          }
        }
      }

      return deleted
    } catch {
      return 0
    } finally {
      isLoading.value = false
    }
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
    syncToCalendar,
    deleteAllEvents,
    disconnect,
  }
}
