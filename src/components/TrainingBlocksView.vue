<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { TrainingPhase, TrainingObjective, AthleteProfile, WeekType, WeeklyVolume } from '../types/session'
import { useTrainingBlocks } from '../composables/useTrainingBlocks'
import { v4 as uuidv4 } from 'uuid'

const props = defineProps<{
  phases: TrainingPhase[]
  objectives?: TrainingObjective[]
  athleteProfile?: AthleteProfile
}>()

const emit = defineEmits<{
  save: [phases: TrainingPhase[]]
  close: []
}>()

// Local copy of phases for editing
const localPhases = ref<TrainingPhase[]>([])

// Sync with props
watch(() => props.phases, (newPhases) => {
  localPhases.value = JSON.parse(JSON.stringify(newPhases || []))
}, { immediate: true })

// Use training blocks composable
const {
  currentBlock,
  nextBlock,
  currentWeekInBlock,
  totalWeeksInCurrentBlock,
  currentWeekType,
  getPhaseWeekTypes,
  getPhaseDuration,
  formatDateRange,
  weekTypeConfig,
  getDefaultWeekType,
} = useTrainingBlocks(localPhases)

// Coach prompt state
const showCoachImport = ref(false)
const coachJsonInput = ref('')
const coachCopied = ref(false)
const importError = ref('')

// Edit state for next block
const isEditingNext = ref(false)
const formData = ref({
  name: '',
  emoji: '📊',
  start_date: '',
  end_date: '',
  objectives: '',
  keywords: '',
  weekly_volume: {
    cycling_km: 100,
    running_km: 20,
    elevation_m: 1000,
  } as WeeklyVolume,
})
const formWeekTypes = ref<{ [weekNumber: number]: WeekType }>({})

// Available emojis for phases
const phaseEmojis = [
  { emoji: '🏗️', label: 'Base' },
  { emoji: '💪', label: 'Build' },
  { emoji: '⚡', label: 'Peak' },
  { emoji: '🎯', label: 'Taper' },
  { emoji: '🧘', label: 'Récup' },
  { emoji: '🏆', label: 'Compét' },
  { emoji: '🔥', label: 'Intensif' },
  { emoji: '🚴', label: 'Vélo' },
  { emoji: '🏃', label: 'Course' },
  { emoji: '⛰️', label: 'Montagne' },
  { emoji: '📊', label: 'Autre' },
]

// Computed duration for form
const formDurationWeeks = computed(() => {
  if (!formData.value.start_date || !formData.value.end_date) return 0
  const start = new Date(formData.value.start_date)
  const end = new Date(formData.value.end_date)
  const diffTime = end.getTime() - start.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1
  return Math.ceil(diffDays / 7)
})

// Get form week type for display
const getFormWeekType = (weekNumber: number) => {
  const type = formWeekTypes.value[weekNumber] ?? getDefaultWeekType(weekNumber)
  return weekTypeConfig[type]
}

// Cycle week type on click
const cycleWeekType = (weekNumber: number) => {
  const types: WeekType[] = ['charge', 'surcharge', 'recup']
  const current = formWeekTypes.value[weekNumber] ?? getDefaultWeekType(weekNumber)
  const nextIndex = (types.indexOf(current) + 1) % types.length
  formWeekTypes.value = { ...formWeekTypes.value, [weekNumber]: types[nextIndex]! }
}

