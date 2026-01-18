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
const selectedMetric = ref<'elevation' | 'distance'>('elevation')

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
  const weeks: Map<string, { label: string; value: number }> = new Map()

  // Start from the Monday of the start week
  const current = getStartOfWeek(startDate)
  const endWeek = getStartOfWeek(now)

  while (current <= endWeek) {
    const key = getWeekKey(current)
    weeks.set(key, { label: getWeekLabel(current), value: 0 })
    current.setDate(current.getDate() + 7)
  }

  // Fill with session data (only completed sessions)
  props.sessions.forEach(session => {
    const sessionDate = new Date(session.date)
    const key = getWeekKey(sessionDate)
    const week = weeks.get(key)
    if (week) {
      const isDone = session.type === 'strava' || session.type === 'manual'
      const matchesSport = selectedSport.value === 'cycling'
        ? (session.sport === 'cycling' || session.sport === 'mtb')
        : session.sport === 'running'
      if (isDone && matchesSport) {
        if (selectedMetric.value === 'elevation' && session.actual_elevation) {
          week.value += session.actual_elevation
        } else if (selectedMetric.value === 'distance' && session.actual_km) {
          week.value += session.actual_km
        }
      }
    }
  })

  const sortedWeeks = Array.from(weeks.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, data]) => data)

  const colors = sportColors[selectedSport.value]
  const sportLabel = selectedSport.value === 'cycling' ? 'Velo' : 'Course'
  const metricLabel = selectedMetric.value === 'elevation' ? 'D+' : 'km'

  return {
    labels: sortedWeeks.map(w => w.label),
    datasets: [
      {
        label: `${sportLabel} ${metricLabel}`,
        data: sortedWeeks.map(w => selectedMetric.value === 'elevation' ? Math.round(w.value) : Math.round(w.value * 10) / 10),
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
        callback: (value: string | number) => selectedMetric.value === 'elevation' ? `${value}m` : `${value}km`,
      },
    },
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (ctx: any) => selectedMetric.value === 'elevation' ? `${ctx.raw} m D+` : `${ctx.raw} km`,
      },
    },
  },
}))

// Compute total value for the period
const totalValue = computed(() => {
  const data = chartData.value.datasets[0]?.data as number[] ?? []
  const total = data.reduce((sum, val) => sum + val, 0)
  return selectedMetric.value === 'elevation' ? Math.round(total) : Math.round(total * 10) / 10
})
</script>

<template>
  <div class="card bg-base-200">
    <div class="card-body">
      <div class="flex justify-between items-center mb-2">
        <div class="flex items-center gap-3">
          <!-- Metric toggle (title) -->
          <div class="join">
            <button
              class="join-item btn btn-sm"
              :class="selectedMetric === 'elevation' ? 'bg-base-300 font-bold' : 'btn-ghost'"
              @click="selectedMetric = 'elevation'"
            >
              Denivele
            </button>
            <button
              class="join-item btn btn-sm"
              :class="selectedMetric === 'distance' ? 'bg-base-300 font-bold' : 'btn-ghost'"
              @click="selectedMetric = 'distance'"
            >
              Distance
            </button>
          </div>
          <span class="text-lg font-bold" :class="selectedSport === 'cycling' ? 'text-emerald-500' : 'text-sky-500'">
            {{ totalValue.toLocaleString() }} {{ selectedMetric === 'elevation' ? 'm' : 'km' }}
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
