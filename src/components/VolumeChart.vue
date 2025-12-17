<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import type { ScheduledSession } from '../types/session'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const props = defineProps<{
  sessions: ScheduledSession[]
}>()

const period = ref<1 | 3 | 6>(3)

const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

const getWeekKey = (date: Date): string => {
  const monday = getStartOfWeek(date)
  return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`
}

const getWeekLabel = (date: Date): string => {
  const monday = getStartOfWeek(date)
  return `${monday.getDate()}/${monday.getMonth() + 1}`
}

const chartData = computed(() => {
  const now = new Date()
  const startDate = new Date(now)
  startDate.setMonth(startDate.getMonth() - period.value)

  // Get all weeks in the period
  const weeks: Map<string, {
    label: string
    cyclingDone: number
    cyclingPlanned: number
    runningDone: number
    runningPlanned: number
  }> = new Map()

  // Start from the Monday of the start week
  const current = getStartOfWeek(startDate)
  const endWeek = getStartOfWeek(now)

  while (current <= endWeek) {
    const key = getWeekKey(current)
    weeks.set(key, { label: getWeekLabel(current), cyclingDone: 0, cyclingPlanned: 0, runningDone: 0, runningPlanned: 0 })
    current.setDate(current.getDate() + 7)
  }

  // Fill with session data
  props.sessions.forEach(session => {
    const sessionDate = new Date(session.date)
    const key = getWeekKey(sessionDate)
    const week = weeks.get(key)
    if (week) {
      const hours = session.duration_min / 60
      const isDone = session.type === 'strava'
      if (session.sport === 'cycling') {
        if (isDone) week.cyclingDone += hours
        else week.cyclingPlanned += hours
      } else if (session.sport === 'running') {
        if (isDone) week.runningDone += hours
        else week.runningPlanned += hours
      }
    }
  })

  const sortedWeeks = Array.from(weeks.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([, data]) => data)

  return {
    labels: sortedWeeks.map(w => w.label),
    datasets: [
      {
        label: 'Vélo (fait)',
        data: sortedWeeks.map(w => Math.round(w.cyclingDone * 10) / 10),
        backgroundColor: 'rgba(34, 197, 94, 0.9)',
        borderRadius: 4,
        stack: 'cycling',
      },
      {
        label: 'Vélo (prévu)',
        data: sortedWeeks.map(w => Math.round(w.cyclingPlanned * 10) / 10),
        backgroundColor: 'rgba(34, 197, 94, 0.35)',
        borderRadius: 4,
        stack: 'cycling',
      },
      {
        label: 'Course (fait)',
        data: sortedWeeks.map(w => Math.round(w.runningDone * 10) / 10),
        backgroundColor: 'rgba(245, 158, 11, 0.9)',
        borderRadius: 4,
        stack: 'running',
      },
      {
        label: 'Course (prévu)',
        data: sortedWeeks.map(w => Math.round(w.runningPlanned * 10) / 10),
        backgroundColor: 'rgba(245, 158, 11, 0.35)',
        borderRadius: 4,
        stack: 'running',
      },
    ],
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: 'index' as const,
  },
  scales: {
    x: {
      stacked: true,
      grid: { display: false },
    },
    y: {
      stacked: true,
      title: { display: true, text: 'Heures' },
      beginAtZero: true,
    },
  },
  skipNull: true,
  plugins: {
    legend: {
      position: 'bottom' as const,
    },
    tooltip: {
      callbacks: {
        label: (ctx: { dataset: { label: string }; parsed: { y: number } }) => {
          const totalMinutes = Math.round(ctx.parsed.y * 60)
          const hours = Math.floor(totalMinutes / 60)
          const minutes = totalMinutes % 60
          return `${ctx.dataset.label}: ${hours}h${minutes.toString().padStart(2, '0')}`
        },
      },
    },
  },
}))
</script>

<template>
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <div class="flex justify-between items-center mb-4">
        <h2 class="card-title text-lg">Volume d'entraînement</h2>
        <div class="btn-group">
          <button
            class="btn btn-sm"
            :class="period === 1 ? 'btn-primary' : 'btn-ghost'"
            @click="period = 1"
          >
            1 mois
          </button>
          <button
            class="btn btn-sm"
            :class="period === 3 ? 'btn-primary' : 'btn-ghost'"
            @click="period = 3"
          >
            3 mois
          </button>
          <button
            class="btn btn-sm"
            :class="period === 6 ? 'btn-primary' : 'btn-ghost'"
            @click="period = 6"
          >
            6 mois
          </button>
        </div>
      </div>
      <div class="h-64">
        <Bar :data="chartData" :options="chartOptions" />
      </div>
    </div>
  </div>
</template>
