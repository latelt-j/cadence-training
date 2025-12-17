<script setup lang="ts">
import type { WeeklyStats } from '../types/session'

defineProps<{
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
</script>

<template>
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title">📊 Volume de la semaine</h2>

      <div class="grid grid-cols-3 gap-4 mt-4">
        <!-- Cycling Stats -->
        <div class="stat bg-success/10 rounded-box p-4">
          <div class="stat-figure text-success">
            <span class="text-3xl">🚴</span>
          </div>
          <div class="stat-title">Vélo</div>
          <div class="stat-value text-success text-2xl">{{ formatHours(stats.cycling.hours) }}</div>
          <div class="stat-desc">
            ~{{ formatKm(stats.cycling.km) }} km • {{ formatElevation(stats.cycling.elevation) }} D+
          </div>
        </div>

        <!-- Running Stats -->
        <div class="stat bg-warning/10 rounded-box p-4">
          <div class="stat-figure text-warning">
            <span class="text-3xl">🏃</span>
          </div>
          <div class="stat-title">Course</div>
          <div class="stat-value text-warning text-2xl">{{ formatHours(stats.running.hours) }}</div>
          <div class="stat-desc">
            ~{{ formatKm(stats.running.km) }} km • {{ formatElevation(stats.running.elevation) }} D+
          </div>
        </div>

        <!-- Strength Stats -->
        <div class="stat bg-error/10 rounded-box p-4">
          <div class="stat-figure text-error">
            <span class="text-3xl">💪</span>
          </div>
          <div class="stat-title">Renfo</div>
          <div class="stat-value text-error text-2xl">{{ formatHours(stats.strength.hours) }}</div>
          <div class="stat-desc">&nbsp;</div>
        </div>
      </div>

      <!-- Total -->
      <div class="divider"></div>
      <div class="flex justify-center gap-8">
        <div class="text-center">
          <div class="text-3xl font-bold text-primary">{{ formatHours(stats.total.hours) }}</div>
          <div class="text-sm text-base-content/70">Total</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-secondary">{{ stats.total.sessions }}</div>
          <div class="text-sm text-base-content/70">Séances</div>
        </div>
      </div>
    </div>
  </div>
</template>
