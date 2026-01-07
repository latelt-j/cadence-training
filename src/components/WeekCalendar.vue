<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import type { ScheduledSession, TrainingPhase } from '../types/session'
import { SPORT_CONFIG } from '../types/session'
import { useWeather } from '../composables/useWeather'

const { forecast, fetchWithGeolocation, getWeatherForDate, getWeatherEmoji, getWindArrow, locationName } = useWeather()

const props = defineProps<{
  sessions: ScheduledSession[]
  newSessionIds?: Set<string>
  trainingPhases?: TrainingPhase[]
}>()

const emit = defineEmits<{
  updateDate: [sessionId: string, newDate: string]
  selectSession: [session: ScheduledSession]
  weekChange: [date: Date]
}>()

// Mobile detection
const isMobile = ref(false)
const currentDayIndex = ref(0) // 0-6 for Mon-Sun

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

// Swipe handling with animation
let touchStartX = 0
const swipeOffset = ref(0)
const isAnimating = ref(false)
const slideDirection = ref<'left' | 'right' | null>(null)

const onTouchStart = (e: TouchEvent) => {
  if (isAnimating.value) return
  touchStartX = e.touches[0]?.clientX ?? 0
  swipeOffset.value = 0
}

const onTouchMove = (e: TouchEvent) => {
  if (isAnimating.value) return
  const currentX = e.touches[0]?.clientX ?? 0
  swipeOffset.value = currentX - touchStartX
}

const onTouchEnd = (e: TouchEvent) => {
  if (isAnimating.value) return
  const endX = e.changedTouches[0]?.clientX ?? 0
  const diff = endX - touchStartX

  if (diff > 50 && currentDayIndex.value > 0) {
    slideDirection.value = 'right'
    isAnimating.value = true
    setTimeout(() => {
      currentDayIndex.value--
      slideDirection.value = null
      isAnimating.value = false
    }, 200)
  } else if (diff < -50 && currentDayIndex.value < 6) {
    slideDirection.value = 'left'
    isAnimating.value = true
    setTimeout(() => {
      currentDayIndex.value++
      slideDirection.value = null
      isAnimating.value = false
    }, 200)
  }
  swipeOffset.value = 0
}

// Current day getter with safety check
const currentDay = computed(() => weekDays.value[currentDayIndex.value])
const currentDaySessions = computed(() => {
  const day = currentDay.value
  return day ? sessionsByDate.value[day.date] || [] : []
})

// Current week start (Monday)
const currentWeekStart = ref(getMonday(new Date()))

function getMonday(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  date.setDate(diff)
  date.setHours(0, 0, 0, 0)
  return date
}

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function getDayName(date: Date): string {
  return date.toLocaleDateString('fr-FR', { weekday: 'short' })
}

// Today's date for highlighting
const today = formatDate(new Date())

