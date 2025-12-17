export type Sport = 'cycling' | 'running' | 'strength'

export interface StructurePhase {
  phase: 'warmup' | 'work' | 'rest' | 'cooldown'
  min: number
  reps?: number
  ftp_pct?: [number, number]
  hr_max_pct?: [number, number]
  terrain?: string
}

export interface SessionTemplate {
  sport: Sport
  type: string
  title: string
  duration_min: number
  description: string
  structure: StructurePhase[]
  // Données réelles (optionnel, ex: depuis Strava)
  actual_km?: number
  actual_elevation?: number
}

export interface ScheduledSession extends SessionTemplate {
  id: string
  date: string // ISO date string YYYY-MM-DD
}

export interface WeeklyStats {
  cycling: {
    hours: number
    km: number
    elevation: number
  }
  running: {
    hours: number
    km: number
    elevation: number
  }
  strength: {
    hours: number
  }
  total: {
    hours: number
    sessions: number
  }
}

export const SPORT_CONFIG: Record<Sport, { emoji: string; label: string; color: string }> = {
  cycling: { emoji: '🚴', label: 'Vélo', color: 'success' },
  running: { emoji: '🏃', label: 'Course', color: 'warning' },
  strength: { emoji: '💪', label: 'Renfo', color: 'error' },
}

// Estimation constants
export const ESTIMATES = {
  cycling: {
    avgSpeedKmh: 28, // Average speed in km/h
    avgElevationPerHour: 500, // D+ per hour
  },
  running: {
    avgSpeedKmh: 60 / 6.5, // 6:30/km = ~9.23 km/h
  },
}
