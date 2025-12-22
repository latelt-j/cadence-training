<script setup lang="ts">
import { ref, computed } from 'vue'
import type { SessionTemplate, ScheduledSession, TrainingPhase, TrainingObjective, ImportedPhase } from '../types/session'

const props = defineProps<{
  sessions?: ScheduledSession[]
  trainingPhases?: TrainingPhase[]
  trainingObjectives?: TrainingObjective[]
}>()

const emit = defineEmits<{
  import: [data: (SessionTemplate | ScheduledSession)[], replaceExisting: boolean, phase?: ImportedPhase]
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const jsonText = ref('')
const error = ref('')
const copied = ref(false)
const replaceExisting = ref(true)
const coachDirective = ref('')

// Format date as YYYY-MM-DD in LOCAL timezone (not UTC!)
const formatLocalDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Get LAST week dates (Monday to Sunday) - for the weekly review/bilan
const getWeekDates = () => {
  const today = new Date()
  const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday

  // Find last week's Monday
  const lastMonday = new Date(today)
  if (dayOfWeek === 0) {
    // Sunday → last Monday was 6 days ago
    lastMonday.setDate(today.getDate() - 6)
  } else {
    // Mon-Sat → last Monday was (dayOfWeek + 6) days ago
    lastMonday.setDate(today.getDate() - dayOfWeek - 6)
  }

  const lastSunday = new Date(lastMonday)
  lastSunday.setDate(lastMonday.getDate() + 6)

  return {
    start: formatLocalDate(lastMonday),
    end: formatLocalDate(lastSunday),
  }
}

// Get week dates to plan (Monday to Sunday)
// If today is Sunday → next week, otherwise → current week
const getNextWeekDates = () => {
  const today = new Date()
  const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, etc.

  const monday = new Date(today)
  if (dayOfWeek === 0) {
    // Sunday → plan for next week (tomorrow is Monday)
    monday.setDate(today.getDate() + 1)
  } else {
    // Monday to Saturday → plan for current week (go back to Monday)
    monday.setDate(today.getDate() - (dayOfWeek - 1))
  }

  const dates = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    dates.push(formatLocalDate(d))
  }
  return dates
}

// Both computed for fresh values
const weekDates = computed(() => getWeekDates())
const nextWeekDates = computed(() => getNextWeekDates())

// Filter this week's Strava sessions
const weekStravaSessions = computed(() => {
  if (!props.sessions) return []
  const start = weekDates.value.start
  const end = weekDates.value.end
  return props.sessions.filter(s => {
    return s.date >= start && s.date <= end && s.type === 'strava'
  }).sort((a, b) => a.date.localeCompare(b.date))
})

