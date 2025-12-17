<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useIntervals } from '../composables/useIntervals'

const {
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
  formStatus,
} = useIntervals()

const chartPeriod = ref<'week' | 'month' | '3months'>('month')

onMounted(async () => {
  await fetchWellnessRange(90) // Last 90 days for graphs
  fetchTodayWellness()
})

const last7Days = computed(() => {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const dayNum = String(d.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${dayNum}`
    const wellness = wellnessHistory.value.find(w => w.id === dateStr)
    const hrv = wellness?.hrv ?? wellness?.hrvSDNN ?? wellness?.rmssd ?? wellness?.lastNightAvg ?? null
    days.push({
      date: dateStr,
      dateDisplay: d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }),
      day: d.toLocaleDateString('fr-FR', { weekday: 'short' }).charAt(0).toUpperCase(),
      tsb: wellness ? Math.round(wellness.ctl - wellness.atl) : null,
      ctl: wellness?.ctl ? Math.round(wellness.ctl) : null,
      atl: wellness?.atl ? Math.round(wellness.atl) : null,
      hrv: hrv ? Math.round(hrv) : null,
    })
  }
  return days
})

const getTsbColor = (tsb: number | null, forHistory = false) => {
  if (forHistory) {
    // Subtle backgrounds for history emojis
    if (tsb === null) return 'bg-base-300/50'
    if (tsb > 15) return 'bg-cyan-500/20'
    if (tsb > 5) return 'bg-emerald-500/20'
    if (tsb > -10) return 'bg-green-500/20'
    if (tsb > -25) return 'bg-orange-500/20'
    return 'bg-rose-600/20'
  }
  // Solid backgrounds for main TSB display
  if (tsb === null) return 'bg-base-300 text-base-content'
  if (tsb > 15) return 'bg-cyan-500 text-white'
  if (tsb > 5) return 'bg-emerald-500 text-white'
  if (tsb > -10) return 'bg-green-500 text-white'
  if (tsb > -25) return 'bg-orange-500 text-white'
  return 'bg-rose-600 text-white'
}

const getTsbEmoji = (tsb: number | null) => {
  if (tsb === null) return '–'
  if (tsb > 15) return '❄️'
  if (tsb > 5) return '💪'
  if (tsb > -10) return '🎯'
  if (tsb > -25) return '😓'
  return '🛑'
}

const refresh = async () => {
  await fetchWellnessRange(90)
  fetchTodayWellness()
}

// Chart data
const chartDays = computed(() => {
  const days = chartPeriod.value === 'week' ? 7 : chartPeriod.value === 'month' ? 30 : 90
  return days
})

const chartData = computed(() => {
  const days = chartDays.value
  const data = []

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const dayNum = String(d.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${dayNum}`
    const wellness = wellnessHistory.value.find(w => w.id === dateStr)

    if (wellness) {
      data.push({
        date: dateStr,
        tsb: Math.round(wellness.ctl - wellness.atl),
        ctl: Math.round(wellness.ctl),
        atl: Math.round(wellness.atl),
      })
    }
  }
  return data
})

// SVG path for line chart
const generatePath = (values: number[], width: number, height: number, padding: number = 4) => {
  if (values.length < 2) return ''

  const min = Math.min(...values, -30)
  const max = Math.max(...values, 30)
  const range = max - min || 1

  const points = values.map((v, i) => {
    const x = padding + (i / (values.length - 1)) * (width - padding * 2)
    const y = padding + ((max - v) / range) * (height - padding * 2)
    return `${x},${y}`
  })

  return `M ${points.join(' L ')}`
}

const tsbPath = computed(() => generatePath(chartData.value.map(d => d.tsb), 320, 120))
const ctlPath = computed(() => generatePath(chartData.value.map(d => d.ctl), 320, 120))
const atlPath = computed(() => generatePath(chartData.value.map(d => d.atl), 320, 120))

// Zero line position
const zeroLineY = computed(() => {
  const values = chartData.value.map(d => d.tsb)
  if (values.length < 2) return 60
  const min = Math.min(...values, -30)
  const max = Math.max(...values, 30)
  const range = max - min || 1
  return 4 + ((max - 0) / range) * 112
})
</script>