// Generate week days
const weekDays = computed(() => {
  const days = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(currentWeekStart.value)
    date.setDate(date.getDate() + i)
    const dateStr = formatDate(date)
    const weather = getWeatherForDate(dateStr)

    days.push({
      date: dateStr,
      dayName: getDayName(date),
      dayNumber: date.getDate(),
      displayDate: formatDateDisplay(date),
      isToday: formatDate(new Date()) === dateStr,
      weather: weather ? {
        emoji: getWeatherEmoji(weather.weatherCode),
        temp: weather.tempMax,
        title: `📍 ${locationName.value} • ${weather.tempMin}° / ${weather.tempMax}°`,
        wind: weather.windSpeed,
        windArrow: getWindArrow(weather.windDirection),
      } : null
    })
  }
  return days
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

// Current phase for the displayed week
const currentPhase = computed(() => {
  if (!props.trainingPhases?.length) return null
  // Use the middle of the displayed week to determine phase
  const midWeek = new Date(currentWeekStart.value)
  midWeek.setDate(midWeek.getDate() + 3)
  const midWeekStr = formatDate(midWeek)
  return props.trainingPhases.find(p => p.start_date <= midWeekStr && p.end_date >= midWeekStr)
})

// Parse date string as local date (not UTC)
const parseLocalDate = (dateStr: string): Date => {
  const parts = dateStr.split('-').map(Number)
  return new Date(parts[0] ?? 2025, (parts[1] ?? 1) - 1, parts[2] ?? 1)
}

// Week number within current phase
const phaseWeekNumber = computed(() => {
  if (!currentPhase.value) return null
  const phaseStart = parseLocalDate(currentPhase.value.start_date)
  phaseStart.setHours(0, 0, 0, 0)
  const weekStart = new Date(currentWeekStart.value)
  weekStart.setHours(0, 0, 0, 0)
  const diffTime = weekStart.getTime() - phaseStart.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(1, Math.floor(diffDays / 7) + 1)
})

// Total weeks in current phase
const phaseTotalWeeks = computed(() => {
  if (!currentPhase.value) return null
  const phaseStart = parseLocalDate(currentPhase.value.start_date)
  const phaseEnd = parseLocalDate(currentPhase.value.end_date)
  const diffTime = phaseEnd.getTime() - phaseStart.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  return Math.ceil(diffDays / 7)
})

// Phase emoji based on name
const getPhaseEmoji = (name: string) => {
  const lower = name.toLowerCase()
  if (lower.includes('base') || lower.includes('fondation')) return '🏗️'
  if (lower.includes('build') || lower.includes('construction')) return '💪'
  if (lower.includes('peak') || lower.includes('pic') || lower.includes('affutage')) return '⚡'
  if (lower.includes('taper') || lower.includes('affinage')) return '🎯'
  if (lower.includes('recovery') || lower.includes('récup')) return '🧘'
  if (lower.includes('race') || lower.includes('compet')) return '🏆'
  return '📊'
}

// Navigation
const prevWeek = () => {
  const newDate = new Date(currentWeekStart.value)
  newDate.setDate(newDate.getDate() - 7)
  currentWeekStart.value = newDate
  emit('weekChange', newDate)
}

const nextWeek = () => {
  const newDate = new Date(currentWeekStart.value)
  newDate.setDate(newDate.getDate() + 7)
  currentWeekStart.value = newDate
  emit('weekChange', newDate)
}

const goToToday = () => {
  currentWeekStart.value = getMonday(new Date())
  emit('weekChange', currentWeekStart.value)
}

// Week export for coach
const weekExportCopied = ref(false)

const copyWeekForCoach = async () => {
  const weekSessions = props.sessions.filter(s => {
    const sessionDate = new Date(s.date)
    const weekEnd = new Date(currentWeekStart.value)
    weekEnd.setDate(weekEnd.getDate() + 6)
    return sessionDate >= currentWeekStart.value && sessionDate <= weekEnd
  }).sort((a, b) => a.date.localeCompare(b.date))

  const formatSessionDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })
  }

  let text = `📅 BILAN SEMAINE\n`
  text += `${headerTitle.value}\n\n`

  const done = weekSessions.filter(s => s.type === 'strava' || s.type === 'manual')
  const planned = weekSessions.filter(s => s.type === 'planned')

  if (done.length > 0) {
    text += `✅ RÉALISÉ (${done.length})\n`
    done.forEach(s => {
      const duration = Math.floor(s.duration_min / 60) > 0
        ? `${Math.floor(s.duration_min / 60)}h${(s.duration_min % 60).toString().padStart(2, '0')}`
        : `${s.duration_min}min`
      text += `• ${formatSessionDate(s.date)} - ${SPORT_CONFIG[s.sport].emoji} ${s.title} (${duration})\n`
    })
    text += `\n`
  }

  if (planned.length > 0) {
    text += `📋 PRÉVU (${planned.length})\n`
    planned.forEach(s => {
      const duration = Math.floor(s.duration_min / 60) > 0
        ? `${Math.floor(s.duration_min / 60)}h${(s.duration_min % 60).toString().padStart(2, '0')}`
        : `${s.duration_min}min`
      text += `• ${formatSessionDate(s.date)} - ${SPORT_CONFIG[s.sport].emoji} ${s.title} (${duration})\n`
    })
    text += `\n`
  }

  text += `💬 Qu'en penses-tu ? Je peux ajouter une séance ?`

  await navigator.clipboard.writeText(text)
  weekExportCopied.value = true
  setTimeout(() => {
    weekExportCopied.value = false
  }, 2000)
}