// Current phase
const currentPhase = computed(() => {
  if (!props.trainingPhases?.length) return null
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
  if (!props.trainingPhases?.length) return null
  const nextMonday = nextWeekDates.value[0]
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
  let prompt = `# Bilan de la semaine (${weekDates.value.start} au ${weekDates.value.end})

## Phase actuelle
`

  if (currentPhase.value) {
    prompt += `**${currentPhase.value.name}** - Sem. ${phaseWeekNumber.value}/${phaseTotalWeeks.value}`
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
  if (props.trainingObjectives && props.trainingObjectives.length > 0) {
    prompt += `\n## Objectifs\n`
    const priorityLabels: Record<string, string> = { A: 'Principal', B: 'Secondaire', C: 'Préparation' }
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
  })

  const dates = nextWeekDates.value
  prompt += `
---
## Demande de plan pour la semaine prochaine (${dates[0]} au ${dates[6]})

**DATES À UTILISER (obligatoire)** :
- Lundi : ${dates[0]}
- Mardi : ${dates[1]}
- Mercredi : ${dates[2]}
- Jeudi : ${dates[3]}
- Vendredi : ${dates[4]}
- Samedi : ${dates[5]}
- Dimanche : ${dates[6]}
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

  // Add coach directive if provided
  if (coachDirective.value.trim()) {
    prompt += `\n\n⚠️ **Directive spéciale** : ${coachDirective.value.trim()}`
  }

  prompt += `

En te basant sur le bilan ci-dessus et la phase actuelle, génère-moi un plan d'entraînement pour la semaine prochaine.

Réponds UNIQUEMENT avec le code JSON brut (pas de markdown, pas de \`\`\`). Je vais copier-coller directement.

Format attendu :
{
  "phase": {
    "name": "Base",
    "week": 2,
    "total_weeks": 4,
    "description": "Construction de la base aérobie"
  },
  "sessions": [
    {
      "sport": "cycling",
      "type": "sweet_spot",
      "title": "Sweet spot 2x20min",
      "duration_min": 90,
      "description": "Description",
      "date": "${dates[0]}",
      "zwift_workout": "<workout_file>...</workout_file>"
    }
  ]
}

⚠️ SPORTS VALIDES (UNIQUEMENT ces 3, aucun autre !) : "cycling", "running", "strength"
- NE PAS inventer de nouveau sport (pas de "recovery", "yoga", "swimming", etc.)
- Pour une journée de repos, ne pas créer de séance

Types possibles :
- Intensité : "sweet_spot" (88-94% FTP), "threshold" (seuil Z4), "vo2max" (Z5), "anaerobic" (sprints Z6/Z7)
- Structure : "long_run", "long_ride" (sortie longue), "hills" (côtes), "fartlek" (jeux d'allure), "technique" (éducatifs)
- Triathlon : "brick" (enchaînement), "test" (tests FTP/VMA)
- Renfo/Récup : "recovery", "strength", "core" (gainage), "plyometrics" (pliométrie)

IMPORTANT pour les descriptions :
- Utilise \\n pour les retours à la ligne (PAS de vraies nouvelles lignes)
- PAS de markdown (pas de ** ou autres)
- Quelques emojis au début de chaque section (🔥 💪 🧘 🚴 🏃 ⛰️)
- Structure : Échauffement → Corps de séance → Retour au calme

IMPORTANT pour zwift_workout (UNIQUEMENT pour les séances cycling) :
- Génère un fichier .zwo Zwift complet au format XML
- Le XML doit être sur UNE SEULE LIGNE (pas de retours à la ligne)
- Utilise les puissances en % FTP (ex: 0.75 = 75% FTP)
- Exemple : "<workout_file><author>Coach</author><name>Sweet Spot</name><description>2x20min SS</description><sportType>bike</sportType><workout><Warmup Duration=\\"600\\" PowerLow=\\"0.50\\" PowerHigh=\\"0.70\\"/><SteadyState Duration=\\"1200\\" Power=\\"0.90\\"/><SteadyState Duration=\\"300\\" Power=\\"0.55\\"/><SteadyState Duration=\\"1200\\" Power=\\"0.90\\"/><Cooldown Duration=\\"600\\" PowerLow=\\"0.65\\" PowerHigh=\\"0.50\\"/></workout></workout_file>"

Exemples descriptions :

VÉLO : "🔥 Échauffement : 15min progressif Z1→Z2\\n🚴 Corps de séance : 2x20min Sweet Spot (88-94% FTP) avec 5min récup Z1\\n🧘 Retour au calme : 10min Z1"

COURSE : "🔥 Échauffement : 15min footing + gammes\\n🏃 Corps de séance : 8x400m allure 5km (récup 200m trot)\\n🧘 Retour au calme : 10min footing + étirements"

RENFO : "💪 Circuit 3 tours (1min récup entre tours) :\\n- Planche ventrale : 45-60 sec\\n- Planche latérale : 30 sec/côté\\n- Bird-Dog : 10 reps/côté\\n- Dead Bug : 10 reps/côté"
`

  return prompt
}

const copyCoachPrompt = async () => {
  await navigator.clipboard.writeText(generateCoachPrompt())
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}

const parseAndEmit = (text: string) => {
  error.value = ''
  try {
    let cleanText = text.trim()

    // Remove markdown code blocks if present
    cleanText = cleanText.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '')

    // Handle duplicated JSON objects (Gemini sometimes returns the same response twice)
    // Look for }{ pattern (end of object followed by start of another)
    const duplicateIndex = cleanText.search(/\}\s*\{/)
    if (duplicateIndex !== -1 && cleanText.startsWith('{')) {
      // Find the matching closing brace for the first object
      cleanText = cleanText.substring(0, duplicateIndex + 1)
    } else {
      // Try to extract JSON object or array from the text
      const jsonMatch = cleanText.match(/(\{[\s\S]*\}|\[[\s\S]*\])/)
      if (jsonMatch && jsonMatch[1]) {
        cleanText = jsonMatch[1]
      }
    }

    // Handle multiple arrays concatenated
    cleanText = cleanText.replace(/\]\s*\[/g, ',')

    const data = JSON.parse(cleanText)

    // New format with phase: { phase: {...}, sessions: [...] }
    if (data && typeof data === 'object' && !Array.isArray(data) && data.sessions) {
      const phase = data.phase as ImportedPhase | undefined
      const sessions = Array.isArray(data.sessions) ? data.sessions : [data.sessions]
      emit('import', sessions, replaceExisting.value, phase)
    } else {
      // Old format: array of sessions or single session
      const sessions = Array.isArray(data) ? data : [data]
      emit('import', sessions, replaceExisting.value)
    }

    jsonText.value = ''
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'JSON invalide'
  }
}

const handleFile = async (file: File) => {
  const text = await file.text()
  parseAndEmit(text)
}

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files?.[0]) {
    handleFile(target.files[0])
  }
}

