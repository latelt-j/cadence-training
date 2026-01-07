<script setup lang="ts">
import { ref, computed } from 'vue'
import type { SessionTemplate, ScheduledSession, TrainingPhase, TrainingObjective, ImportedPhase, AthleteProfile } from '../types/session'

const props = defineProps<{
  sessions?: ScheduledSession[]
  trainingPhases?: TrainingPhase[]
  trainingObjectives?: TrainingObjective[]
  athleteProfile?: AthleteProfile
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

// Nouveaux champs pour le prompt coach
const fatigue = ref<number>(5)
const toutRealise = ref<'oui' | 'non' | 'partiel'>('oui')
const difficulte = ref<'facile' | 'normal' | 'difficile'>('normal')
const contraintes = ref('')
const envies = ref('')

// Custom date range for workout request
const getDefaultPlanDates = () => {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const monday = new Date(today)
  if (dayOfWeek === 0) {
    monday.setDate(today.getDate() + 1)
  } else {
    monday.setDate(today.getDate() - (dayOfWeek - 1))
  }
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return {
    start: `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`,
    end: `${sunday.getFullYear()}-${String(sunday.getMonth() + 1).padStart(2, '0')}-${String(sunday.getDate()).padStart(2, '0')}`,
  }
}
const defaultDates = getDefaultPlanDates()
const planStartDate = ref(defaultDates.start)
const planEndDate = ref(defaultDates.end)

// Format date as YYYY-MM-DD in LOCAL timezone (not UTC!)
const formatLocalDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Bilan week: the week BEFORE the planning period starts
const bilanWeekDates = computed(() => {
  const planStart = new Date(planStartDate.value)
  const dayOfWeek = planStart.getDay() // 0 = Sunday, 1 = Monday

  // Find the Monday of the week before planStart
  const prevMonday = new Date(planStart)
  if (dayOfWeek === 0) {
    // planStart is Sunday → previous Monday was 6 days ago
    prevMonday.setDate(planStart.getDate() - 6)
  } else if (dayOfWeek === 1) {
    // planStart is Monday → previous Monday was 7 days ago
    prevMonday.setDate(planStart.getDate() - 7)
  } else {
    // Tue-Sat → go back to this week's Monday, then subtract 7
    prevMonday.setDate(planStart.getDate() - (dayOfWeek - 1) - 7)
  }

  const prevSunday = new Date(prevMonday)
  prevSunday.setDate(prevMonday.getDate() + 6)

  return {
    start: formatLocalDate(prevMonday),
    end: formatLocalDate(prevSunday),
  }
})

// Generate all dates in the selected plan range
const planDatesRange = computed(() => {
  const dates: string[] = []
  const start = new Date(planStartDate.value)
  const end = new Date(planEndDate.value)
  const current = new Date(start)
  while (current <= end) {
    dates.push(formatLocalDate(current))
    current.setDate(current.getDate() + 1)
  }
  return dates
})

// Get day name in French
const getDayName = (dateStr: string) => {
  const date = new Date(dateStr)
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
  return days[date.getDay()]
}

// Filter Strava sessions for the bilan week (week before planning period)
const bilanStravaSessions = computed(() => {
  if (!props.sessions) return []
  const start = bilanWeekDates.value.start
  const end = bilanWeekDates.value.end
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

// Parse date string as local date (not UTC)
const parseLocalDate = (dateStr: string): Date => {
  const parts = dateStr.split('-').map(Number)
  return new Date(parts[0] ?? 2025, (parts[1] ?? 1) - 1, parts[2] ?? 1)
}

// Week number within current phase
const phaseWeekNumber = computed(() => {
  if (!currentPhase.value) return null
  const phaseStart = parseLocalDate(currentPhase.value.start_date)
  phaseStart.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffTime = today.getTime() - phaseStart.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(1, Math.floor(diffDays / 7) + 1)
})

// Total weeks in current phase
const phaseTotalWeeks = computed(() => {
  if (!currentPhase.value) return null
  const phaseStart = parseLocalDate(currentPhase.value.start_date)
  const phaseEnd = parseLocalDate(currentPhase.value.end_date)
  const diffTime = phaseEnd.getTime() - phaseStart.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  return Math.ceil(diffDays / 7)
})

// Week stats
const weekStats = computed(() => {
  const stats = {
    totalHours: 0,
    totalKm: 0,
    totalElevation: 0,
    cycling: { hours: 0, km: 0, elevation: 0, count: 0 },
    mtb: { hours: 0, km: 0, elevation: 0, count: 0 },
    running: { hours: 0, km: 0, elevation: 0, count: 0 },
    strength: { hours: 0, count: 0 },
  }

  bilanStravaSessions.value.forEach(s => {
    const hours = s.duration_min / 60
    stats.totalHours += hours

    if (s.sport === 'cycling') {
      stats.cycling.hours += hours
      stats.cycling.km += s.actual_km ?? 0
      stats.cycling.elevation += s.actual_elevation ?? 0
      stats.cycling.count++
    } else if (s.sport === 'mtb') {
      stats.mtb.hours += hours
      stats.mtb.km += s.actual_km ?? 0
      stats.mtb.elevation += s.actual_elevation ?? 0
      stats.mtb.count++
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

// Generate coach prompt with new structured format
const generateCoachPrompt = () => {
  const dates = planDatesRange.value
  const datesListStr = dates.map(d => `- ${getDayName(d)} : ${d}`).join('\n')

  // Find phase for the plan period
  const planPhase = props.trainingPhases?.find(p => p.start_date <= planStartDate.value && p.end_date >= planStartDate.value)

  let prompt = `# [DEMANDE DE PLAN D'ENTRAÎNEMENT]

---

**1. PROFIL ATHLÈTE**
`

  // Athlete profile
  if (props.athleteProfile?.ftp) {
    prompt += `- FTP : ${props.athleteProfile.ftp} W\n`
  }
  if (props.athleteProfile?.max_hr || props.athleteProfile?.resting_hr) {
    prompt += `- FC Max : ${props.athleteProfile.max_hr ?? '?'} bpm / Repos : ${props.athleteProfile.resting_hr ?? '?'} bpm\n`
  }
  prompt += `- Fatigue actuelle (0-10) : ${fatigue.value}\n`
  if (props.athleteProfile?.environment) {
    prompt += `- Contexte : ${props.athleteProfile.environment}\n`
  }

  // Objectives
  prompt += `\n**2. OBJECTIFS**\n`
  if (props.trainingObjectives && props.trainingObjectives.length > 0) {
    props.trainingObjectives.forEach(obj => {
      const daysLeft = Math.ceil((new Date(obj.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      const dateFormatted = new Date(obj.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
      prompt += `- [${obj.priority}] ${obj.name} (${dateFormatted}) : ${obj.distance_km}km / ${obj.elevation_gain} D+ - J-${daysLeft}\n`
    })
  } else {
    prompt += `- Aucun objectif défini\n`
  }

  // Current phase
  prompt += `\n**3. PHASE ACTUELLE**\n`
  if (planPhase) {
    prompt += `- Phase : ${planPhase.name}`
    if (planPhase.description) prompt += ` - ${planPhase.description}`
    prompt += `\n`
    if (phaseWeekNumber.value && phaseTotalWeeks.value) {
      prompt += `- Semaine : ${phaseWeekNumber.value}/${phaseTotalWeeks.value}\n`
    }
    if (planPhase.objectives) {
      prompt += `- Objectifs : ${planPhase.objectives}\n`
    }
    if (planPhase.keywords) {
      prompt += `- Mots-clés : ${planPhase.keywords}\n`
    }
    if (planPhase.challenge) {
      prompt += `- Challenge : ${planPhase.challenge}\n`
    }
  } else {
    prompt += `- Phase : Non définie\n`
  }

  // Bilan last week
  prompt += `\n**4. BILAN SEMAINE PASSÉE** (${bilanWeekDates.value.start} au ${bilanWeekDates.value.end})\n\n`

  // Volume summary
  prompt += `Volume total : ${formatHours(weekStats.value.totalHours)} (${bilanStravaSessions.value.length} séances)\n`
  if (weekStats.value.cycling.count > 0) {
    prompt += `- 🚴 Vélo : ${formatHours(weekStats.value.cycling.hours)} (${weekStats.value.cycling.count} séances, ${weekStats.value.cycling.km.toFixed(0)}km, ${Math.round(weekStats.value.cycling.elevation)} D+)\n`
  }
  if (weekStats.value.mtb.count > 0) {
    prompt += `- 🚵 VTT : ${formatHours(weekStats.value.mtb.hours)} (${weekStats.value.mtb.count} séances, ${weekStats.value.mtb.km.toFixed(0)}km, ${Math.round(weekStats.value.mtb.elevation)} D+)\n`
  }
  if (weekStats.value.running.count > 0) {
    prompt += `- 🏃 Course : ${formatHours(weekStats.value.running.hours)} (${weekStats.value.running.count} séances, ${weekStats.value.running.km.toFixed(0)}km, ${Math.round(weekStats.value.running.elevation)} D+)\n`
  }
  if (weekStats.value.strength.count > 0) {
    prompt += `- 💪 Renfo : ${formatHours(weekStats.value.strength.hours)} (${weekStats.value.strength.count} séances)\n`
  }

  // Session details
  if (bilanStravaSessions.value.length > 0) {
    prompt += `\nDétail :\n`
    bilanStravaSessions.value.forEach(s => {
      const sportEmoji = s.sport === 'cycling' ? '🚴' : s.sport === 'mtb' ? '🚵' : s.sport === 'running' ? '🏃' : '💪'
      const dateShort = new Date(s.date).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit' })
      let line = `- ${dateShort} : ${s.title} ${sportEmoji} - ${formatHours(s.duration_min / 60)}`
      if (s.actual_km) line += `, ${s.actual_km.toFixed(0)}km`
      if (s.actual_elevation) line += `, ${Math.round(s.actual_elevation)} D+`
      if (s.intensity_factor) line += `, IF ${s.intensity_factor.toFixed(2)}`
      else if (s.average_heartrate) line += `, FC ${Math.round(s.average_heartrate)}bpm`
      prompt += line + '\n'
    })
  }

  // Ressenti
  const toutRealiseLabel = toutRealise.value === 'oui' ? 'Oui' : toutRealise.value === 'partiel' ? 'Partiellement' : 'Non'
  const difficulteLabel = difficulte.value === 'facile' ? 'Facile' : difficulte.value === 'normal' ? 'Normal' : 'Difficile'
  prompt += `\nRessenti :\n`
  prompt += `- Tout réalisé : ${toutRealiseLabel}\n`
  prompt += `- Difficulté : ${difficulteLabel}\n`

  // Request for next week
  prompt += `\n**5. DEMANDE POUR LA SEMAINE À VENIR** (${planStartDate.value} au ${planEndDate.value})\n\n`
  prompt += `Dates disponibles :\n${datesListStr}\n`
  prompt += `\n- Contraintes : ${contraintes.value.trim() || 'Aucune'}\n`
  prompt += `- Envies : ${envies.value.trim() || 'Aucune'}\n`

  // JSON instructions
  prompt += `
---

En te basant sur le contexte ci-dessus, génère-moi un plan d'entraînement.

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

⚠️ SPORTS VALIDES : "cycling", "mtb", "running", "strength", "hiking"
- Pour une journée de repos, ne pas créer de séance

Types : "sweet_spot", "threshold", "vo2max", "anaerobic", "long_run", "long_ride", "hills", "fartlek", "recovery", "strength", "core"

⚠️ SÉANCES VÉLO - INDOOR vs OUTDOOR :
- Séances INDOOR (intervalles, sweet spot, threshold, VO2max, récup active) :
  → Préfixer le titre avec "Zwift:"
  → Exemples: "Zwift: Sweet Spot 2x20", "Zwift: VO2max 5x4min", "Zwift: Récup Active"
- Séances OUTDOOR (sortie longue Z2, endurance > 2h) :
  → PAS de préfixe Zwift
  → Exemples: "Sortie Longue Z2", "Endurance 3h"
- Critères : durée < 90min ET intervalles → Indoor/Zwift | durée > 2h ET Z2 → Outdoor

⚠️ SÉANCES RENFO (sport: "strength") :
- Adapter le contenu à la phase actuelle :
  - Base/Fondation : renfo général, gainage, stabilité
  - Build/Construction : renfo spécifique vélo/course, puissance
  - Peak/Affûtage : maintien léger, mobilité
  - Recovery : étirements, mobilité douce
- TOUJOURS inclure "duration_min" (durée estimée en minutes)
- Exemple :
  {
    "sport": "strength",
    "type": "strength",
    "title": "Renfo gainage",
    "duration_min": 30,
    "description": "💪 Séance gainage\\n\\n3 tours :\\n- Planche 45s\\n- Gainage latéral 30s/côté\\n- Superman 15 reps\\n- Bird dog 10 reps/côté\\n\\nRepos 1min entre tours",
    "date": "2025-01-15"
  }

IMPORTANT pour les descriptions :
- Utilise \\n pour les retours à la ligne
- PAS de markdown
- Emojis au début : 🔥 💪 🧘 🚴 🏃 ⛰️
- Structure : Échauffement → Corps → Retour au calme

🚨 RÈGLE CRITIQUE - zwift_workout :
- OBLIGATOIRE : Chaque séance "Zwift:" DOIT avoir un zwift_workout XML complet (NE JAMAIS OUBLIER)
- INTERDIT : Les sorties outdoor (Sortie Longue, Endurance) ne doivent PAS avoir de zwift_workout
- XML sur UNE SEULE LIGNE
- APOSTROPHES (') pas guillemets (")
- Puissances en % FTP (0.75 = 75%)
- Durées en SECONDES
- AJOUTER des <textevent> pour guider l'athlète pendant le workout :
  - Format: <textevent timeoffset='X' message='...'/>
  - timeoffset = secondes depuis le début du workout (pas du segment)
  - Messages courts: cadence, position, respiration, motivation
- Exemple : "<workout_file><author>Coach</author><name>Sweet Spot</name><description>2x20min SS</description><sportType>bike</sportType><workout><Warmup Duration='600' PowerLow='0.50' PowerHigh='0.70'/><textevent timeoffset='0' message='Echauffement progressif'/><textevent timeoffset='300' message='Augmentez doucement'/><SteadyState Duration='1200' Power='0.90'/><textevent timeoffset='600' message='Sweet spot! Cadence 85-95'/><textevent timeoffset='1200' message='Tenez le rythme'/><Cooldown Duration='600' PowerLow='0.65' PowerHigh='0.50'/><textevent timeoffset='1800' message='Retour au calme'/></workout></workout_file>"
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
    <!-- Date range picker -->
    <div class="form-control">
      <label class="label pb-1">
        <span class="label-text text-xs text-base-content/60">📅 Période à planifier</span>
      </label>
      <div class="flex gap-2 items-center">
        <input
          v-model="planStartDate"
          type="date"
          class="input input-bordered input-sm flex-1"
        />
        <span class="text-base-content/60">→</span>
        <input
          v-model="planEndDate"
          type="date"
          class="input input-bordered input-sm flex-1"
        />
      </div>
      <div class="text-xs text-base-content/50 mt-1">{{ planDatesRange.length }} jours</div>
    </div>

    <!-- Fatigue slider -->
    <div class="form-control">
      <label class="label pb-1">
        <span class="label-text text-xs text-base-content/60">😰 Fatigue actuelle</span>
        <span class="label-text-alt font-bold">{{ fatigue }}/10</span>
      </label>
      <input
        v-model.number="fatigue"
        type="range"
        min="0"
        max="10"
        class="range range-sm"
        :class="{
          'range-success': fatigue <= 3,
          'range-warning': fatigue > 3 && fatigue <= 6,
          'range-error': fatigue > 6
        }"
      />
      <div class="flex justify-between text-xs text-base-content/40 px-1">
        <span>Frais</span>
        <span>Fatigué</span>
      </div>
    </div>

    <!-- Bilan ressenti -->
    <div class="form-control">
      <label class="label pb-1">
        <span class="label-text text-xs text-base-content/60">📊 Bilan semaine passée</span>
      </label>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <div class="text-xs text-base-content/50 mb-1">Tout réalisé ?</div>
          <div class="flex gap-1">
            <label class="btn btn-xs" :class="toutRealise === 'oui' ? 'btn-success' : 'btn-ghost'">
              <input type="radio" v-model="toutRealise" value="oui" class="hidden" />
              Oui
            </label>
            <label class="btn btn-xs" :class="toutRealise === 'partiel' ? 'btn-warning' : 'btn-ghost'">
              <input type="radio" v-model="toutRealise" value="partiel" class="hidden" />
              Partiel
            </label>
            <label class="btn btn-xs" :class="toutRealise === 'non' ? 'btn-error' : 'btn-ghost'">
              <input type="radio" v-model="toutRealise" value="non" class="hidden" />
              Non
            </label>
          </div>
        </div>
        <div>
          <div class="text-xs text-base-content/50 mb-1">Difficulté ?</div>
          <div class="flex gap-1">
            <label class="btn btn-xs" :class="difficulte === 'facile' ? 'btn-success' : 'btn-ghost'">
              <input type="radio" v-model="difficulte" value="facile" class="hidden" />
              Facile
            </label>
            <label class="btn btn-xs" :class="difficulte === 'normal' ? 'btn-info' : 'btn-ghost'">
              <input type="radio" v-model="difficulte" value="normal" class="hidden" />
              Normal
            </label>
            <label class="btn btn-xs" :class="difficulte === 'difficile' ? 'btn-error' : 'btn-ghost'">
              <input type="radio" v-model="difficulte" value="difficile" class="hidden" />
              Dur
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Contraintes -->
    <div class="form-control">
      <label class="label pb-1">
        <span class="label-text text-xs text-base-content/60">📝 Contraintes (optionnel)</span>
      </label>
      <input
        v-model="contraintes"
        type="text"
        class="input input-bordered input-sm w-full"
        placeholder="Ex: Mardi seulement 45min, pas de vélo jeudi..."
      />
    </div>

    <!-- Envies -->
    <div class="form-control">
      <label class="label pb-1">
        <span class="label-text text-xs text-base-content/60">💡 Envies (optionnel)</span>
      </label>
      <input
        v-model="envies"
        type="text"
        class="input input-bordered input-sm w-full"
        placeholder="Ex: Faire du D+ ce week-end, tester des intervalles..."
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
