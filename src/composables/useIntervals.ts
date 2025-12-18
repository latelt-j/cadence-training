import { ref, computed } from 'vue'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

interface WellnessData {
  id: string
  ctl: number
  atl: number
  rampRate: number
  ctlLoad: number
  atlLoad: number
  sportInfo?: Record<string, { ctl: number; atl: number }>
  updated: string
  // Wellness fields
  weight?: number
  restingHR?: number
  hrv?: number
  hrvSDNN?: number
  rmssd?: number
  lastNightAvg?: number
  mentalEnergy?: number
  muscleEnergy?: number
  sleepQuality?: number
  sleepSecs?: number
  sleepScore?: number
  avgSleepingHR?: number
  spO2?: number
  readiness?: number
}

const isLoading = ref(false)
const error = ref<string | null>(null)
const todayWellness = ref<WellnessData | null>(null)
const wellnessHistory = ref<WellnessData[]>([])

export function useIntervals() {

  const fetchWellness = async (startDate: string, endDate: string): Promise<WellnessData[]> => {
    isLoading.value = true
    error.value = null

    try {
      // Use Edge Function proxy instead of direct API call
      const endpoint = `/athlete/{athleteId}/wellness?oldest=${startDate}&newest=${endDate}`

      const response = await fetch(`${SUPABASE_URL}/functions/v1/intervals-proxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ endpoint }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || `Erreur API Intervals: ${response.status}`)
      }

      const data = await response.json()
      wellnessHistory.value = data
      return data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erreur inconnue'
      console.error('Fetch error:', e)
      return []
    } finally {
      isLoading.value = false
    }
  }

  const fetchTodayWellness = (): WellnessData | null => {
    const today = new Date().toISOString().split('T')[0]
    const todayData = wellnessHistory.value.find(w => w.id === today)

    if (todayData) {
      todayWellness.value = todayData
      return todayData
    }
    return null
  }

  const fetchWellnessRange = async (days: number = 42): Promise<WellnessData[]> => {
    const endDate = new Date().toISOString().split('T')[0] ?? ''
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0] ?? ''

    return fetchWellness(startDate, endDate)
  }

  // Computed values for easy access
  // HRV can be in different fields depending on the source (Garmin uses lastNightAvg)
  const currentHRV = computed(() =>
    todayWellness.value?.hrv ??
    todayWellness.value?.hrvSDNN ??
    todayWellness.value?.rmssd ??
    todayWellness.value?.lastNightAvg ??
    null
  )
  const currentRestingHR = computed(() => todayWellness.value?.restingHR ?? null)
  const currentCTL = computed(() => todayWellness.value?.ctl ?? null)
  const currentATL = computed(() => todayWellness.value?.atl ?? null)
  const currentTSB = computed(() => {
    if (todayWellness.value?.ctl !== undefined && todayWellness.value?.atl !== undefined) {
      return Math.round(todayWellness.value.ctl - todayWellness.value.atl)
    }
    return null
  })
  const currentReadiness = computed(() => todayWellness.value?.readiness ?? null)
  const currentSleepScore = computed(() => todayWellness.value?.sleepScore ?? null)

  // Form status based on TSB
  const formStatus = computed(() => {
    const tsb = currentTSB.value
    if (tsb === null) return null

    if (tsb > 15) return { label: 'Frais', color: 'text-cyan-500', icon: '❄️' }
    if (tsb > 5) return { label: 'Forme', color: 'text-emerald-500', icon: '💪' }
    if (tsb > -10) return { label: 'Optimal', color: 'text-green-500', icon: '🎯' }
    if (tsb > -25) return { label: 'Fatigué', color: 'text-orange-500', icon: '😓' }
    return { label: 'Épuisé', color: 'text-rose-600', icon: '🛑' }
  })

  return {
    isLoading,
    error,
    todayWellness,
    wellnessHistory,
    fetchTodayWellness,
    fetchWellnessRange,
    currentHRV,
    currentRestingHR,
    currentCTL,
    currentATL,
    currentTSB,
    currentReadiness,
    currentSleepScore,
    formStatus,
  }
}
