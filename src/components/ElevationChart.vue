<script setup lang="ts">
import { ref, computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import type { ScheduledSession } from '../types/session'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const props = defineProps<{
  sessions: ScheduledSession[]
}>()

const period = ref<3 | 6>(3)
const selectedSport = ref<'cycling' | 'running'>('cycling')

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

const sportColors = {
  cycling: {
    border: 'rgb(16, 185, 129)', // emerald-500
    background: 'rgba(16, 185, 129, 0.15)',
  },
  running: {
    border: 'rgb(14, 165, 233)', // sky-500
    background: 'rgba(14, 165, 233, 0.15)',
  },
}

const chartData = computed(() => {
  const now = new Date()
  const startDate = new Date(now)
  startDate.setMonth(startDate.getMonth() - period.value)

  // Get all weeks in the period
  const weeks: Map<string, { label: string; elevation: number }> = new Map()

  // Start from the Monday of the start week
  const current = getStartOfWeek(startDate)
  const endWeek = getStartOfWeek(now)

  while (current <= endWeek) {
    const key = getWeekKey(current)
    weeks.set(key, { label: getWeekLabel(current), elevation: 0 })
    current.setDate(current.getDate() + 7)
  }

  // Fill with session data (only completed sessions with elevation)
  props.sessions.forEach(session => {
    const sessionDate = new Date(session.date)
    const key = getWeekKey(sessionDate)
    const week = weeks.get(key)
    if (week && session.actual_elevation) {
      const isDone = session.type === 'strava' || session.type === 'manual'
      const matchesSport = selectedSport.value === 'cycling'
        ? (session.sport === 'cycling' || session.sport === 'mtb')
        : session.sport === 'running'
      if (isDone && matchesSport) {
        week.elevation += session.actual_elevation
      }
    }
  })

  const sortedWeeks = Array.from(weeks.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, data]) => data)

  const colors = sportColors[selectedSport.value]

  return {
    labels: sortedWeeks.map(w => w.label),
    datasets: [
      {
        label: selectedSport.value === 'cycling' ? 'Velo D+' : 'Course D+',
        data: sortedWeeks.map(w => Math.round(w.elevation)),
        borderColor: colors.border,
        backgroundColor: colors.background,
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: colors.border,
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
      grid: { display: false },
    },
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value: string | number) => `${value}m`,
      },
    },
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (ctx: any) => `${ctx.raw} m D+`,
      },
    },
  },
}))

// Compute total elevation for the period
const totalElevation = computed(() => {
  const data = chartData.value.datasets[0]?.data as number[] ?? []
  return data.reduce((sum, val) => sum + val, 0)
})
</script>

<template>
  <div class="card bg-base-200">
    <div class="card-body">
      <div class="flex justify-between items-center mb-2">
        <div class="flex items-center gap-3">
          <h2 class="card-title text-lg">Denivele</h2>
          <span class="text-lg font-bold" :class="selectedSport === 'cycling' ? 'text-emerald-500' : 'text-sky-500'">
            {{ totalElevation.toLocaleString() }} m
          </span>
        </div>
        <!-- Sport toggle -->
        <div class="join">
          <button
            class="join-item btn btn-sm"
            :class="selectedSport === 'cycling' ? 'bg-emerald-500 text-white' : 'btn-ghost'"
            @click="selectedSport = 'cycling'"
          >
            Velo
          </button>
          <button
            class="join-item btn btn-sm"
            :class="selectedSport === 'running' ? 'bg-sky-500 text-white' : 'btn-ghost'"
            @click="selectedSport = 'running'"
          >
            Course
          </button>
        </div>
      </div>
      <!-- Period selector -->
      <div class="flex gap-2 mb-4">
        <button
          class="btn btn-xs"
          :class="period === 3 ? 'bg-emerald-500/80 text-white' : 'btn-ghost'"
          @click="period = 3"
        >
          3 mois
        </button>
        <button
          class="btn btn-xs"
          :class="period === 6 ? 'bg-emerald-500/80 text-white' : 'btn-ghost'"
          @click="period = 6"
        >
          6 mois
        </button>
      </div>
      <!-- Chart -->
      <div class="h-48">
        <Line :data="chartData" :options="chartOptions" />
      </div>
    </div>
  </div>
</template>
