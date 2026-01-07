<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ScheduledSession } from '../types/session'
import { SPORT_CONFIG, type Sport } from '../types/session'

// Helper to get sport emoji with type safety
const getSportEmoji = (sport: Sport) => SPORT_CONFIG[sport]?.emoji ?? '🏃'

const props = defineProps<{
  isOpen: boolean
  sessions: ScheduledSession[]
  weekStart: Date
}>()

const emit = defineEmits<{
  close: []
}>()

const copied = ref(false)

// Week dates calculation
const weekDates = computed(() => {
  const dates: { date: string; dayName: string; dayNumber: number }[] = []
  const start = new Date(props.weekStart)
  for (let i = 0; i < 7; i++) {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    dates.push({
      date: `${year}-${month}-${day}`,
      dayName: date.toLocaleDateString('fr-FR', { weekday: 'short' }).toUpperCase().slice(0, 3),
      dayNumber: date.getDate(),
    })
  }
  return dates
})

// Format week range for header
const weekRange = computed(() => {
  const start = new Date(props.weekStart)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)

  const startStr = start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
  const endStr = end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  return `${startStr} - ${endStr}`
})

// Sessions grouped by date
const sessionsByDate = computed(() => {
  const map: Record<string, ScheduledSession[]> = {}
  props.sessions.forEach(session => {
    if (!map[session.date]) map[session.date] = []
    map[session.date]!.push(session)
  })
  return map
})

// Helper to get sessions for a date (for template)
const getSessionsForDate = (date: string) => sessionsByDate.value[date] ?? []

// Stats
const weekSessions = computed(() => {
  const start = weekDates.value[0]?.date ?? ''
  const end = weekDates.value[6]?.date ?? ''
  return props.sessions.filter(s => s.date >= start && s.date <= end)
})

const doneSessions = computed(() => weekSessions.value.filter(s => s.type === 'strava' || s.type === 'manual'))
const plannedSessions = computed(() => weekSessions.value.filter(s => s.type === 'planned'))

const doneHours = computed(() => doneSessions.value.reduce((sum, s) => sum + s.duration_min / 60, 0))
const plannedHours = computed(() => plannedSessions.value.reduce((sum, s) => sum + s.duration_min / 60, 0))

const formatHours = (hours: number) => {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h${m.toString().padStart(2, '0')}`
}

const formatDuration = (min: number) => {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h${m.toString().padStart(2, '0')}`
}

// Smart tagline
const pickRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)] ?? arr[0]

const taglineKey = ref(0) // Force re-compute on modal open

watch(() => props.isOpen, (open) => {
  if (open) taglineKey.value++
})

const smartTagline = computed(() => {
  void taglineKey.value // Dependency for re-computation

  const done = doneSessions.value.length
  const planned = plannedSessions.value.length
  const total = done + planned
  const completionRate = total > 0 ? done / total : 0

  // Semaine complète (100%)
  if (completionRate === 1 && done > 0) {
    return pickRandom([
      "Objectif atteint, mission accomplie 🏆",
      "Semaine parfaite, bravo champion 💪",
      "100% réalisé, tu gères 🔥",
    ])
  }

  // Bonne progression (>70%)
  if (completionRate > 0.7) {
    return pickRandom([
      "La régularité paie toujours ⚡",
      "Sur la bonne voie 🎯",
      "Continue comme ça 💪",
    ])
  }

  // Début de semaine / beaucoup prévu
  if (planned > done) {
    return pickRandom([
      "Les objectifs sont clairs 🎯",
      "Semaine chargée en vue 🔥",
      "Ready to crush it 💪",
    ])
  }

  // Grosse semaine (>6h)
  if (doneHours.value > 6) {
    return pickRandom([
      "Grosse semaine d'entraînement 🔥",
      "Le travail paie toujours 💪",
      "Beast mode activé ⚡",
    ])
  }

  // Default
  return pickRandom([
    "Chaque séance compte 🎯",
    "Train hard, recover harder 💪",
    "La constance fait la différence ⚡",
  ])
})