const onDrop = (event: DragEvent) => {
  isDragging.value = false
  const file = event.dataTransfer?.files[0]
  if (file) {
    handleFile(file)
  }
}

const onPaste = (event: ClipboardEvent) => {
  const text = event.clipboardData?.getData('text')
  if (text) {
    jsonText.value = text
  }
}

const handleSubmit = () => {
  if (jsonText.value.trim()) {
    parseAndEmit(jsonText.value)
  }
}

const openFileDialog = () => {
  fileInput.value?.click()
}
</script>

<template>
  <div class="space-y-4">
    <!-- Coach directive (optional) -->
    <div class="form-control">
      <label class="label pb-1">
        <span class="label-text text-xs text-base-content/60">💬 Directive pour le coach (optionnel)</span>
      </label>
      <input
        v-model="coachDirective"
        type="text"
        class="input input-bordered input-sm w-full"
        placeholder="Ex: Je veux 2 séances vélo et 1 séance course max"
      />
    </div>

    <!-- Ask coach button -->
    <button
      class="btn w-full text-white font-semibold border-0 shadow-lg"
      :class="copied ? 'btn-success' : 'bg-pink-500 hover:bg-pink-600 shadow-pink-500/40'"
      @click="copyCoachPrompt"
    >
      {{ copied ? '✓ Copié !' : '🤖 Demander au coach (copier le prompt)' }}
    </button>

    <div class="divider text-xs text-base-content/50">OU IMPORTER</div>

    <!-- Drop zone -->
    <div
      class="border-2 border-dashed rounded-box p-6 transition-all cursor-pointer"
      :class="isDragging ? 'border-primary bg-primary/10' : 'border-base-300 hover:border-primary'"
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @drop.prevent="onDrop"
      @click="openFileDialog"
    >
      <input
        ref="fileInput"
        type="file"
        accept=".json"
        class="hidden"
        @change="onFileChange"
      />
      <div class="flex flex-col items-center gap-2 text-base-content/70">
        <span class="text-3xl">📁</span>
        <p class="text-sm font-medium">Glisse un fichier JSON ou clique</p>
      </div>
    </div>

    <div class="divider text-xs text-base-content/50">OU</div>

    <!-- Paste area -->
    <div class="space-y-2">
      <textarea
        v-model="jsonText"
        class="textarea textarea-bordered w-full h-40 font-mono text-sm"
        placeholder='Colle ton JSON ici...

[
  {
    "sport": "cycling",
    "type": "sweet_spot",
    "title": "Sweet spot 2x20min",
    "duration_min": 90,
    "date": "2025-01-15"
  }
]'
        @paste="onPaste"
      ></textarea>
      <div class="form-control">
        <label class="label cursor-pointer justify-start gap-2">
          <input
            type="checkbox"
            v-model="replaceExisting"
            class="checkbox checkbox-sm checkbox-primary"
          />
          <span class="label-text">Remplacer les séances existantes sur ces jours</span>
        </label>
      </div>
      <button
        class="btn btn-primary btn-sm w-full"
        :disabled="!jsonText.trim()"
        @click="handleSubmit"
      >
        Importer
      </button>
    </div>

    <!-- Error -->
    <div v-if="error" class="alert alert-error text-sm">
      <span>{{ error }}</span>
    </div>
  </div>
</template>
