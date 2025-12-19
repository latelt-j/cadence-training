<script setup lang="ts">
import { computed } from 'vue'
import type { WeeklyStats } from '../types/session'

const props = defineProps<{
  stats: WeeklyStats
}>()

const formatHours = (hours: number) => {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h${m.toString().padStart(2, '0')}`
}

const formatKm = (km: number) => {
  return km.toFixed(1)
}

const formatElevation = (m: number) => {
  return Math.round(m)
}

// Battery gauge calculations
const totalPlanned = computed(() => props.stats.planned.hours + props.stats.accomplished.hours)
const progressPercent = computed(() => {
  if (totalPlanned.value === 0) return 0
  return Math.min(100, Math.round((props.stats.accomplished.hours / totalPlanned.value) * 100))
})

const batteryColor = computed(() => {
  if (progressPercent.value >= 80) return 'bg-success'
  if (progressPercent.value >= 50) return 'bg-warning'
  return 'bg-error'
})

const batteryTextColor = computed(() => {
  if (progressPercent.value >= 80) return 'text-success'
  if (progressPercent.value >= 50) return 'text-warning'
  return 'text-error'
})

// Per-sport progress
const getSportProgress = (planned: number, accomplished: number) => {
  const total = planned + accomplished
  if (total === 0) return 0
  return Math.min(100, Math.round((accomplished / total) * 100))
}

const cyclingProgress = computed(() => getSportProgress(props.stats.cycling.planned, props.stats.cycling.accomplished))
const runningProgress = computed(() => getSportProgress(props.stats.running.planned, props.stats.running.accomplished))
const strengthProgress = computed(() => getSportProgress(props.stats.strength.planned, props.stats.strength.accomplished))
</script>

<template>
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title">📊 Volume de la semaine</h2>

      <!-- Battery Gauge -->
      <div v-if="totalPlanned > 0" class="mt-2">
        <div class="flex items-center gap-3">
          <!-- Battery container -->
          <div class="flex-1 relative">
            <div class="h-8 bg-base-300 rounded-lg overflow-hidden border-2 border-base-content/20 relative">
              <!-- Battery fill -->
              <div
                class="h-full transition-all duration-500 ease-out"
                :class="batteryColor"
                :style="{ width: `${progressPercent}%` }"
              ></div>
              <!-- Battery segments -->
              <div class="absolute inset-0 flex">
                <div v-for="i in 4" :key="i" class="flex-1 border-r border-base-content/10 last:border-r-0"></div>
              </div>
            </div>
            <!-- Battery tip -->
            <div class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full w-2 h-4 bg-base-content/20 rounded-r-sm"></div>
          </div>
          <!-- Percentage -->
          <div class="text-right min-w-16">
            <span class="text-2xl font-bold" :class="batteryTextColor">{{ progressPercent }}%</span>
          </div>
        </div>
        <div class="flex justify-between text-xs text-base-content/60 mt-1 px-1">
          <span>{{ formatHours(stats.accomplished.hours) }} accompli</span>
          <span>{{ formatHours(totalPlanned) }} prévu</span>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-4 mt-4">
        <!-- Cycling Stats -->
        <div class="bg-success/10 rounded-box relative overflow-hidden">
          <!-- Progress background -->
          <div
            class="absolute inset-0 bg-success/20 transition-all duration-500"
            :style="{ width: `${cyclingProgress}%` }"
          ></div>
          <div class="relative p-3">
            <div class="flex items-center justify-between">
              <span class="text-xs opacity-70">Vélo</span>
              <span class="text-lg">🚴</span>
            </div>
            <div class="text-success text-2xl font-bold">{{ formatHours(stats.cycling.hours) }}</div>
            <div class="text-xs opacity-70">
              ~{{ formatKm(stats.cycling.km) }} km • {{ formatElevation(stats.cycling.elevation) }} D+
            </div>
          </div>
        </div>

        <!-- Running Stats -->
        <div class="bg-warning/10 rounded-box relative overflow-hidden">
          <!-- Progress background -->
          <div
            class="absolute inset-0 bg-warning/20 transition-all duration-500"
            :style="{ width: `${runningProgress}%` }"
          ></div>
          <div class="relative p-3">
            <div class="flex items-center justify-between">
              <span class="text-xs opacity-70">Course</span>
              <span class="text-lg">🏃</span>
            </div>
            <div class="text-warning text-2xl font-bold">{{ formatHours(stats.running.hours) }}</div>
            <div class="text-xs opacity-70">
              ~{{ formatKm(stats.running.km) }} km • {{ formatElevation(stats.running.elevation) }} D+
            </div>
          </div>
        </div>

        <!-- Strength Stats -->
        <div class="bg-error/10 rounded-box relative overflow-hidden">
          <!-- Progress background -->
          <div
            class="absolute inset-0 bg-error/20 transition-all duration-500"
            :style="{ width: `${strengthProgress}%` }"
          ></div>
          <div class="relative p-3">
            <div class="flex items-center justify-between">
              <span class="text-xs opacity-70">Renfo</span>
              <span class="text-lg">💪</span>
            </div>
            <div class="text-error text-2xl font-bold">{{ formatHours(stats.strength.hours) }}</div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
