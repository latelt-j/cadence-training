<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ScheduledSession, TrainingPhase, TrainingObjective } from '../types/session'

const props = defineProps<{
  sessions: ScheduledSession[]
  trainingPhases: TrainingPhase[]
  trainingObjectives: TrainingObjective[]
}>()

const emit = defineEmits<{
  close: []
}>()

const copied = ref(false)

// Get current week dates (Monday to Sunday)
const getWeekDates = () => {
  const today = new Date()
  const day = today.getDay()
  const diff = today.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(today)
  monday.setDate(diff)

  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  return {
    start: monday.toISOString().split('T')[0],
    end: sunday.toISOString().split('T')[0],
  }
}

// Get next week dates
const getNextWeekDates = () => {
  const today = new Date()
  const day = today.getDay()
  const diff = today.getDate() - day + (day === 0 ? 1 : 8) // Next Monday
  const monday = new Date(today)
  monday.setDate(diff)

  const dates = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    dates.push(d.toISOString().split('T')[0])
  }
  return dates
}

const weekDates = getWeekDates()
const nextWeekDates = getNextWeekDates()

// Filter this week's Strava sessions
const weekStravaSessions = computed(() => {
  const start = weekDates.start ?? ''
  const end = weekDates.end ?? ''
  return props.sessions.filter(s => {
    return s.date >= start && s.date <= end && s.type === 'strava'
  }).sort((a, b) => a.date.localeCompare(b.date))
})

// Current phase
const currentPhase = computed(() => {
  const today = new Date().toISOString().split('T')[0] ?? ''
  return props.trainingPhases.find(p => p.start_date <= today && p.end_date >= today)
})