// Current month/year for header
const headerTitle = computed(() => {
  const start = currentWeekStart.value
  const end = new Date(start)
  end.setDate(end.getDate() + 6)

  const startMonth = start.toLocaleDateString('fr-FR', { month: 'long' })
  const endMonth = end.toLocaleDateString('fr-FR', { month: 'long' })
  const year = start.getFullYear()

  if (startMonth === endMonth) {
    return `${startMonth} ${year}`
  }
  return `${startMonth} - ${endMonth} ${year}`
})

// Drag & Drop
const draggedSession = ref<ScheduledSession | null>(null)
const dragOverDate = ref<string | null>(null)

const onDragStart = (e: DragEvent, session: ScheduledSession) => {
  // Can't drag completed sessions (strava or manual)
  if (session.type === 'strava' || session.type === 'manual') {
    e.preventDefault()
    return
  }
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', session.id)
  }
  // Set after a tick so browser captures the original appearance for ghost
  setTimeout(() => {
    draggedSession.value = session
  }, 0)
}

const onDragEnd = () => {
  draggedSession.value = null
  dragOverDate.value = null
}

const onDragOver = (e: DragEvent, date: string) => {
  e.preventDefault()
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'move'
  }
  dragOverDate.value = date
}

const onDragLeave = () => {
  dragOverDate.value = null
}

const onDrop = (e: DragEvent, date: string) => {
  e.preventDefault()
  if (draggedSession.value && draggedSession.value.date !== date) {
    emit('updateDate', draggedSession.value.id, date)
  }
  draggedSession.value = null
  dragOverDate.value = null
}