// Copy text for sharing
const copyBilan = async () => {
  const lines: string[] = []

  lines.push(`📅 MA SEMAINE`)
  lines.push(weekRange.value)
  lines.push('')

  // Done sessions
  if (doneSessions.value.length > 0) {
    lines.push(`✅ RÉALISÉ (${doneSessions.value.length} séances • ${formatHours(doneHours.value)})`)
    doneSessions.value.forEach(s => {
      const emoji = SPORT_CONFIG[s.sport]?.emoji ?? '🏃'
      const date = new Date(s.date).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit' })
      lines.push(`  • ${date} - ${emoji} ${s.title} (${formatDuration(s.duration_min)})`)
    })
    lines.push('')
  }

  // Planned sessions
  if (plannedSessions.value.length > 0) {
    lines.push(`📋 PRÉVU (${plannedSessions.value.length} séances • ${formatHours(plannedHours.value)})`)
    plannedSessions.value.forEach(s => {
      const emoji = SPORT_CONFIG[s.sport]?.emoji ?? '🏃'
      const date = new Date(s.date).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit' })
      lines.push(`  • ${date} - ${emoji} ${s.title} (${formatDuration(s.duration_min)})`)
    })
    lines.push('')
  }

  lines.push(`"${smartTagline.value}"`)
  lines.push('')
  lines.push('Powered by Cadence 🎯')

  await navigator.clipboard.writeText(lines.join('\n'))
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}
</script>

<template>
  <dialog class="modal" :class="{ 'modal-open': isOpen }">
    <div class="modal-box w-full h-full max-h-full md:max-w-3xl md:h-auto md:max-h-[90vh] rounded-none md:rounded-3xl bg-base-200 flex flex-col p-6 md:p-8">
      <!-- Close button -->
      <button class="btn btn-circle btn-ghost absolute right-4 top-4 text-xl z-10" @click="emit('close')">✕</button>

      <!-- Header -->
      <div class="text-center mb-6">
        <h2 class="text-3xl font-bold">📅 Ma semaine</h2>
        <p class="text-base-content/60 mt-1">{{ weekRange }}</p>
      </div>

      <!-- Week Grid -->
      <div class="grid grid-cols-7 gap-2 mb-6">
        <div
          v-for="day in weekDates"
          :key="day.date"
          class="text-center"
        >
          <!-- Day header -->
          <div class="text-xs text-base-content/50 font-medium mb-1">{{ day.dayName }}</div>
          <div class="text-sm font-bold mb-2">{{ day.dayNumber }}</div>

          <!-- Sessions for this day -->
          <div class="space-y-1 min-h-[60px]">
            <div
              v-for="session in getSessionsForDate(day.date)"
              :key="session.id"
              class="rounded-lg p-1.5 text-center text-xs"
              :class="[
                session.type === 'planned' ? 'opacity-60 border border-dashed border-base-content/30' : '',
                session.sport === 'cycling' || session.sport === 'mtb' ? 'bg-pink-500/20' : '',
                session.sport === 'running' ? 'bg-sky-500/20' : '',
                session.sport === 'strength' ? 'bg-purple-500/20' : '',
                session.sport === 'hiking' ? 'bg-lime-500/20' : '',
              ]"
            >
              <div class="text-lg">{{ getSportEmoji(session.sport) }}</div>
              <div class="text-[10px] text-base-content/70">{{ formatDuration(session.duration_min) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="flex justify-center gap-6 text-sm mb-6 flex-wrap">
        <span v-if="doneSessions.length > 0" class="text-success">
          ✅ {{ doneSessions.length }} séances • {{ formatHours(doneHours) }}
        </span>
        <span v-if="plannedSessions.length > 0" class="text-base-content/60">
          📋 {{ plannedSessions.length }} séances • {{ formatHours(plannedHours) }}
        </span>
      </div>

      <!-- Divider -->
      <div class="divider my-2"></div>

      <!-- Tagline -->
      <div class="py-6 text-center">
        <p class="text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent">
          "{{ smartTagline }}"
        </p>
      </div>

      <!-- Share button -->
      <div class="flex justify-center mt-4">
        <button
          class="btn border-0 shadow-lg text-white"
          :class="copied ? 'btn-success' : 'bg-pink-500 hover:bg-pink-600 shadow-pink-500/30'"
          @click="copyBilan"
        >
          {{ copied ? '✓ Copié !' : '📋 Copier le bilan' }}
        </button>
      </div>

      <!-- Branding -->
      <p class="text-xs text-base-content/30 text-center mt-6">Powered by Cadence 🎯</p>
    </div>

    <!-- Backdrop -->
    <form method="dialog" class="modal-backdrop bg-black/70 backdrop-blur-sm" @click="emit('close')">
      <button>close</button>
    </form>
  </dialog>
</template>