// Week number within current phase
const phaseWeekNumber = computed(() => {
  if (!currentPhase.value) return null
  const phaseStart = new Date(currentPhase.value.start_date)
  const today = new Date()
  const diffTime = today.getTime() - phaseStart.getTime()
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

// Next week phase
const nextWeekPhase = computed(() => {
  const nextMonday = nextWeekDates[0]
  return props.trainingPhases.find(p => p.start_date <= nextMonday! && p.end_date >= nextMonday!)
})

// Week stats
const weekStats = computed(() => {
  const stats = {
    totalHours: 0,
    totalKm: 0,
    totalElevation: 0,
    cycling: { hours: 0, km: 0, elevation: 0, count: 0 },
    running: { hours: 0, km: 0, elevation: 0, count: 0 },
    strength: { hours: 0, count: 0 },
  }

  weekStravaSessions.value.forEach(s => {
    const hours = s.duration_min / 60
    stats.totalHours += hours

    if (s.sport === 'cycling') {
      stats.cycling.hours += hours
      stats.cycling.km += s.actual_km ?? 0
      stats.cycling.elevation += s.actual_elevation ?? 0
      stats.cycling.count++
    } else if (s.sport === 'running') {
      stats.running.hours += hours
      stats.running.km += s.actual_km ?? 0
      stats.running.elevation += s.actual_elevation ?? 0
      stats.running.count++
    } else if (s.sport === 'strength') {
      stats.strength.hours += hours
      stats.strength.count++
    }

    stats.totalKm += s.actual_km ?? 0
    stats.totalElevation += s.actual_elevation ?? 0
  })

  return stats
})

const formatHours = (hours: number) => {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h${m.toString().padStart(2, '0')}`
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

// Generate coach prompt
const generateCoachPrompt = () => {
  let prompt = `# Bilan de la semaine (${weekDates.start} au ${weekDates.end})

## Phase actuelle
`

  if (currentPhase.value) {
    prompt += `**${currentPhase.value.name}**`
    if (currentPhase.value.description) {
      prompt += ` - ${currentPhase.value.description}`
    }
    if (currentPhase.value.goals) {
      prompt += `\nObjectifs : ${currentPhase.value.goals}`
    }
    prompt += `\n(Du ${currentPhase.value.start_date} au ${currentPhase.value.end_date})\n`
  } else {
    prompt += `⚠️ Aucune phase définie\n`
  }

  // Add objectives
  if (props.trainingObjectives.length > 0) {
    prompt += `\n## Objectifs\n`
    const priorityLabels = { A: 'Principal', B: 'Secondaire', C: 'Préparation' }
    props.trainingObjectives.forEach(obj => {
      const daysLeft = Math.ceil((new Date(obj.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      const typeLabel = obj.type === 'trail' ? '🏃 Trail' : '🚴 Vélo route'
      const priorityLabel = priorityLabels[obj.priority] || obj.priority
      prompt += `\n**[${obj.priority}] ${obj.name}** (${typeLabel}, ${priorityLabel}) - J-${daysLeft}\n`
      prompt += `- Date : ${obj.date}\n`
      prompt += `- Distance : ${obj.distance_km} km\n`
      prompt += `- D+ : ${obj.elevation_gain}m`
      if (obj.type === 'trail' && obj.elevation_loss) {
        prompt += ` / D- : ${obj.elevation_loss}m`
      }
      prompt += '\n'
    })
  }

  prompt += `
## Séances accomplies cette semaine

**Volume total : ${formatHours(weekStats.value.totalHours)}** (${weekStravaSessions.value.length} séances)
- 🚴 Vélo : ${formatHours(weekStats.value.cycling.hours)} (${weekStats.value.cycling.count} séances, ${weekStats.value.cycling.km.toFixed(1)} km, ${Math.round(weekStats.value.cycling.elevation)} D+)
- 🏃 Course : ${formatHours(weekStats.value.running.hours)} (${weekStats.value.running.count} séances, ${weekStats.value.running.km.toFixed(1)} km, ${Math.round(weekStats.value.running.elevation)} D+)
- 💪 Renfo : ${formatHours(weekStats.value.strength.hours)} (${weekStats.value.strength.count} séances)

### Détail des séances
`

  weekStravaSessions.value.forEach(s => {
    prompt += `\n**${formatDate(s.date)} - ${s.title}** (${s.sport})\n`
    prompt += `- Durée : ${formatHours(s.duration_min / 60)}`
    if (s.actual_km) prompt += `, Distance : ${s.actual_km.toFixed(1)} km`
    if (s.actual_elevation) prompt += `, D+ : ${Math.round(s.actual_elevation)}m`
    if (s.average_heartrate) prompt += `, FC moy : ${Math.round(s.average_heartrate)} bpm`
    if (s.average_watts) prompt += `, Puissance moy : ${Math.round(s.average_watts)} W`
    prompt += '\n'
    if (s.coach_feedback) {
      prompt += `- Feedback coach : ${s.coach_feedback.substring(0, 200)}...\n`
    }
  })

  prompt += `
---
## Demande de plan pour la semaine prochaine (${nextWeekDates[0]} au ${nextWeekDates[6]})
`

  if (nextWeekPhase.value) {
    prompt += `\nPhase prévue : **${nextWeekPhase.value.name}**`
    if (nextWeekPhase.value.description) {
      prompt += ` - ${nextWeekPhase.value.description}`
    }
    if (nextWeekPhase.value.goals) {
      prompt += `\nObjectifs de la phase : ${nextWeekPhase.value.goals}`
    }
  }

  prompt += `

En te basant sur le bilan ci-dessus et la phase actuelle, génère-moi un plan d'entraînement pour la semaine prochaine.

Réponds UNIQUEMENT avec le code JSON brut (pas de markdown, pas de \`\`\`). Je vais copier-coller directement.

Format attendu :
[
  {
    "sport": "cycling",
    "type": "endurance",
    "title": "Sortie Z2",
    "duration_min": 90,
    "description": "Description de la séance",
    "date": "${nextWeekDates[0]}",
    "structure": []
  }
]

Sports possibles : "cycling", "running", "strength"
Types possibles : "endurance", "interval", "tempo", "recovery", "strength", "race"
`

  return prompt
}

const copyPrompt = async () => {
  await navigator.clipboard.writeText(generateCoachPrompt())
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}
</script>

<template>
  <div class="space-y-4">
    <!-- Phase warning -->
    <div v-if="!currentPhase" class="alert alert-warning">
      <span>⚠️ Aucune phase d'entraînement définie pour cette semaine</span>
    </div>

    <!-- Current phase -->
    <div v-else class="bg-base-200 rounded-lg p-4">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-xs text-base-content/60">Phase actuelle</div>
          <div class="flex items-center gap-2">
            <span class="font-bold text-lg">{{ currentPhase.name }}</span>
            <span v-if="phaseWeekNumber" class="badge badge-primary">
              Sem. {{ phaseWeekNumber }}/{{ phaseTotalWeeks }}
            </span>
          </div>
          <div v-if="currentPhase.description" class="text-sm text-base-content/70">
            {{ currentPhase.description }}
          </div>
        </div>
      </div>
    </div>

    <!-- Week summary -->
    <div class="bg-base-200 rounded-lg p-4">
      <h3 class="font-bold mb-3">📊 Bilan de la semaine</h3>

      <div class="text-2xl font-bold text-primary mb-2">
        {{ formatHours(weekStats.totalHours) }}
        <span class="text-sm font-normal text-base-content/60">
          ({{ weekStravaSessions.length }} séances)
        </span>
      </div>

      <div class="grid grid-cols-3 gap-2 text-sm">
        <div class="text-center p-2 bg-success/10 rounded">
          <div class="text-success font-bold">🚴 {{ formatHours(weekStats.cycling.hours) }}</div>
          <div class="text-xs text-base-content/60">{{ weekStats.cycling.km.toFixed(0) }} km</div>
        </div>
        <div class="text-center p-2 bg-warning/10 rounded">
          <div class="text-warning font-bold">🏃 {{ formatHours(weekStats.running.hours) }}</div>
          <div class="text-xs text-base-content/60">{{ weekStats.running.km.toFixed(0) }} km</div>
        </div>
        <div class="text-center p-2 bg-error/10 rounded">
          <div class="text-error font-bold">💪 {{ formatHours(weekStats.strength.hours) }}</div>
          <div class="text-xs text-base-content/60">{{ weekStats.strength.count }} séances</div>
        </div>
      </div>
    </div>

    <!-- Sessions list -->
    <div v-if="weekStravaSessions.length > 0" class="bg-base-200 rounded-lg p-4">
      <h3 class="font-bold mb-3">🏋️ Séances accomplies</h3>
      <div class="space-y-2 max-h-48 overflow-y-auto">
        <div
          v-for="session in weekStravaSessions"
          :key="session.id"
          class="flex items-center gap-2 text-sm p-2 bg-base-100 rounded"
        >
          <span>{{ session.sport === 'cycling' ? '🚴' : session.sport === 'running' ? '🏃' : '💪' }}</span>
          <span class="font-medium">{{ session.title }}</span>
          <span class="text-base-content/60">{{ formatHours(session.duration_min / 60) }}</span>
          <span v-if="session.actual_km" class="text-base-content/60">{{ session.actual_km.toFixed(1) }}km</span>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-4 text-base-content/50">
      Aucune séance Strava cette semaine
    </div>

    <!-- Copy button -->
    <button
      class="btn btn-primary w-full"
      :class="{ 'btn-success': copied }"
      @click="copyPrompt"
    >
      {{ copied ? '✓ Copié !' : '📋 Copier le bilan pour le coach' }}
    </button>

    <p class="text-xs text-center text-base-content/50">
      Colle ce bilan dans Gemini pour générer le plan de la semaine prochaine
    </p>
  </div>
</template>