// Format duration
const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins}min`
  if (mins === 0) return `${hours}h`
  return `${hours}h${mins.toString().padStart(2, '0')}`
}

// Init
onMounted(() => {
  fetchWithGeolocation()
  emit('weekChange', currentWeekStart.value)

  // Mobile detection
  checkMobile()
  window.addEventListener('resize', checkMobile)

  // Set current day index to today
  const todayDayOfWeek = new Date().getDay()
  currentDayIndex.value = todayDayOfWeek === 0 ? 6 : todayDayOfWeek - 1 // Convert to Mon=0, Sun=6
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

// Refresh weather when forecast changes
watch(forecast, () => {}, { deep: true })
</script>

<template>
  <div class="card bg-base-100 shadow-xl overflow-hidden">
    <!-- Header -->
    <div class="flex items-center justify-between p-4">
      <div class="flex items-center gap-1">
        <button class="btn btn-sm btn-ghost btn-circle" @click="prevWeek">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button class="btn btn-sm btn-ghost btn-circle" @click="nextWeek">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <button class="btn btn-sm btn-ghost text-primary font-medium ml-1" @click="goToToday">Aujourd'hui</button>
      </div>

      <div class="flex items-center">
        <h2 class="text-xl font-bold text-primary capitalize leading-none">{{ headerTitle }}</h2>
      </div>

      <button
        class="btn btn-sm btn-ghost"
        :class="weekExportCopied ? 'text-success' : ''"
        @click="copyWeekForCoach"
      >
        {{ weekExportCopied ? '✓ Copié !' : '📋 Bilan coach' }}
      </button>
    </div>

    <!-- Phase Bar -->
    <div v-if="currentPhase" class="px-3 pb-2">
      <div class="flex items-center gap-2 text-sm text-base-content/70">
        <span class="text-base">{{ currentPhase.emoji || getPhaseEmoji(currentPhase.name) }}</span>
        <span class="font-semibold text-base-content hidden md:inline">{{ currentPhase.name.toUpperCase() }}</span>
        <span class="badge badge-sm badge-primary">S{{ phaseWeekNumber }}/{{ phaseTotalWeeks }}</span>
        <span v-if="currentPhase.objectives" class="text-base-content/40 hidden md:inline">•</span>
        <span v-if="currentPhase.objectives" class="truncate hidden md:inline">{{ currentPhase.objectives }}</span>
      </div>
    </div>

    <!-- Mobile View: Single Day with Swipe -->
    <div
      v-if="isMobile"
      class="min-h-[400px] p-3 overflow-hidden"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
    >
      <div
        v-if="currentDay"
        class="flex flex-col rounded-2xl min-h-[350px] transition-all duration-200 ease-out"
        :class="{
          'bg-primary/10 ring-2 ring-primary/30': currentDay.isToday,
          'bg-base-200/50': !currentDay.isToday
        }"
        :style="{
          transform: slideDirection === 'left' ? 'translateX(-100%) scale(0.95)' :
                     slideDirection === 'right' ? 'translateX(100%) scale(0.95)' :
                     `translateX(${swipeOffset * 0.3}px)`,
          opacity: slideDirection ? 0 : 1 - Math.abs(swipeOffset) / 500
        }"
      >
        <!-- Day Header - Mobile -->
        <div class="p-4 text-center">
          <div class="flex items-center justify-center gap-4">
            <div>
              <div class="text-sm uppercase text-base-content/50 font-medium tracking-wide">
                {{ currentDay.dayName }}
              </div>
              <div
                class="text-4xl font-bold mt-1"
                :class="currentDay.isToday ? 'text-primary' : 'text-base-content/80'"
              >
                {{ currentDay.dayNumber }}
              </div>
              <div class="text-xs text-base-content/50 mt-1">
                {{ currentDay.displayDate }}
              </div>
            </div>
            <div v-if="currentDay.weather" class="text-center pl-4 border-l border-base-300/50">
              <div class="text-3xl leading-none">{{ currentDay.weather.emoji }}</div>
              <div class="text-lg font-semibold text-base-content/70 mt-1">{{ currentDay.weather.temp }}°</div>
              <div class="text-xs text-base-content/40">
                {{ currentDay.weather.windArrow }} {{ currentDay.weather.wind }} km/h
              </div>
            </div>
          </div>
        </div>

        <!-- Sessions - Mobile -->
        <div class="flex-1 px-4 pb-4 space-y-3 overflow-y-auto">
          <div
            v-for="session in currentDaySessions"
            :key="session.id"
            class="session-card p-4 rounded-2xl text-white cursor-pointer shadow-lg h-20"
            :class="[
              `session-${session.sport}`,
              session.type === 'planned' ? 'session-planned' : '',
              newSessionIds?.has(session.id) || ((session.type === 'strava' || session.type === 'manual') && session.date === today) ? 'session-today' : ''
            ]"
            @click.stop="emit('selectSession', session)"
          >
            <div class="font-semibold flex items-center gap-2 text-base">
              <span class="text-2xl">{{ SPORT_CONFIG[session.sport].emoji }}</span>
              <span class="truncate flex-1">{{ session.title }}</span>
              <span v-if="session.type === 'strava' || session.type === 'manual'" class="opacity-70 text-lg">✓</span>
            </div>
            <div class="text-white/80 mt-1 text-sm font-medium">{{ formatDuration(session.duration_min) }}</div>
          </div>

          <!-- Empty state -->
          <div
            v-if="currentDaySessions.length === 0"
            class="text-center py-8 text-base-content/40"
          >
            <div class="text-4xl mb-2">🏖️</div>
            <div>Pas de séance prévue</div>
            <div class="text-xs mt-1">Tape pour ajouter</div>
          </div>
        </div>
      </div>

      <!-- Dots indicator -->
      <div class="flex justify-center gap-2 py-3">
        <button
          v-for="(day, i) in weekDays"
          :key="day.date"
          class="w-2.5 h-2.5 rounded-full transition-all"
          :class="i === currentDayIndex ? 'bg-primary scale-125' : 'bg-base-300'"
          @click.stop="currentDayIndex = i"
        />
      </div>
    </div>

    <!-- Desktop View: Week Grid -->
    <div v-else class="grid grid-cols-7 min-h-[280px] p-3 gap-2">
      <div
        v-for="day in weekDays"
        :key="day.date"
        class="flex flex-col rounded-2xl transition-all duration-200 hover:shadow-md"
        :class="{
          'bg-primary/10 ring-2 ring-primary/30': day.isToday,
          'bg-base-200/50 hover:bg-base-200/80': !day.isToday,
          'ring-2 ring-primary/50 bg-primary/5': dragOverDate === day.date
        }"
        @dragover="onDragOver($event, day.date)"
        @dragleave="onDragLeave"
        @drop="onDrop($event, day.date)"
      >
        <!-- Day Header -->
        <div class="p-2 text-center h-[68px]">
          <div class="flex items-center justify-center gap-2 h-full">
            <div>
              <div class="text-xs uppercase text-base-content/50 font-medium tracking-wide">{{ day.dayName }}</div>
              <div
                class="text-xl font-bold mt-0.5"
                :class="day.isToday ? 'text-primary' : 'text-base-content/80'"
              >
                {{ day.dayNumber }}
              </div>
            </div>
            <div v-if="day.weather" class="tooltip tooltip-bottom text-center pl-2 border-l border-base-300/50" :data-tip="day.weather.title">
              <div class="text-lg leading-none">{{ day.weather.emoji }}</div>
              <div class="text-xs font-semibold text-base-content/70">{{ day.weather.temp }}°</div>
              <div class="text-[10px] text-base-content/40">
                {{ day.weather.windArrow }} {{ day.weather.wind }}
              </div>
            </div>
          </div>
        </div>

        <!-- Sessions -->
        <div class="flex-1 px-2 pt-3 pb-2 space-y-1.5 overflow-y-auto">
          <div
            v-for="session in sessionsByDate[day.date] || []"
            :key="session.id"
            class="session-card p-2.5 rounded-xl text-white text-xs cursor-pointer shadow-sm"
            :class="[
              `session-${session.sport}`,
              session.type === 'planned' ? 'session-planned' : '',
              newSessionIds?.has(session.id) || ((session.type === 'strava' || session.type === 'manual') && session.date === today) ? 'session-today' : '',
              (session.type === 'strava' || session.type === 'manual') ? 'cursor-default' : 'cursor-grab'
            ]"
            :style="{ opacity: draggedSession?.id === session.id ? 0.3 : 1 }"
            :draggable="session.type === 'planned'"
            @dragstart="onDragStart($event, session)"
            @dragend="onDragEnd"
            @click.stop="emit('selectSession', session)"
          >
            <div class="font-semibold flex items-center gap-1.5">
              <span class="text-sm">{{ SPORT_CONFIG[session.sport].emoji }}</span>
              <span class="truncate">{{ session.title }}</span>
              <span v-if="session.type === 'strava' || session.type === 'manual'" class="ml-auto opacity-70">✓</span>
            </div>
            <div class="text-white/70 mt-1 text-[11px]">{{ formatDuration(session.duration_min) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer - Desktop only -->
    <div class="px-4 py-2 hidden md:flex items-center justify-center gap-4 text-xs text-base-content/40">
      <span class="flex items-center gap-1">🖱️ Glisse</span>
      <span>•</span>
      <span class="flex items-center gap-1">➕ Clique jour</span>
      <span>•</span>
      <span class="flex items-center gap-1">👆 Clique séance</span>
    </div>
  </div>
</template>

<style scoped>
.session-card:active {
  cursor: grabbing;
}

/* Sport colors */
.session-cycling {
  background: linear-gradient(135deg, #f472b6 0%, #ec4899 100%);
}

.session-mtb {
  background: linear-gradient(135deg, #f472b6 0%, #ec4899 100%);
}

.session-running {
  background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
}

.session-strength {
  background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%);
}

.session-hiking {
  background: linear-gradient(135deg, #84cc16 0%, #65a30d 100%);
}

.session-planned {
  opacity: 0.65 !important;
  border: 2px dashed rgba(255, 255, 255, 0.6) !important;
  box-shadow: none !important;
}

.session-today {
  animation: glow 2s ease-in-out infinite;
  border: 2px solid rgba(255, 215, 0, 0.6) !important;
}

.session-new {
  animation: glow 2s ease-in-out infinite;
  border: 2px solid rgba(255, 215, 0, 0.7) !important;
}

@keyframes glow {
  0%, 100% {
    box-shadow: 0 0 6px rgba(255, 215, 0, 0.3), 0 0 12px rgba(255, 215, 0, 0.15);
  }
  50% {
    box-shadow: 0 0 10px rgba(255, 215, 0, 0.45), 0 0 20px rgba(255, 215, 0, 0.25);
  }
}
</style>
