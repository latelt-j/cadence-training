export type Sport = 'cycling' | 'mtb' | 'running' | 'strength' | 'hiking'

// Training periodization phases
export interface TrainingPhase {
  id: string
  number?: number // Phase number (calculated from order)
  name: string // Base, Build, Peak, Taper, Recovery, etc.
  start_date: string // YYYY-MM-DD
  end_date: string // YYYY-MM-DD
  objectives?: string // Phase objectives
  keywords?: string // Keywords for AI coach (e.g., "Z2, volume, régularité")
  challenge?: string // Optional challenge for the phase
  // Legacy fields (kept for backwards compatibility)
  description?: string
  goals?: string
}

// Phase info returned by Gemini coach
export interface ImportedPhase {
  name: string
  week: number
  total_weeks: number
  description?: string
}

// Athlete profile for user settings
export interface AthleteProfile {
  ftp?: number // Functional Threshold Power (watts)
  max_hr?: number // Maximum heart rate (bpm)
  resting_hr?: number // Resting heart rate (bpm)
  environment?: string // Training environment context (location, terrain access)
}

// Training objective (race/event)
export interface TrainingObjective {
  id: string
  type: 'trail' | 'road_cycling'
  priority: 'A' | 'B' | 'C' // A = principal, B = secondaire, C = préparation
  name: string
  date: string // YYYY-MM-DD
  distance_km: number
  elevation_gain: number // D+
  elevation_loss?: number // D- (trail only)
}

export interface StructurePhase {
  phase: 'warmup' | 'work' | 'rest' | 'cooldown'
  min: number
  reps?: number
  ftp_pct?: [number, number]
  hr_max_pct?: [number, number]
  terrain?: string
}

// Strava lap data
export interface StravaLap {
  name: string
  elapsed_time: number // seconds
  moving_time: number // seconds
  distance: number // meters
  average_speed: number // m/s
  max_speed: number // m/s
  average_heartrate?: number
  max_heartrate?: number
  average_watts?: number
  average_cadence?: number
  total_elevation_gain?: number
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
  // Strava detailed data
  strava_id?: number
  laps?: StravaLap[]
  average_heartrate?: number
  max_heartrate?: number
  average_watts?: number
  max_watts?: number
  average_cadence?: number
  // Coach feedback
  coach_feedback?: string
  // Planned session info (when Strava activity replaces a planned session)
  planned_title?: string
  planned_description?: string
  // Zwift workout XML (for cycling sessions)
  zwift_workout?: string
  // Cycling metrics (from Strava API)
  normalized_power?: number // Weighted average watts (NP)
  device_watts?: boolean // true if power from real sensor
  suffer_score?: number // Strava Relative Effort
  kilojoules?: number // Total work
  calories?: number // Estimated calories
  // Calculated cycling metrics (from streams)
  intensity_factor?: number // NP / FTP
  variability_index?: number // NP / avg_watts
  aerobic_decoupling?: number // HR/power drift %
  average_vam?: number // Vertical ascent meters/hour
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
    planned: number
    accomplished: number
  }
  running: {
    hours: number
    km: number
    elevation: number
    planned: number
    accomplished: number
  }
  strength: {
    hours: number
    planned: number
    accomplished: number
  }
  total: {
    hours: number
    sessions: number
  }
  // Planned vs Accomplished (global)
  planned: {
    hours: number
    sessions: number
  }
  accomplished: {
    hours: number
    sessions: number
  }
}

export const SPORT_CONFIG: Record<Sport, { emoji: string; label: string; color: string }> = {
  cycling: { emoji: '🚴', label: 'Vélo', color: 'success' },
  mtb: { emoji: '🚵', label: 'VTT', color: 'success' },
  running: { emoji: '🏃', label: 'Course', color: 'warning' },
  strength: { emoji: '💪', label: 'Renfo', color: 'error' },
  hiking: { emoji: '🥾', label: 'Rando', color: 'info' },
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