// Start editing next block
const startEditNext = () => {
  if (nextBlock.value) {
    // Edit existing next block
    formData.value = {
      name: nextBlock.value.name,
      emoji: nextBlock.value.emoji || '📊',
      start_date: nextBlock.value.start_date,
      end_date: nextBlock.value.end_date,
      objectives: nextBlock.value.objectives || '',
      keywords: nextBlock.value.keywords || '',
      weekly_volume: nextBlock.value.weekly_volume || {
        cycling_km: 100,
        running_km: 20,
        elevation_m: 1000,
      },
    }
    formWeekTypes.value = nextBlock.value.week_types ? { ...nextBlock.value.week_types } : {}
  } else {
    // Create new next block - start after current block ends or tomorrow
    const startDate = currentBlock.value
      ? new Date(new Date(currentBlock.value.end_date).getTime() + 86400000) // day after current block
      : new Date(Date.now() + 86400000) // tomorrow
    const endDate = new Date(startDate.getTime() + 27 * 86400000) // 4 weeks

    formData.value = {
      name: '',
      emoji: '📊',
      start_date: startDate.toISOString().split('T')[0] ?? '',
      end_date: endDate.toISOString().split('T')[0] ?? '',
      objectives: '',
      keywords: '',
      weekly_volume: {
        cycling_km: 100,
        running_km: 20,
        elevation_m: 1000,
      },
    }
    formWeekTypes.value = {}
  }
  isEditingNext.value = true
}

// Cancel editing
const cancelEdit = () => {
  isEditingNext.value = false
}

// Save next block
const saveNextBlock = () => {
  if (!formData.value.name || !formData.value.start_date || !formData.value.end_date) return

  const weekTypes = Object.keys(formWeekTypes.value).length > 0 ? formWeekTypes.value : undefined

  const phaseData: TrainingPhase = {
    id: nextBlock.value?.id || uuidv4(),
    name: formData.value.name,
    emoji: formData.value.emoji || undefined,
    start_date: formData.value.start_date,
    end_date: formData.value.end_date,
    objectives: formData.value.objectives || undefined,
    keywords: formData.value.keywords || undefined,
    weekly_volume: formData.value.weekly_volume,
    week_types: weekTypes,
  }

  if (nextBlock.value) {
    // Update existing
    const index = localPhases.value.findIndex(p => p.id === nextBlock.value!.id)
    if (index !== -1) {
      localPhases.value[index] = phaseData
    }
  } else {
    // Add new
    localPhases.value.push(phaseData)
  }

  // Sort by start date
  localPhases.value.sort((a, b) => a.start_date.localeCompare(b.start_date))
  emit('save', localPhases.value)
  isEditingNext.value = false
}

// Delete next block
const deleteNextBlock = () => {
  if (!nextBlock.value) return
  if (!confirm(`Supprimer le bloc "${nextBlock.value.name}" ?`)) return
  localPhases.value = localPhases.value.filter(p => p.id !== nextBlock.value!.id)
  emit('save', localPhases.value)
}

// Generate coach prompt for phases
const generateCoachPrompt = () => {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  let prompt = `Tu es un coach de course à pied (route / trail) et de vélo expert. Je veux que tu me génères un plan de blocs d'entraînement.

## Date d'aujourd'hui
${todayStr}

## Mon profil`

  if (props.athleteProfile?.ftp) {
    prompt += `\n- FTP: ${props.athleteProfile.ftp}W`
  }
  if (props.athleteProfile?.max_hr) {
    prompt += `\n- FC Max: ${props.athleteProfile.max_hr} bpm`
  }
  if (props.athleteProfile?.environment) {
    prompt += `\n- Environnement: ${props.athleteProfile.environment}`
  }

  if (props.objectives?.length) {
    prompt += `\n\n## Mes objectifs`
    props.objectives.forEach(obj => {
      prompt += `\n- [${obj.priority}] ${obj.name} (${obj.date}) - ${obj.type}, ${obj.distance_km}km, D+${obj.elevation_gain}m`
    })
  }

  prompt += `

## Étape 1 : Analyse de mon profil et historique
AVANT de générer les blocs, utilise le MCP Strava pour :

1. Récupérer mon profil athlète (stats globales, FTP si disponible, zones de fréquence cardiaque)
2. Analyser mes activités des 4 dernières semaines

Résume :
- Mes stats globales (total km vélo/course all-time, ancienneté)
- Volume des 4 dernières semaines par sport (km vélo, km course, D+)
- Nombre de séances par semaine
- Tendance (progression, stagnation, fatigue ?)

## Étape 2 : Génération des blocs
En te basant sur mon historique ET mes objectifs, génère-moi un plan de 2 blocs d'entraînement (le bloc actuel + le prochain) qui mène à mes objectifs. Chaque bloc doit avoir:
- Un nom clair (Base, Build, Peak, Taper, etc.)
- Des dates de début et fin
- Un objectif principal
- Des mots-clés pour guider les séances
- Un volume cible PAR SEMAINE (moyenne) - adapté à ce que j'ai réellement fait

## Format de réponse OBLIGATOIRE
Réponds UNIQUEMENT avec un JSON valide (pas de texte avant/après), au format:
\`\`\`json
[
  {
    "name": "Base",
    "emoji": "🏗️",
    "start_date": "2024-01-08",
    "end_date": "2024-02-04",
    "objectives": "Construire l'endurance aérobie",
    "keywords": "Z2, volume, régularité, endurance",
    "weekly_volume": {
      "cycling_km": 120,
      "running_km": 25,
      "elevation_m": 1200
    }
  }
]
\`\`\`

Emojis disponibles: 🏗️ (Base), 💪 (Build), ⚡ (Peak), 🎯 (Taper), 🧘 (Récup), 🏆 (Compét), 🔥 (Intensif), ⛰️ (Montagne)`

  return prompt
}

