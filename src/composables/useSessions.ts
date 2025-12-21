import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type { SessionTemplate, ScheduledSession, WeeklyStats, Sport } from '../types/session'
import { ESTIMATES } from '../types/session'
import { useSupabase } from './useSupabase'

const STORAGE_KEY = 'training-planner-sessions'

const sessions = ref<ScheduledSession[]>([])
const isLoading = ref(false)
const isSynced = ref(false)
const syncError = ref<string | null>(null)

export function useSessions() {
  const {
    fetchSessions,
    createSession: dbCreateSession,
    updateSession: dbUpdateSession,
    deleteSession: dbDeleteSession,
    upsertSessions: dbUpsertSessions,
  } = useSupabase()

  // Load from localStorage as cache first (instant display)
  const loadFromCache = () => {
    const savedData = localStorage.getItem(STORAGE_KEY)
    if (savedData) {
      let parsedSessions: ScheduledSession[] = JSON.parse(savedData)
      // Migration: convert old sessions
      parsedSessions = parsedSessions.map((s: ScheduledSession & { name?: string }) => {
        let updated = s
        if (!s.title && s.name) {
          updated = { ...updated, title: s.name }
        }
        if (s.type !== 'strava' && (s.actual_km || s.actual_elevation)) {
          updated = { ...updated, type: 'strava' }
        }
        return updated
      })
      sessions.value = parsedSessions
    }
  }

  // Sync from Supabase
  const syncFromSupabase = async () => {
    isLoading.value = true
    syncError.value = null
    console.log('Syncing from Supabase...')
    try {
      const dbSessions = await fetchSessions()
      console.log('Fetched sessions from Supabase:', dbSessions)
      sessions.value = dbSessions
      // Update local cache
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dbSessions))
      isSynced.value = true
    } catch (error) {
      console.error('Error syncing from Supabase:', error)
      syncError.value = error instanceof Error ? error.message : 'Erreur de synchronisation'
      // Keep using localStorage data if sync fails
    } finally {
      isLoading.value = false
    }
  }

  // Save to localStorage (for cache) and debounced Supabase sync
  const saveToCache = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.value))
  }

  // Initialize: load cache immediately, then sync with Supabase
  const init = async () => {
    loadFromCache()
    await syncFromSupabase()
  }

  const loadFromJson = async (jsonData: SessionTemplate[] | ScheduledSession[], replaceExisting = false) => {
    const today = new Date().toISOString().split('T')[0] ?? ''
    const newSessions = jsonData.map((item) => {
      // Check if it's already a full ScheduledSession
      if ('id' in item && 'date' in item) {
        return item as ScheduledSession
      }
      // Otherwise create a new session, preserving date if provided
      const itemWithDate = item as SessionTemplate & { date?: string }
      return {
        ...item,
        id: uuidv4(),
        date: itemWithDate.date ?? today,
      } as ScheduledSession
    })

    const sessionsToAdd: ScheduledSession[] = []
    const sessionsToDelete: string[] = []

    // If replaceExisting, remove all non-strava sessions on the dates we're importing
    if (replaceExisting) {
      const importDates = new Set(newSessions.map(s => s.date))
      sessions.value = sessions.value.filter(s => {
        if (importDates.has(s.date) && s.type !== 'strava') {
          sessionsToDelete.push(s.id)
          return false
        }
        return true
      })
    }

    newSessions.forEach(newSession => {
      const key = `${newSession.title}-${newSession.date}`
      const existingIndex = sessions.value.findIndex(
        s => `${s.title}-${s.date}` === key
      )

      if (existingIndex !== -1) {
        const existing = sessions.value[existingIndex]
        if (existing && existing.type !== 'strava') {
          sessions.value[existingIndex] = newSession
          sessionsToAdd.push(newSession)
        }
      } else {
        sessions.value.push(newSession)
        sessionsToAdd.push(newSession)
      }
    })

    saveToCache()

    // Sync deletions to Supabase
    for (const id of sessionsToDelete) {
      try {
        await dbDeleteSession(id)
      } catch (error) {
        console.error('Error deleting session:', error)
      }
    }

    // Sync additions to Supabase
    if (sessionsToAdd.length > 0) {
      try {
        await dbUpsertSessions(sessionsToAdd)
      } catch (error) {
        console.error('Error syncing imported sessions:', error)
      }
    }
  }

  const addSession = async (template: SessionTemplate, date: string): Promise<ScheduledSession> => {
    const newSession: ScheduledSession = {
      ...template,
      id: uuidv4(),
      date,
    }

    console.log('Adding session:', newSession)

    // Optimistic update
    sessions.value.push(newSession)
    saveToCache()

    // Sync to Supabase
    try {
      console.log('Syncing to Supabase...')
      const result = await dbCreateSession(newSession)
      console.log('Supabase result:', result)
    } catch (error) {
      console.error('Error creating session in Supabase:', error)
    }

    return newSession
  }

  const addSessions = async (templates: SessionTemplate[], date: string): Promise<ScheduledSession[]> => {
    const newSessions = templates.map(template => ({
      ...template,
      id: uuidv4(),
      date,
    }))

    console.log('Adding sessions:', newSessions)

    // Optimistic update
    sessions.value.push(...newSessions)
    saveToCache()

    // Sync to Supabase
    try {
      console.log('Syncing sessions to Supabase...')
      const result = await dbUpsertSessions(newSessions)
      console.log('Supabase upsert result:', result)
    } catch (error) {
      console.error('Error creating sessions in Supabase:', error)
    }

    return newSessions
  }

  const updateSessionDate = async (sessionId: string, newDate: string) => {
    const session = sessions.value.find((s) => s.id === sessionId)
    if (session) {
      session.date = newDate
      saveToCache()

      // Sync to Supabase
      try {
        await dbUpdateSession(session)
      } catch (error) {
        console.error('Error updating session in Supabase:', error)
      }
    }
  }

  const updateSessionFeedback = async (sessionId: string, feedback: string) => {
    const session = sessions.value.find((s) => s.id === sessionId)
    if (session) {
      session.coach_feedback = feedback
      saveToCache()

      // Sync to Supabase
      try {
        await dbUpdateSession(session)
      } catch (error) {
        console.error('Error updating session feedback in Supabase:', error)
      }
    }
  }

  const removeSession = async (sessionId: string) => {
    const index = sessions.value.findIndex((s) => s.id === sessionId)
    if (index !== -1) {
      sessions.value.splice(index, 1)
      saveToCache()

      // Sync to Supabase
      try {
        await dbDeleteSession(sessionId)
      } catch (error) {
        console.error('Error deleting session in Supabase:', error)
      }
    }
  }

  // Bulk upsert for Strava sync
  const upsertSessions = async (newSessions: ScheduledSession[]) => {
    newSessions.forEach(newSession => {
      const existingIndex = sessions.value.findIndex(s => s.id === newSession.id)
      if (existingIndex !== -1) {
        sessions.value[existingIndex] = newSession
      } else {
        sessions.value.push(newSession)
      }
    })
    saveToCache()

    // Sync to Supabase
    try {
      await dbUpsertSessions(newSessions)
    } catch (error) {
      console.error('Error upserting sessions in Supabase:', error)
    }
  }

  const exportToJson = (): string => {
    const plannedOnly = sessions.value.filter(s => s.type !== 'strava')
    return JSON.stringify(plannedOnly, null, 2)
  }

  const downloadJson = () => {
    const json = exportToJson()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `training-plan-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const reset = async () => {
    // Delete all from Supabase
    const sessionsToDelete = [...sessions.value]
    sessions.value = []
    localStorage.removeItem(STORAGE_KEY)

    for (const session of sessionsToDelete) {
      try {
        await dbDeleteSession(session.id)
      } catch (error) {
        console.error('Error deleting session:', error)
      }
    }
  }

  const currentWeekDate = ref<Date>(new Date())

  const setCurrentWeek = (date: Date) => {
    currentWeekDate.value = date
  }

  const getWeekDates = (date: Date = new Date()): { start: Date; end: Date } => {
    const day = date.getDay()
    const diff = date.getDate() - day + (day === 0 ? -6 : 1)
    const start = new Date(date)
    start.setDate(diff)
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    end.setHours(23, 59, 59, 999)
    return { start, end }
  }

  const weeklyStats = computed((): WeeklyStats => {
    const { start, end } = getWeekDates(currentWeekDate.value)

    const weekSessions = sessions.value.filter((s) => {
      const sessionDate = new Date(s.date)
      return sessionDate >= start && sessionDate <= end
    })

    const stats: WeeklyStats = {
      cycling: { hours: 0, km: 0, elevation: 0, planned: 0, accomplished: 0 },
      running: { hours: 0, km: 0, elevation: 0, planned: 0, accomplished: 0 },
      strength: { hours: 0, planned: 0, accomplished: 0 },
      total: { hours: 0, sessions: weekSessions.length },
      planned: { hours: 0, sessions: 0 },
      accomplished: { hours: 0, sessions: 0 },
    }

    weekSessions.forEach((session) => {
      const hours = session.duration_min / 60
      const sport = session.sport as Sport
      const isAccomplished = session.type === 'strava'

      if (sport === 'cycling') {
        stats.cycling.hours += hours
        stats.cycling.km += session.actual_km ?? hours * ESTIMATES.cycling.avgSpeedKmh
        stats.cycling.elevation += session.actual_elevation ?? 0
        if (isAccomplished) {
          stats.cycling.accomplished += hours
        } else {
          stats.cycling.planned += hours
        }
      } else if (sport === 'running') {
        stats.running.hours += hours
        stats.running.km += session.actual_km ?? hours * ESTIMATES.running.avgSpeedKmh
        stats.running.elevation += session.actual_elevation ?? 0
        if (isAccomplished) {
          stats.running.accomplished += hours
        } else {
          stats.running.planned += hours
        }
      } else if (sport === 'strength') {
        stats.strength.hours += hours
        if (isAccomplished) {
          stats.strength.accomplished += hours
        } else {
          stats.strength.planned += hours
        }
      }

      stats.total.hours += hours

      // Track planned vs accomplished (global)
      if (isAccomplished) {
        stats.accomplished.hours += hours
        stats.accomplished.sessions++
      } else {
        stats.planned.hours += hours
        stats.planned.sessions++
      }
    })

    return stats
  })

  return {
    sessions,
    isLoading,
    isSynced,
    syncError,
    init,
    syncFromSupabase,
    loadFromJson,
    addSession,
    addSessions,
    updateSessionDate,
    updateSessionFeedback,
    removeSession,
    upsertSessions,
    exportToJson,
    downloadJson,
    reset,
    weeklyStats,
    setCurrentWeek,
  }
}
