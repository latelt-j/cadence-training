<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import type { ScheduledSession, TrainingPhase } from '../types/session'
import { SPORT_CONFIG } from '../types/session'
import { useWeather } from '../composables/useWeather'

const { forecast, fetchWithGeolocation, getWeatherForDate, getWeatherEmoji, getWindArrow } = useWeather()

const props = defineProps<{
  sessions: ScheduledSession[]
  newSessionIds?: Set<string>
  trainingPhases?: TrainingPhase[]
}>()

const emit = defineEmits<{
  updateDate: [sessionId: string, newDate: string]
  addSession: [date: string]
  selectSession: [session: ScheduledSession]
  weekChange: [date: Date]
}>()

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
        title: `${weather.tempMin}° / ${weather.tempMax}°`,
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

// Week number within current phase
const phaseWeekNumber = computed(() => {
  if (!currentPhase.value) return null
  const phaseStart = new Date(currentPhase.value.start_date)
  const weekStart = new Date(currentWeekStart.value)
  const diffTime = weekStart.getTime() - phaseStart.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  return Math.floor(diffDays / 7) + 1
})

// Total weeks in current phase
const phaseTotalWeeks = computed(() => {
  if (!currentPhase.value) return null
  const phaseStart = new Date(currentPhase.value.start_date)
  const phaseEnd = new Date(currentPhase.value.end_date)
  const diffTime = phaseEnd.getTime() - phaseStart.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  return Math.ceil(diffDays / 7)
})

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
  if (session.type === 'strava') {
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

      <div class="flex items-center gap-3">
        <h2 class="text-xl font-bold text-primary capitalize">{{ headerTitle }}</h2>
        <span v-if="currentPhase" class="badge badge-lg badge-primary">
          {{ currentPhase.name }} · Sem. {{ phaseWeekNumber }}/{{ phaseTotalWeeks }}
        </span>
      </div>

      <div class="w-32"></div>
    </div>

    <!-- Calendar Grid -->
    <div class="grid grid-cols-7 min-h-[280px] p-3 gap-2">
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
        @click="emit('addSession', day.date)"
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
            <div v-if="day.weather" class="text-center pl-2 border-l border-base-300/50" :title="day.weather.title">
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
              session.type !== 'strava' ? 'session-planned' : '',
              newSessionIds?.has(session.id) || (session.type === 'strava' && session.date === today) ? 'session-today' : '',
              session.type === 'strava' ? 'cursor-default' : 'cursor-grab'
            ]"
            :style="{ opacity: draggedSession?.id === session.id ? 0.3 : (session.type === 'strava' && session.date !== today ? 0.6 : 1) }"
            :draggable="session.type !== 'strava'"
            @dragstart="onDragStart($event, session)"
            @dragend="onDragEnd"
            @click.stop="emit('selectSession', session)"
          >
            <div class="font-semibold flex items-center gap-1.5">
              <span class="text-sm">{{ SPORT_CONFIG[session.sport].emoji }}</span>
              <span class="truncate">{{ session.title }}</span>
              <span v-if="session.type === 'strava'" class="ml-auto opacity-70">✓</span>
            </div>
            <div class="text-white/70 mt-1 text-[11px]">{{ formatDuration(session.duration_min) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="px-4 py-2 flex items-center justify-center gap-4 text-xs text-base-content/40">
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

.session-cycling {
  background: linear-gradient(135deg, #22c55e 0%, #15803d 100%);
}

.session-running {
  background: linear-gradient(135deg, #f59e0b 0%, #b45309 100%);
}

.session-strength {
  background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
}

.session-planned {
  opacity: 0.7;
  border: 2px dashed rgba(255, 255, 255, 0.5);
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
