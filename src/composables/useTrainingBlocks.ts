import { computed, type Ref } from 'vue'
import type { TrainingPhase, WeekType } from '../types/session'

// Week type configuration
const weekTypeConfig: Record<WeekType, { label: string; emoji: string; color: string }> = {
  charge: { label: 'Charge', emoji: '📈', color: 'bg-emerald-500' },
  surcharge: { label: 'Surcharge', emoji: '🔥', color: 'bg-orange-500' },
  recup: { label: 'Récup', emoji: '🧘', color: 'bg-sky-500' },
}

// Calculate default week type based on 3:1 pattern
const getDefaultWeekType = (weekNumber: number): WeekType => {
  const positionInCycle = ((weekNumber - 1) % 4) + 1
  if (positionInCycle === 4) return 'recup'
  if (positionInCycle === 3) return 'surcharge'
  return 'charge'
}

export function useTrainingBlocks(phases: Ref<TrainingPhase[]>) {
  // Today's date as YYYY-MM-DD
  const todayStr = computed(() => new Date().toISOString().split('T')[0] ?? '')

  // Current block: phase where today is between start_date and end_date
  const currentBlock = computed(() => {
    const today = todayStr.value
    return phases.value.find(p => p.start_date <= today && p.end_date >= today) ?? null
  })

  // Next block: first phase starting after today
  const nextBlock = computed(() => {
    const today = todayStr.value
    return phases.value
      .filter(p => p.start_date > today)
      .sort((a, b) => a.start_date.localeCompare(b.start_date))[0] ?? null
  })

  // Calculate the duration of a phase in weeks
  const getPhaseDuration = (phase: TrainingPhase): number => {
    const start = new Date(phase.start_date)
    const end = new Date(phase.end_date)
    const diffTime = end.getTime() - start.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1
    return Math.ceil(diffDays / 7)
  }

  // Current week number within the current block (1-indexed)
  const currentWeekInBlock = computed(() => {
    if (!currentBlock.value) return 0
    const today = new Date()
    const start = new Date(currentBlock.value.start_date)
    const diffTime = today.getTime() - start.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    return Math.floor(diffDays / 7) + 1
  })

  // Total weeks in current block
  const totalWeeksInCurrentBlock = computed(() => {
    if (!currentBlock.value) return 0
    return getPhaseDuration(currentBlock.value)
  })

  // Current week type (charge/surcharge/recup)
  const currentWeekType = computed(() => {
    if (!currentBlock.value || currentWeekInBlock.value === 0) return null
    const weekNum = currentWeekInBlock.value
    const type = currentBlock.value.week_types?.[weekNum] ?? getDefaultWeekType(weekNum)
    return weekTypeConfig[type]
  })

  // Get week type for a specific week in a phase
  const getWeekType = (phase: TrainingPhase, weekNumber: number) => {
    const type = phase.week_types?.[weekNumber] ?? getDefaultWeekType(weekNumber)
    return weekTypeConfig[type]
  }

  // Get all week types for a phase (for display)
  const getPhaseWeekTypes = (phase: TrainingPhase) => {
    const duration = getPhaseDuration(phase)
    const weeks = []
    for (let i = 1; i <= duration; i++) {
      weeks.push({
        number: i,
        ...getWeekType(phase, i),
      })
    }
    return weeks
  }

  // Format date for display (DD/MM)
  const formatDateShort = (dateStr: string): string => {
    const date = new Date(dateStr)
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`
  }

  // Format date range
  const formatDateRange = (startDate: string, endDate: string): string => {
    return `${formatDateShort(startDate)} - ${formatDateShort(endDate)}`
  }

  return {
    currentBlock,
    nextBlock,
    currentWeekInBlock,
    totalWeeksInCurrentBlock,
    currentWeekType,
    getWeekType,
    getPhaseWeekTypes,
    getPhaseDuration,
    formatDateShort,
    formatDateRange,
    weekTypeConfig,
    getDefaultWeekType,
  }
}
