<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import type { ScheduledSession, TrainingPhase } from '../types/session'
import { SPORT_CONFIG, type Sport } from '../types/session'

// Helper to get sport emoji with type safety
const getSportEmoji = (sport: Sport) => SPORT_CONFIG[sport]?.emoji ?? '🏃'

const props = defineProps<{
  isOpen: boolean
  sessions: ScheduledSession[]
  weekStart: Date
  trainingPhases?: TrainingPhase[]
}>()

const emit = defineEmits<{
  close: []
}>()

const isDownloading = ref(false)
const captureRef = ref<HTMLElement | null>(null)

// Close on Escape key
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.isOpen) {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

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

// Current phase calculation
const currentPhase = computed(() => {
  if (!props.trainingPhases?.length) return null
  const weekStartStr = weekDates.value[0]?.date ?? ''
  return props.trainingPhases.find(phase => {
    return weekStartStr >= phase.start_date && weekStartStr <= phase.end_date
  }) ?? null
})

// Week number within phase (S1/4, S2/4, etc.)
const phaseWeekInfo = computed(() => {
  if (!currentPhase.value) return null
  const phaseStart = new Date(currentPhase.value.start_date)
  const phaseEnd = new Date(currentPhase.value.end_date)
  const weekStart = new Date(props.weekStart)

  // Calculate week number (1-based)
  const weeksDiff = Math.floor((weekStart.getTime() - phaseStart.getTime()) / (7 * 24 * 60 * 60 * 1000))
  const totalWeeks = Math.ceil((phaseEnd.getTime() - phaseStart.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1

  return {
    current: Math.max(1, weeksDiff + 1),
    total: totalWeeks
  }
})

// Get phase emoji
const getPhaseEmoji = (phaseName: string) => {
  const name = phaseName.toLowerCase()
  if (name.includes('récup') || name.includes('recup')) return '🧘'
  if (name.includes('base') || name.includes('fond')) return '🏔️'
  if (name.includes('spéci') || name.includes('speci')) return '🎯'
  if (name.includes('affût') || name.includes('affut') || name.includes('taper')) return '⚡'
  if (name.includes('prépa') || name.includes('prepa') || name.includes('général')) return '🏋️'
  if (name.includes('compét') || name.includes('compet') || name.includes('race')) return '🏆'
  return '📅'
}

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

// Check if session is completed (strava or manual)
const isSessionDone = (session: ScheduledSession) => session.type === 'strava' || session.type === 'manual'

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

// Download screenshot (lazy load modern-screenshot)
const downloadScreenshot = async () => {
  if (!captureRef.value || isDownloading.value) return

  isDownloading.value = true

  try {
    // Add padding for screenshot
    captureRef.value.style.padding = '24px'

    // Wait for styles to apply
    await new Promise(resolve => setTimeout(resolve, 50))

    // Dynamic import - only load when needed
    const { domToPng } = await import('modern-screenshot')

    const dataUrl = await domToPng(captureRef.value, {
      scale: 2,
      backgroundColor: '#000000',
      // Filter out elements with screenshot-hide class
      filter: (node: Node) => {
        if (node instanceof Element && node.classList.contains('screenshot-hide')) {
          return false
        }
        return true
      },
    })

    // Remove padding after capture
    captureRef.value.style.padding = ''

    // Download
    const a = document.createElement('a')
    a.href = dataUrl
    const dateStr = new Date().toISOString().split('T')[0]
    a.download = `cadence-semaine-${dateStr}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  } catch (error) {
    console.error('Screenshot error:', error)
    alert('Erreur lors de la capture. Vérifiez la console.')
    // Remove padding on error too
    if (captureRef.value) captureRef.value.style.padding = ''
  } finally {
    isDownloading.value = false
  }
}

// Get session class based on completion status
const getSessionClass = (session: ScheduledSession) => {
  const base = 'session-share'
  if (isSessionDone(session)) {
    // Completed = Orange Strava
    return `${base} session-done-share`
  } else {
    // Planned = Sport colors with dashed border
    return `${base} session-${session.sport}-share session-planned-share`
  }
}

// Get intensity color (1-10 scale) - dot style
const getIntensityColor = (intensity: number | undefined): string => {
  if (!intensity) return 'bg-white/40'
  if (intensity <= 3) return 'bg-white/80'      // Récup - blanc
  if (intensity <= 6) return 'bg-yellow-300'    // Modéré - jaune
  if (intensity <= 8) return 'bg-orange-400'    // Dur - orange
  return 'bg-red-500'                            // Intense - rouge
}
</script>

<template>
  <!-- Fullscreen overlay -->
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/95 backdrop-blur-xl"
          @click="emit('close')"
        ></div>

        <!-- Modal container -->
        <div class="relative z-10 flex flex-col items-center max-w-3xl w-full">
          <!-- Screenshot wrapper with black padding (padding added during capture) -->
          <div ref="captureRef" class="screenshot-wrapper rounded-[2rem] w-full">
            <!-- Modal wrapper with animated border -->
            <div class="modal-border-wrapper">
            <div class="modal-card rounded-3xl w-full max-h-[80vh] overflow-auto shadow-2xl relative">
              <!-- Close button -->
              <button
                class="btn btn-circle btn-sm btn-ghost absolute right-3 top-3 text-lg z-30 screenshot-hide"
                @click.stop="emit('close')"
              >
                ✕
              </button>
              <!-- Content area -->
              <div class="capture-area p-6 md:p-8 rounded-3xl">
            <!-- Header -->
            <div class="text-center mb-8">
              <div class="flex items-center justify-center gap-3 flex-wrap">
                <h2 class="text-2xl md:text-3xl font-bold break-words">
                  {{ currentPhase ? `${currentPhase.emoji || getPhaseEmoji(currentPhase.name)} ${currentPhase.name.toUpperCase()}` : '📅 Ma semaine' }}
                </h2>
                <span v-if="phaseWeekInfo" class="badge badge-primary badge-lg font-bold shrink-0">
                  S{{ phaseWeekInfo.current }}/{{ phaseWeekInfo.total }}
                </span>
              </div>
              <p class="text-base-content/60 mt-2">{{ weekRange }}</p>
            </div>

            <!-- Week Grid -->
            <div class="grid grid-cols-7 gap-2 mb-8">
              <div
                v-for="day in weekDates"
                :key="day.date"
                class="text-center"
              >
                <!-- Day header -->
                <div class="text-xs text-base-content/50 font-medium mb-1">{{ day.dayName }}</div>
                <div class="text-lg font-bold mb-3 text-base-content/80">{{ day.dayNumber }}</div>

                <!-- Sessions for this day -->
                <div class="space-y-2 min-h-[80px]">
                  <div
                    v-for="session in getSessionsForDate(day.date)"
                    :key="session.id"
                    class="rounded-xl p-2 text-center text-white relative"
                    :class="getSessionClass(session)"
                  >
                    <div class="text-xl">
                      {{ getSportEmoji(session.sport) }}
                      <span v-if="isSessionDone(session)" class="text-sm">✅</span>
                    </div>
                    <div class="text-xs font-semibold mt-0.5">{{ formatDuration(session.duration_min) }}</div>
                    <!-- Intensity indicator for planned sessions -->
                    <div
                      v-if="!isSessionDone(session) && session.intensity"
                      class="flex items-center justify-center gap-1 mt-1"
                    >
                      <span class="text-[10px] text-white/80 font-bold">{{ session.intensity }}/10</span>
                      <div
                        class="w-2 h-2 rounded-full"
                        :class="getIntensityColor(session.intensity)"
                      ></div>
                    </div>
                  </div>
                  <!-- Combo badge for multiple sessions -->
                  <div
                    v-if="getSessionsForDate(day.date).length >= 2"
                    class="combo-badge"
                  >
                    🔥 x{{ getSessionsForDate(day.date).length }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Stats -->
            <div class="flex justify-center gap-8 text-sm mb-6 flex-wrap">
              <span v-if="doneSessions.length > 0" class="text-[#fc4c02] font-semibold whitespace-nowrap">
                ✅ {{ doneSessions.length }} séances • {{ formatHours(doneHours) }}
              </span>
              <span v-if="plannedSessions.length > 0" class="text-base-content/50 font-medium whitespace-nowrap">
                📋 {{ plannedSessions.length }} séances • {{ formatHours(plannedHours) }}
              </span>
            </div>

            <!-- Divider -->
            <div class="divider my-4"></div>

            <!-- Tagline -->
            <div class="py-6 text-center px-2">
              <p class="text-xl md:text-2xl font-bold bg-gradient-to-r from-pink-400 via-pink-500 to-rose-500 bg-clip-text text-transparent drop-shadow-lg break-words">
                "{{ smartTagline }}"
              </p>
            </div>

            <!-- Branding -->
            <p class="text-xs text-base-content/30 text-center mt-4">Powered by Cadence 🎯</p>

            <!-- Download button -->
            <div class="flex justify-center pt-4 pb-2 screenshot-hide">
              <button
                class="btn btn-lg border-0 shadow-lg text-white px-8 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-pink-500/40 gap-2"
                :disabled="isDownloading"
                @click="downloadScreenshot"
              >
                <span v-if="isDownloading" class="loading loading-spinner loading-sm"></span>
                <span v-else>📸</span>
                Télécharger l'image
              </button>
            </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Modal transition */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-border-wrapper,
.modal-leave-to .modal-border-wrapper {
  transform: scale(0.95);
}

/* Modal wrapper - contains the animated border */
.modal-border-wrapper {
  position: relative;
  transition: transform 0.3s ease;
  border-radius: 26px;
  padding: 3px;
  background: linear-gradient(45deg, #fc4c02, #ff8c00, #e04402, #ff6a00, #fc4c02);
  background-size: 400% 400%;
  animation: wave-border 4s ease infinite;
  width: 100%;
}

/* Modal card */
.modal-card {
  background-color: #191e24;
  position: relative;
}

@keyframes wave-border {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Session cards base */
.session-share {
  transition: all 0.2s ease;
}

/* DONE sessions - Strava Orange */
.session-done-share {
  background: linear-gradient(135deg, #fc4c02 0%, #e04402 100%);
  box-shadow: 0 2px 8px rgba(252, 76, 2, 0.3);
}

/* PLANNED sessions - Sport colors with dashed border */
/* Cycling - Pink vif */
.session-cycling-share,
.session-mtb-share {
  background: linear-gradient(135deg, #f472b6 0%, #ec4899 100%);
  box-shadow: 0 4px 15px rgba(236, 72, 153, 0.3);
}

/* Running - Blue électrique */
.session-running-share {
  background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
  box-shadow: 0 4px 15px rgba(14, 165, 233, 0.3);
}

/* Strength - Purple vibrant */
.session-strength-share {
  background: linear-gradient(135deg, #c084fc 0%, #a855f7 100%);
  box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3);
}

/* Hiking - Lime néon */
.session-hiking-share {
  background: linear-gradient(135deg, #a3e635 0%, #84cc16 100%);
  box-shadow: 0 4px 15px rgba(132, 204, 22, 0.3);
}

/* Planned sessions modifier - dashed border + opacity */
.session-planned-share {
  opacity: 0.75;
  border: 2px dashed rgba(255, 255, 255, 0.5);
}

/* Combo badge for multiple sessions in a day */
.combo-badge {
  font-size: 0.65rem;
  font-weight: 700;
  color: #fbbf24;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* Screenshot wrapper - black padding around the modal */
.screenshot-wrapper {
  background-color: #000000 !important;
}

/* Capture area - hex colors for html2canvas (no oklch) */
.capture-area {
  background-color: #191e24 !important;
  color: #a6adbb !important;
}

.capture-area h2,
.capture-area .font-bold {
  color: #ffffff !important;
}

.capture-area .text-base-content\/50,
.capture-area .text-base-content\/60,
.capture-area .text-base-content\/80 {
  color: #6b7280 !important;
}

.capture-area .text-base-content\/30 {
  color: #4b5563 !important;
}

.capture-area .badge-primary {
  background-color: #7c3aed !important;
  color: #ffffff !important;
}

.capture-area .divider {
  border-color: #374151 !important;
}

.capture-area .divider::before,
.capture-area .divider::after {
  background-color: #374151 !important;
}
</style>