// Copy coach prompt to clipboard
const copyCoachPrompt = async () => {
  await navigator.clipboard.writeText(generateCoachPrompt())
  coachCopied.value = true
  setTimeout(() => {
    coachCopied.value = false
  }, 2000)
}

// Import phases from coach JSON
const importCoachPhases = () => {
  importError.value = ''
  try {
    let cleanText = coachJsonInput.value.trim()
    // Remove markdown code blocks if present
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    }

    const parsed = JSON.parse(cleanText)
    const phasesArray = Array.isArray(parsed) ? parsed : [parsed]

    // Validate and transform phases
    const newPhases: TrainingPhase[] = phasesArray.map((p: any) => ({
      id: uuidv4(),
      name: p.name || 'Bloc',
      emoji: p.emoji,
      start_date: p.start_date,
      end_date: p.end_date,
      objectives: p.objectives || p.goals,
      keywords: p.keywords,
      weekly_volume: p.weekly_volume || {
        cycling_km: 100,
        running_km: 20,
        elevation_m: 1000,
      },
    }))

    // Replace all phases with the new ones
    localPhases.value = newPhases.sort((a, b) => a.start_date.localeCompare(b.start_date))
    emit('save', localPhases.value)

    // Reset
    showCoachImport.value = false
    coachJsonInput.value = ''
  } catch (e) {
    importError.value = 'JSON invalide. Vérifie le format.'
  }
}

// Migrate old phases without weekly_volume
const migratePhase = (phase: TrainingPhase): TrainingPhase => {
  if (!phase.weekly_volume) {
    return {
      ...phase,
      weekly_volume: {
        cycling_km: 100,
        running_km: 20,
        elevation_m: 1000,
      },
    }
  }
  return phase
}

