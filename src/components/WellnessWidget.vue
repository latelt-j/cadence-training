<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
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

// Fitness trend: compare current CTL to 15-day average
const fitnessTrend = computed(() => {
  if (currentCTL.value === null || wellnessHistory.value.length < 15) return null

  // Get CTL values from last 15 days
  const ctlValues: number[] = []
  for (let i = 15; i >= 1; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const dayNum = String(d.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${dayNum}`
    const wellness = wellnessHistory.value.find(w => w.id === dateStr)
    if (wellness?.ctl) {
      ctlValues.push(wellness.ctl)
    }
  }

  if (ctlValues.length < 5) return null // Not enough data

  const avg = ctlValues.reduce((a, b) => a + b, 0) / ctlValues.length
  return Math.round(currentCTL.value - avg)
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

// ApexCharts configuration
const chartSeries = computed(() => [
  {
    name: 'Forme (TSB)',
    data: chartData.value.map(d => ({ x: d.date, y: d.tsb })),
  },
  {
    name: 'Fitness (CTL)',
    data: chartData.value.map(d => ({ x: d.date, y: d.ctl })),
  },
  {
    name: 'Fatigue (ATL)',
    data: chartData.value.map(d => ({ x: d.date, y: d.atl })),
  },
])

const chartOptions = computed(() => ({
  chart: {
    type: 'area' as const,
    height: 180,
    toolbar: { show: false },
    zoom: { enabled: false },
    background: 'transparent',
    fontFamily: 'inherit',
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 500,
    },
  },
  colors: ['#22c55e', '#ec4899', '#fbbf24'], // TSB green, Fitness pink, Fatigue yellow
  stroke: {
    width: [3, 2, 2],
    curve: 'smooth' as const,
    dashArray: [0, 0, 0],
  },
  fill: {
    type: 'gradient',
    gradient: {
      shade: 'dark',
      type: 'vertical',
      shadeIntensity: 0,
      opacityFrom: 0.3,
      opacityTo: 0,
      stops: [0, 100],
    },
  },
  grid: {
    borderColor: 'rgba(255,255,255,0.1)',
    strokeDashArray: 4,
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } },
  },
  xaxis: {
    type: 'datetime' as const,
    labels: {
      style: { colors: 'rgba(255,255,255,0.5)', fontSize: '10px' },
      datetimeFormatter: { day: 'dd MMM' },
    },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: {
      style: { colors: 'rgba(255,255,255,0.5)', fontSize: '10px' },
      formatter: (val: number) => Math.round(val).toString(),
    },
  },
  annotations: {
    yaxis: [{
      y: 0,
      strokeDashArray: 4,
      borderColor: 'rgba(255,255,255,0.3)',
    }],
  },
  legend: {
    show: true,
    position: 'bottom' as const,
    horizontalAlign: 'center' as const,
    fontSize: '11px',
    labels: { colors: 'rgba(255,255,255,0.6)' },
    markers: { size: 4 },
    itemMargin: { horizontal: 8 },
  },
  tooltip: {
    theme: 'dark',
    shared: true,
    intersect: false,
    x: {
      format: 'dd MMM yyyy',
    },
    y: {
      formatter: (val: number) => val !== null ? Math.round(val).toString() : '-',
    },
  },
  dataLabels: { enabled: false },
}))
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
            class="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold transition-all"
            :class="[
              getTsbColor(currentTSB),
              currentTSB !== null && currentTSB <= -10 ? 'animate-pulse shadow-lg shadow-orange-500/50' : '',
              currentTSB !== null && currentTSB <= -25 ? 'shadow-rose-600/60 ring-2 ring-rose-500/50' : ''
            ]"
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
          <div class="tooltip tooltip-bottom" data-tip="Ta forme physique accumulée sur ~6 semaines. Plus c'est haut, plus t'es entraîné.">
            <div class="text-center p-2 bg-pink-500/10 rounded-lg cursor-help">
              <div class="text-lg font-bold text-pink-400 flex items-center justify-center gap-1">
                {{ currentCTL !== null ? Math.round(currentCTL) : '-' }}
                <span
                  v-if="fitnessTrend !== null"
                  class="text-xs font-medium"
                  :class="fitnessTrend >= 0 ? 'text-emerald-400' : 'text-rose-400'"
                >
                  {{ fitnessTrend >= 0 ? '+' : '' }}{{ fitnessTrend }}
                </span>
              </div>
              <div class="text-xs text-base-content/60">Fitness</div>
            </div>
          </div>
          <div class="tooltip tooltip-bottom" data-tip="Ta fatigue récente sur ~7 jours. Élevée après des gros entraînements.">
            <div class="text-center p-2 bg-amber-500/10 rounded-lg cursor-help">
              <div class="text-lg font-bold text-amber-400">{{ currentATL !== null ? Math.round(currentATL) : '-' }}</div>
              <div class="text-xs text-base-content/60">Fatigue</div>
            </div>
          </div>
          <div class="tooltip tooltip-bottom" data-tip="Variabilité cardiaque = récupération. Plus c'est haut, mieux tu récupères.">
            <div class="text-center p-2 bg-sky-500/10 rounded-lg cursor-help">
              <div class="text-lg font-bold text-sky-400">{{ currentHRV !== null ? Math.round(currentHRV) : '-' }}</div>
              <div class="text-xs text-base-content/60">HRV</div>
            </div>
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

          <div v-if="chartData.length > 1" class="bg-base-200/50 rounded-xl overflow-hidden">
            <VueApexCharts
              type="area"
              height="180"
              :options="chartOptions"
              :series="chartSeries"
            />
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
