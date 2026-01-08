<script setup lang="ts">
import { computed } from 'vue'
import type { TrainingPhase } from '../types/session'

const props = defineProps<{
  phases: TrainingPhase[]
}>()

// Sort phases by start_date
const sortedPhases = computed(() => {
  return [...props.phases].sort((a, b) => a.start_date.localeCompare(b.start_date))
})

// Get phase status
const getPhaseStatus = (phase: TrainingPhase): 'past' | 'current' | 'future' => {
  const today = new Date().toISOString().split('T')[0] ?? ''
  if (phase.end_date < today) return 'past'
  if (phase.start_date <= today && phase.end_date >= today) return 'current'
  return 'future'
}

// Calculate progress within current phase (0-100)
const getCurrentPhaseProgress = (phase: TrainingPhase): number => {
  const today = new Date()
  const start = new Date(phase.start_date)
  const end = new Date(phase.end_date)
  const total = end.getTime() - start.getTime()
  const elapsed = today.getTime() - start.getTime()
  return Math.min(100, Math.max(0, (elapsed / total) * 100))
}

// Current phase info
const currentPhase = computed(() => {
  return sortedPhases.value.find(p => getPhaseStatus(p) === 'current')
})

// Current week within cycle
const currentWeekInfo = computed(() => {
  if (!currentPhase.value) return null
  const today = new Date()
  const start = new Date(currentPhase.value.start_date)
  const end = new Date(currentPhase.value.end_date)
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  const elapsedDays = Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  const totalWeeks = Math.ceil(totalDays / 7)
  const currentWeek = Math.min(Math.ceil(elapsedDays / 7), totalWeeks)
  return { current: currentWeek, total: totalWeeks }
})
</script>

<template>
  <div v-if="sortedPhases.length > 0" class="card bg-base-100 shadow-xl">
    <div class="card-body py-4 px-4">
      <!-- Header with current phase info -->
      <div class="flex items-center justify-between mb-3">
        <h2 class="card-title text-base">
          <span class="text-lg">📈</span>
          Progression
        </h2>
        <div v-if="currentPhase && currentWeekInfo" class="badge badge-primary badge-sm gap-1">
          S{{ currentWeekInfo.current }}/{{ currentWeekInfo.total }}
        </div>
      </div>

      <!-- Horizontal timeline -->
      <div class="flex items-center gap-1 overflow-x-auto pb-2">
        <template v-for="(phase, index) in sortedPhases" :key="phase.id">
          <!-- Phase segment -->
          <div
            class="flex-1 min-w-[60px] relative group cursor-default"
            :class="{ 'flex-[2]': getPhaseStatus(phase) === 'current' }"
          >
            <!-- Progress bar background -->
            <div
              class="h-8 rounded-lg relative overflow-hidden transition-all duration-300"
              :class="{
                'bg-primary/30': getPhaseStatus(phase) === 'past',
                'bg-base-300': getPhaseStatus(phase) === 'future',
                'bg-base-300 ring-2 ring-primary ring-offset-2 ring-offset-base-100': getPhaseStatus(phase) === 'current'
              }"
            >
              <!-- Progress fill for current phase -->
              <div
                v-if="getPhaseStatus(phase) === 'current'"
                class="absolute inset-y-0 left-0 bg-primary transition-all duration-1000 ease-out rounded-lg"
                :style="{ width: `${getCurrentPhaseProgress(phase)}%` }"
              >
                <!-- Animated shimmer effect -->
                <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
              </div>

              <!-- Full fill for past phases -->
              <div
                v-else-if="getPhaseStatus(phase) === 'past'"
                class="absolute inset-0 bg-primary/60 rounded-lg"
              ></div>

              <!-- Phase emoji centered -->
              <div class="absolute inset-0 flex items-center justify-center">
                <span
                  class="text-lg transition-transform group-hover:scale-125"
                  :class="{
                    'opacity-100': getPhaseStatus(phase) !== 'future',
                    'opacity-40': getPhaseStatus(phase) === 'future'
                  }"
                >
                  {{ phase.emoji || '📊' }}
                </span>
              </div>
            </div>

            <!-- Phase name (shown on hover via tooltip) -->
            <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-base-content/50 opacity-0 group-hover:opacity-100 transition-opacity">
              {{ phase.name }}
            </div>

            <!-- Tooltip on hover -->
            <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-base-300 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-10 min-w-[140px]">
              <div class="text-sm font-semibold flex items-center gap-2">
                <span>{{ phase.emoji || '📊' }}</span>
                <span>{{ phase.name }}</span>
              </div>
              <div class="text-xs text-base-content/60 mt-1">
                {{ phase.start_date.split('-').slice(1).reverse().join('/') }} → {{ phase.end_date.split('-').slice(1).reverse().join('/') }}
              </div>
              <div v-if="phase.objectives" class="text-xs text-base-content/70 mt-1 line-clamp-2">
                {{ phase.objectives }}
              </div>
              <!-- Arrow -->
              <div class="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-base-300"></div>
            </div>
          </div>

          <!-- Connector between phases -->
          <div
            v-if="index < sortedPhases.length - 1"
            class="w-2 h-0.5 flex-shrink-0"
            :class="{
              'bg-primary': getPhaseStatus(phase) === 'past' || getPhaseStatus(phase) === 'current',
              'bg-base-300': getPhaseStatus(phase) === 'future'
            }"
          ></div>
        </template>
      </div>

      <!-- Current phase name displayed below -->
      <div v-if="currentPhase" class="mt-4 text-center">
        <span class="text-sm text-base-content/70">Cycle actuel : </span>
        <span class="font-semibold text-primary">{{ currentPhase.emoji }} {{ currentPhase.name }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}
</style>