// Apply migration on load
watch(localPhases, (phases) => {
  const needsMigration = phases.some(p => !p.weekly_volume)
  if (needsMigration) {
    localPhases.value = phases.map(migratePhase)
    emit('save', localPhases.value)
  }
}, { immediate: true })
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex justify-between items-center mb-4">
      <h3 class="font-bold text-lg">📊 Blocs d'entraînement</h3>
      <div class="flex items-center gap-2">
        <button
          v-if="!showCoachImport && !isEditingNext"
          class="btn btn-sm btn-ghost"
          @click="showCoachImport = true"
        >
          🤖 Coach IA
        </button>
        <button class="btn btn-sm btn-circle btn-ghost" @click="emit('close')">✕</button>
      </div>
    </div>

    <!-- Coach Import Section -->
    <div v-if="showCoachImport" class="bg-base-200 rounded-lg p-4 space-y-3">
      <h4 class="font-medium">🤖 Générer les blocs avec l'IA</h4>
      <p class="text-sm text-base-content/70">
        1. Copie le prompt ci-dessous et colle-le dans ton IA préférée (ChatGPT, Claude...)
      </p>
      <button
        class="btn btn-sm w-full"
        :class="coachCopied ? 'btn-success' : 'btn bg-emerald-500 text-white hover:bg-emerald-600 border-0'"
        @click="copyCoachPrompt"
      >
        {{ coachCopied ? '✓ Prompt copié !' : '📋 Copier le prompt pour le coach' }}
      </button>

      <p class="text-sm text-base-content/70">
        2. Colle la réponse JSON du coach ici :
      </p>
      <textarea
        v-model="coachJsonInput"
        class="textarea textarea-bordered w-full h-32 font-mono text-xs"
        placeholder="Colle le JSON généré par le coach ici..."
      ></textarea>

      <div v-if="importError" class="text-error text-sm">{{ importError }}</div>

      <div class="flex justify-end gap-2">
        <button class="btn btn-sm btn-ghost" @click="showCoachImport = false; coachJsonInput = ''; importError = ''">
          Annuler
        </button>
        <button
          class="btn btn-sm btn bg-emerald-500 text-white hover:bg-emerald-600 border-0"
          :disabled="!coachJsonInput.trim()"
          @click="importCoachPhases"
        >
          🔄 Remplacer les blocs
        </button>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="!currentBlock && !nextBlock && !showCoachImport && !isEditingNext" class="space-y-3">
      <!-- Alerts for missing info -->
      <div v-if="!athleteProfile?.ftp && !athleteProfile?.max_hr" class="alert alert-warning text-sm">
        <span>⚠️ Configure ton <strong>profil athlète</strong> (FTP, FC) pour des blocs personnalisés</span>
      </div>
      <div v-if="!objectives?.length" class="alert alert-warning text-sm">
        <span>⚠️ Ajoute au moins un <strong>objectif</strong> (course cible) pour planifier tes blocs</span>
      </div>

      <!-- Empty state -->
      <div class="text-center py-6 text-base-content/50">
        <p class="text-lg">Aucun bloc défini</p>
        <p class="text-sm mt-1">Génère tes blocs avec l'IA coach</p>
        <div class="flex justify-center gap-2 mt-4">
          <button class="btn btn-sm btn bg-emerald-500 text-white hover:bg-emerald-600 border-0" @click="showCoachImport = true">
            🤖 Générer avec l'IA
          </button>
        </div>
      </div>
    </div>

    <!-- Current Block (read-only) -->
    <div v-if="currentBlock && !showCoachImport && !isEditingNext" class="bg-white/10 border-2 border-white rounded-lg p-4 space-y-3">
      <div class="flex items-center justify-between">
        <span class="text-xs text-white/70 uppercase tracking-wide">📊 Bloc en cours</span>
        <span class="badge badge-sm bg-white text-black">
          S{{ currentWeekInBlock }}/{{ totalWeeksInCurrentBlock }}
          <span v-if="currentWeekType" class="ml-1">{{ currentWeekType.emoji }}</span>
        </span>
      </div>

      <div class="flex items-center gap-3">
        <span class="text-3xl">{{ currentBlock.emoji || '📊' }}</span>
        <div>
          <h4 class="font-bold text-lg">{{ currentBlock.name.toUpperCase() }}</h4>
          <p class="text-sm text-white/70">{{ formatDateRange(currentBlock.start_date, currentBlock.end_date) }}</p>
        </div>
      </div>

      <!-- Week types display -->
      <div class="flex flex-wrap gap-1">
        <span
          v-for="week in getPhaseWeekTypes(currentBlock)"
          :key="week.number"
          class="badge badge-xs text-white"
          :class="[
            week.color,
            week.number === currentWeekInBlock ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent' : 'opacity-60'
          ]"
        >
          {{ week.emoji }} S{{ week.number }}
        </span>
      </div>

      <!-- Weekly volume targets -->
      <div v-if="currentBlock.weekly_volume" class="flex flex-wrap gap-3 text-sm">
        <span class="flex items-center gap-1">
          <span class="text-lg">🚴</span>
          <span class="font-medium">{{ currentBlock.weekly_volume.cycling_km }}km</span>
          <span class="text-white/50">/sem</span>
        </span>
        <span class="flex items-center gap-1">
          <span class="text-lg">🏃</span>
          <span class="font-medium">{{ currentBlock.weekly_volume.running_km }}km</span>
          <span class="text-white/50">/sem</span>
        </span>
        <span class="flex items-center gap-1">
          <span class="text-lg">⛰️</span>
          <span class="font-medium">{{ currentBlock.weekly_volume.elevation_m }}m</span>
          <span class="text-white/50">D+/sem</span>
        </span>
      </div>

      <!-- Objectives -->
      <p v-if="currentBlock.objectives" class="text-sm text-white/80">
        {{ currentBlock.objectives }}
      </p>

      <!-- Keywords -->
      <p v-if="currentBlock.keywords" class="text-xs text-white/50">
        {{ currentBlock.keywords }}
      </p>
    </div>

    <!-- Next Block (editable) -->
    <div v-if="(nextBlock || currentBlock) && !showCoachImport && !isEditingNext" class="bg-base-200 rounded-lg p-4 space-y-3">
      <div class="flex items-center justify-between">
        <span class="text-xs text-base-content/70 uppercase tracking-wide">Prochain bloc</span>
        <button class="btn btn-xs btn-ghost" @click="startEditNext">
          ✏️ {{ nextBlock ? 'Modifier' : 'Ajouter' }}
        </button>
      </div>

      <template v-if="nextBlock">
        <div class="flex items-center gap-3">
          <span class="text-2xl">{{ nextBlock.emoji || '📊' }}</span>
          <div>
            <h4 class="font-medium">{{ nextBlock.name.toUpperCase() }}</h4>
            <p class="text-xs text-base-content/50">
              {{ getPhaseDuration(nextBlock) }} sem · {{ formatDateRange(nextBlock.start_date, nextBlock.end_date) }}
            </p>
          </div>
        </div>

        <!-- Weekly volume preview -->
        <div v-if="nextBlock.weekly_volume" class="flex flex-wrap gap-3 text-sm text-base-content/70">
          <span>🚴 {{ nextBlock.weekly_volume.cycling_km }}km/sem</span>
          <span>🏃 {{ nextBlock.weekly_volume.running_km }}km/sem</span>
          <span>⛰️ {{ nextBlock.weekly_volume.elevation_m }}m D+</span>
        </div>
      </template>

      <template v-else>
        <p class="text-sm text-base-content/50 text-center py-4">
          Aucun prochain bloc défini
        </p>
      </template>
    </div>

    <!-- Edit Form for Next Block -->
    <div v-if="isEditingNext" class="bg-base-200 rounded-lg p-4 space-y-3">
      <h4 class="font-medium">{{ nextBlock ? '✏️ Modifier le prochain bloc' : '➕ Ajouter le prochain bloc' }}</h4>

      <div class="grid grid-cols-[1fr_auto] gap-3">
        <div>
          <label class="text-sm text-base-content/70 mb-1 block">Nom *</label>
          <input
            v-model="formData.name"
            type="text"
            class="input input-bordered input-sm w-full"
            placeholder="Ex: Base, Build, Peak..."
          />
        </div>
        <div>
          <label class="text-sm text-base-content/70 mb-1 block">Icône</label>
          <div class="flex flex-wrap gap-1">
            <button
              v-for="item in phaseEmojis"
              :key="item.emoji"
              type="button"
              class="btn btn-sm btn-square"
              :class="formData.emoji === item.emoji ? 'btn bg-emerald-500 text-white hover:bg-emerald-600 border-0' : 'btn-ghost'"
              :title="item.label"
              @click="formData.emoji = item.emoji"
            >
              {{ item.emoji }}
            </button>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="text-sm text-base-content/70 mb-1 block">Début *</label>
          <input
            v-model="formData.start_date"
            type="date"
            class="input input-bordered input-sm w-full"
          />
        </div>
        <div>
          <label class="text-sm text-base-content/70 mb-1 block">Fin *</label>
          <input
            v-model="formData.end_date"
            type="date"
            class="input input-bordered input-sm w-full"
          />
        </div>
      </div>

      <div v-if="formDurationWeeks > 0" class="text-sm text-base-content/60">
        → Durée : <span class="font-bold">{{ formDurationWeeks }} semaine{{ formDurationWeeks > 1 ? 's' : '' }}</span>
      </div>

      <div>
        <label class="text-sm text-base-content/70 mb-1 block">Objectif principal</label>
        <input
          v-model="formData.objectives"
          type="text"
          class="input input-bordered input-sm w-full"
          placeholder="Ex: Construire l'endurance aérobie"
        />
      </div>

      <div>
        <label class="text-sm text-base-content/70 mb-1 block">Mots-clés (pour le coach IA)</label>
        <textarea
          v-model="formData.keywords"
          class="textarea textarea-bordered textarea-sm h-16 w-full"
          placeholder="Ex: Z2, volume, régularité, endurance, sorties longues..."
        ></textarea>
      </div>

      <!-- Weekly Volume Targets -->
      <div>
        <label class="text-sm text-base-content/70 mb-2 block">Volume cible par semaine</label>
        <div class="grid grid-cols-3 gap-2">
          <div>
            <label class="text-xs text-base-content/50 mb-1 block">🚴 Vélo (km)</label>
            <input
              v-model.number="formData.weekly_volume.cycling_km"
              type="number"
              min="0"
              step="10"
              class="input input-bordered input-sm w-full"
            />
          </div>
          <div>
            <label class="text-xs text-base-content/50 mb-1 block">🏃 Course (km)</label>
            <input
              v-model.number="formData.weekly_volume.running_km"
              type="number"
              min="0"
              step="5"
              class="input input-bordered input-sm w-full"
            />
          </div>
          <div>
            <label class="text-xs text-base-content/50 mb-1 block">⛰️ D+ (m)</label>
            <input
              v-model.number="formData.weekly_volume.elevation_m"
              type="number"
              min="0"
              step="100"
              class="input input-bordered input-sm w-full"
            />
          </div>
        </div>
      </div>

      <!-- Week types editor -->
      <div v-if="formDurationWeeks > 0">
        <label class="text-sm text-base-content/70 mb-2 block">Types de semaines (clic pour changer)</label>
        <div class="flex flex-wrap gap-1">
          <button
            v-for="week in formDurationWeeks"
            :key="week"
            type="button"
            class="btn btn-xs text-white"
            :class="getFormWeekType(week).color"
            @click="cycleWeekType(week)"
          >
            S{{ week }} {{ getFormWeekType(week).emoji }}
          </button>
        </div>
        <p class="text-xs text-base-content/50 mt-1">📈 Charge → 🔥 Surcharge → 🧘 Récup (pattern 3:1)</p>
      </div>

      <div class="flex justify-between pt-2">
        <button
          v-if="nextBlock"
          class="btn btn-sm btn-ghost text-error"
          @click="deleteNextBlock"
        >
          🗑️ Supprimer
        </button>
        <div class="flex gap-2 ml-auto">
          <button class="btn btn-sm btn-ghost" @click="cancelEdit">Annuler</button>
          <button
            class="btn btn-sm btn bg-emerald-500 text-white hover:bg-emerald-600 border-0"
            :disabled="!formData.name || !formData.start_date || !formData.end_date"
            @click="saveNextBlock"
          >
            💾 Sauvegarder
          </button>
        </div>
      </div>
    </div>

    <!-- Generate button at bottom -->
    <div v-if="!showCoachImport && !isEditingNext && (currentBlock || nextBlock)" class="pt-2">
      <button
        class="btn btn-sm btn-ghost w-full"
        @click="showCoachImport = true"
      >
        🤖 Régénérer les blocs avec l'IA
      </button>
    </div>
  </div>
</template>