<template>
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body p-4">
      <div class="flex items-center justify-between">
        <h2 class="card-title text-lg">⚡ Forme</h2>
        <button
          class="btn btn-ghost btn-sm btn-square"
          @click="refresh"
          :disabled="isLoading"
        >
          <span :class="{ 'animate-spin': isLoading }">🔄</span>
        </button>
      </div>

      <!-- Error state -->
      <div v-if="error" class="alert alert-error text-sm">
        {{ error }}
      </div>

      <!-- Loading state -->
      <div v-else-if="isLoading && !todayWellness" class="flex justify-center py-8">
        <span class="loading loading-spinner loading-md"></span>
      </div>

      <!-- Data display -->
      <template v-else-if="todayWellness">
        <!-- Main status -->
        <div class="flex items-center gap-4 mt-2">
          <div
            class="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
            :class="getTsbColor(currentTSB)"
          >
            {{ currentTSB ?? '?' }}
          </div>
          <div>
            <div class="text-2xl">{{ formStatus?.icon ?? '❓' }}</div>
            <div class="text-sm font-medium" :class="formStatus?.color">
              {{ formStatus?.label ?? 'Chargement...' }}
            </div>
            <div class="text-xs text-base-content/60">TSB (Form)</div>
          </div>
        </div>

        <!-- Stats row -->
        <div class="grid grid-cols-3 gap-2 mt-4">
          <div class="text-center p-2 bg-base-200 rounded-lg">
            <div class="text-lg font-bold text-info">{{ currentCTL !== null ? Math.round(currentCTL) : '-' }}</div>
            <div class="text-xs text-base-content/60">Fitness</div>
          </div>
          <div class="text-center p-2 bg-base-200 rounded-lg">
            <div class="text-lg font-bold text-warning">{{ currentATL !== null ? Math.round(currentATL) : '-' }}</div>
            <div class="text-xs text-base-content/60">Fatigue</div>
          </div>
          <div class="text-center p-2 bg-base-200 rounded-lg">
            <div class="text-lg font-bold text-primary">{{ currentHRV !== null ? Math.round(currentHRV) : '-' }}</div>
            <div class="text-xs text-base-content/60">HRV</div>
          </div>
        </div>

        <!-- Resting HR if available -->
        <div v-if="currentRestingHR" class="text-center text-xs text-base-content/50 mt-2">
          ❤️ FC repos : {{ currentRestingHR }} bpm
        </div>

        <!-- Trend Chart -->
        <div class="mt-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs text-base-content/60">Évolution</span>
            <div class="flex gap-1">
              <button
                class="btn btn-xs"
                :class="chartPeriod === 'week' ? 'btn-primary' : 'btn-ghost'"
                @click="chartPeriod = 'week'"
              >7j</button>
              <button
                class="btn btn-xs"
                :class="chartPeriod === 'month' ? 'btn-primary' : 'btn-ghost'"
                @click="chartPeriod = 'month'"
              >30j</button>
              <button
                class="btn btn-xs"
                :class="chartPeriod === '3months' ? 'btn-primary' : 'btn-ghost'"
                @click="chartPeriod = '3months'"
              >90j</button>
            </div>
          </div>

          <div v-if="chartData.length > 1" class="bg-base-200/50 rounded-xl overflow-hidden pt-5">
            <svg viewBox="0 0 320 120" class="w-full h-32">
              <!-- Zero line -->
              <line
                x1="4" :y1="zeroLineY"
                x2="316" :y2="zeroLineY"
                stroke="currentColor" stroke-opacity="0.2" stroke-dasharray="4"
              />
              <!-- CTL (Fitness) -->
              <path
                :d="ctlPath"
                fill="none"
                stroke="#38bdf8"
                stroke-width="1.5"
                stroke-opacity="0.5"
              />
              <!-- ATL (Fatigue) -->
              <path
                :d="atlPath"
                fill="none"
                stroke="#fbbf24"
                stroke-width="1.5"
                stroke-opacity="0.5"
              />
              <!-- TSB (Form) -->
              <path
                :d="tsbPath"
                fill="none"
                stroke="#22c55e"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <div class="flex justify-center gap-4 py-2 text-[10px] text-base-content/50">
              <span class="flex items-center gap-1">
                <span class="w-2 h-0.5 bg-green-500 rounded"></span> TSB
              </span>
              <span class="flex items-center gap-1">
                <span class="w-2 h-0.5 bg-sky-400 rounded opacity-50"></span> Fitness
              </span>
              <span class="flex items-center gap-1">
                <span class="w-2 h-0.5 bg-amber-400 rounded opacity-50"></span> Fatigue
              </span>
            </div>
          </div>
          <div v-else class="text-center text-xs text-base-content/40 py-4">
            Pas assez de données
          </div>
        </div>

        <!-- Last 7 days mini chart -->
        <div class="flex gap-1 mt-4 justify-between">
          <div
            v-for="day in last7Days"
            :key="day.date"
            class="flex flex-col items-center gap-1 group relative"
          >
            <div
              class="w-7 h-7 rounded-full flex items-center justify-center cursor-help"
              :class="getTsbColor(day.tsb, true)"
            >
              <span class="text-base">{{ getTsbEmoji(day.tsb) }}</span>
            </div>
            <span class="text-xs text-base-content/50">{{ day.day }}</span>

            <!-- Tooltip -->
            <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
              <div class="bg-base-300 text-base-content rounded-lg shadow-lg p-2 text-xs whitespace-nowrap">
                <div class="font-semibold mb-1 capitalize">{{ day.dateDisplay }}</div>
                <div class="space-y-0.5 text-base-content/80">
                  <div>TSB: <span class="font-medium">{{ day.tsb ?? '-' }}</span></div>
                  <div>Fitness: <span class="font-medium">{{ day.ctl ?? '-' }}</span></div>
                  <div>Fatigue: <span class="font-medium">{{ day.atl ?? '-' }}</span></div>
                  <div>HRV: <span class="font-medium">{{ day.hrv ?? '-' }}</span></div>
                </div>
                <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-base-300"></div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- No data -->
      <div v-else class="text-center py-6 text-base-content/50">
        <p>Pas de données</p>
        <p class="text-xs mt-1">Connecte Garmin à Intervals.icu</p>
      </div>

      <!-- Powered by -->
      <div class="text-center mt-3">
        <a
          href="https://intervals.icu"
          target="_blank"
          class="text-xs text-base-content/40 hover:text-base-content/60"
        >
          Powered by Intervals.icu
        </a>
      </div>
    </div>
  </div>
</template>
