<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import type { TrainingPhase, TrainingObjective, AthleteProfile } from '../types/session'
import { v4 as uuidv4 } from 'uuid'

const props = defineProps<{
  phases: TrainingPhase[]
  objectives?: TrainingObjective[]
  athleteProfile?: AthleteProfile
}>()

const emit = defineEmits<{
  save: [phases: TrainingPhase[]]
}>()

// Coach prompt state
const showCoachImport = ref(false)
const coachJsonInput = ref('')
const coachCopied = ref(false)
const importError = ref('')

// Local copy of phases for editing
const localPhases = ref<TrainingPhase[]>([])

// Sync with props
watch(() => props.phases, (newPhases) => {
  localPhases.value = JSON.parse(JSON.stringify(newPhases || []))
}, { immediate: true })

// Sort phases by start_date and assign numbers
const sortedPhases = computed(() => {
  return [...localPhases.value]
    .sort((a, b) => a.start_date.localeCompare(b.start_date))
    .map((phase, index) => ({ ...phase, number: index + 1 }))
})

// Editing state
const isEditing = ref(false)
const editingPhase = ref<TrainingPhase | null>(null)
const formRef = ref<HTMLElement | null>(null)
const currentPhaseRef = ref<HTMLElement | null>(null)

// Get phase status (past, current, future)
const getPhaseStatus = (phase: TrainingPhase): 'past' | 'current' | 'future' => {
  const today = new Date().toISOString().split('T')[0] ?? ''
  if (phase.end_date < today) return 'past'
  if (phase.start_date <= today && phase.end_date >= today) return 'current'
  return 'future'
}

// Auto-scroll to current phase on mount
onMounted(() => {
  nextTick(() => {
    setTimeout(() => {
      currentPhaseRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
  })
})

// Form data
const formData = ref({
  name: '',
  emoji: '📊',
  start_date: '',
  end_date: '',
  objectives: '',
  keywords: '',
  cycling_pct: 80,
  volume_note: '',
  challenge: '',
})

// Computed running percentage
const running_pct = computed(() => 100 - formData.value.cycling_pct)

// Generate volume distribution string
const formatVolumeDistribution = (cyclingPct: number, note: string) => {
  const runningPct = 100 - cyclingPct
  let result = `${cyclingPct}% Vélo / ${runningPct}% Run`
  if (note) result += ` (${note})`
  return result
}

// Parse volume distribution string
const parseVolumeDistribution = (str: string) => {
  const match = str.match(/(\d+)%\s*Vélo/)
  const noteMatch = str.match(/\(([^)]+)\)/)
  return {
    cycling_pct: match?.[1] ? parseInt(match[1]) : 80,
    note: noteMatch?.[1] ?? ''
  }
}

// Hints based on cycling percentage
const volumeHint = computed(() => {
  const pct = formData.value.cycling_pct
  if (pct === 100) return '🚴 Vélo pur'
  if (pct >= 90) return '🚴 Focus vélo, run maintenance'
  if (pct >= 80) return '🚴 Priorité vélo, cross-training léger'
  if (pct >= 70) return '⚖️ Dominante vélo'
  if (pct >= 60) return '⚖️ Mixte vélo-dominant'
  if (pct === 50) return '⚖️ Équilibré 50/50'
  if (pct >= 40) return '⚖️ Mixte run-dominant'
  if (pct >= 30) return '🏃 Dominante course'
  if (pct >= 20) return '🏃 Priorité run, cross-training léger'
  if (pct >= 10) return '🏃 Focus run, vélo maintenance'
  return '🏃 Course pure'
})

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

// Calculate duration in weeks
const durationWeeks = computed(() => {
  if (!formData.value.start_date || !formData.value.end_date) return 0
  const start = new Date(formData.value.start_date)
  const end = new Date(formData.value.end_date)
  const diffTime = end.getTime() - start.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1
  return Math.ceil(diffDays / 7)
})

// Calculate phase duration for display
const getPhaseDuration = (phase: TrainingPhase) => {
  const start = new Date(phase.start_date)
  const end = new Date(phase.end_date)
  const diffTime = end.getTime() - start.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1
  return Math.ceil(diffDays / 7)
}

// Format date for display
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// Get current week within phase
const getCurrentWeek = (phase: TrainingPhase) => {
  const today = new Date()
  const start = new Date(phase.start_date)
  const diffTime = today.getTime() - start.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  return Math.floor(diffDays / 7) + 1
}

// Start adding new phase
const startAdd = () => {
  editingPhase.value = null
  // Default: start from tomorrow, 4 weeks duration
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const endDate = new Date(tomorrow)
  endDate.setDate(endDate.getDate() + 27) // 4 weeks

  formData.value = {
    name: '',
    emoji: '📊',
    start_date: tomorrow.toISOString().split('T')[0] ?? '',
    end_date: endDate.toISOString().split('T')[0] ?? '',
    objectives: '',
    keywords: '',
    cycling_pct: 80,
    volume_note: '',
    challenge: '',
  }
  isEditing.value = true
}

// Scroll to form
const scrollToForm = () => {
  nextTick(() => {
    formRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

// Start editing existing phase
const startEdit = (phase: TrainingPhase) => {
  editingPhase.value = phase
  const volumeParsed = phase.volume_distribution ? parseVolumeDistribution(phase.volume_distribution) : { cycling_pct: 80, note: '' }
  formData.value = {
    name: phase.name,
    emoji: phase.emoji || '📊',
    start_date: phase.start_date,
    end_date: phase.end_date,
    objectives: phase.objectives || phase.goals || '',
    keywords: phase.keywords || '',
    cycling_pct: volumeParsed.cycling_pct,
    volume_note: volumeParsed.note,
    challenge: phase.challenge || '',
  }
  isEditing.value = true
  scrollToForm()
}

// Cancel editing
const cancelEdit = () => {
  isEditing.value = false
  editingPhase.value = null
}

// Save phase
const savePhase = () => {
  if (!formData.value.name || !formData.value.start_date || !formData.value.end_date) return

  const volumeDistribution = formatVolumeDistribution(formData.value.cycling_pct, formData.value.volume_note)

  if (editingPhase.value) {
    // Update existing
    const index = localPhases.value.findIndex(p => p.id === editingPhase.value!.id)
    if (index !== -1) {
      localPhases.value[index] = {
        ...editingPhase.value,
        name: formData.value.name,
        emoji: formData.value.emoji || undefined,
        start_date: formData.value.start_date,
        end_date: formData.value.end_date,
        objectives: formData.value.objectives || undefined,
        keywords: formData.value.keywords || undefined,
        volume_distribution: volumeDistribution,
        challenge: formData.value.challenge || undefined,
      }
    }
  } else {
    // Add new
    localPhases.value.push({
      id: uuidv4(),
      name: formData.value.name,
      emoji: formData.value.emoji || undefined,
      start_date: formData.value.start_date,
      end_date: formData.value.end_date,
      objectives: formData.value.objectives || undefined,
      keywords: formData.value.keywords || undefined,
      volume_distribution: volumeDistribution,
      challenge: formData.value.challenge || undefined,
    })
  }

  // Sort and emit
  localPhases.value.sort((a, b) => a.start_date.localeCompare(b.start_date))
  emit('save', localPhases.value)
  cancelEdit()
}

// Delete phase
const deletePhase = (phase: TrainingPhase) => {
  if (!confirm(`Supprimer le cycle "${phase.name}" ?`)) return
  localPhases.value = localPhases.value.filter(p => p.id !== phase.id)
  emit('save', localPhases.value)
}

// Phase emojis based on name
const getPhaseEmoji = (name: string) => {
  const lower = name.toLowerCase()
  if (lower.includes('base') || lower.includes('fondation')) return '🏗️'
  if (lower.includes('build') || lower.includes('construction')) return '💪'
  if (lower.includes('peak') || lower.includes('pic') || lower.includes('affutage')) return '⚡'
  if (lower.includes('taper') || lower.includes('affinage')) return '🎯'
  if (lower.includes('recovery') || lower.includes('récup')) return '🧘'
  if (lower.includes('race') || lower.includes('compet')) return '🏆'
  return '📊'
}

// Generate coach prompt for phases
const generateCoachPrompt = () => {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  let prompt = `Tu es un coach cycliste expert. Je veux que tu me génères un plan de cycles d'entraînement.

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

## Ta mission
Génère-moi un plan de cycles d'entraînement qui mène à mes objectifs. Chaque cycle doit avoir:
- Un nom clair (Base, Build, Peak, Taper, etc.)
- Des dates de début et fin
- Un objectif principal
- Des mots-clés pour guider les séances

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
    "volume_distribution": "90% Vélo / 10% Run (Maintenance)",
    "challenge": ""
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
      name: p.name || 'Cycle',
      emoji: p.emoji,
      start_date: p.start_date,
      end_date: p.end_date,
      objectives: p.objectives || p.goals,
      keywords: p.keywords,
      volume_distribution: p.volume_distribution,
      challenge: p.challenge,
    }))

    // Replace all phases
    localPhases.value = newPhases.sort((a, b) => a.start_date.localeCompare(b.start_date))
    emit('save', localPhases.value)

    // Reset
    showCoachImport.value = false
    coachJsonInput.value = ''
  } catch (e) {
    importError.value = 'JSON invalide. Vérifie le format.'
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- Header with add button -->
    <div class="flex justify-between items-center pr-8">
      <h3 class="font-bold text-lg">📊 Cycles d'entraînement</h3>
      <div v-if="!isEditing && !showCoachImport" class="flex gap-2">
        <button class="btn btn-sm btn-ghost" @click="showCoachImport = true">
          🤖 Coach IA
        </button>
        <button class="btn btn-sm btn-primary" @click="startAdd">
          + Ajouter
        </button>
      </div>
    </div>

    <!-- Coach Import Section -->
    <div v-if="showCoachImport" class="bg-base-200 rounded-lg p-4 space-y-3">
      <h4 class="font-medium">🤖 Demander au coach IA</h4>
      <p class="text-sm text-base-content/70">
        1. Copie le prompt ci-dessous et colle-le dans ton IA préférée (ChatGPT, Claude...)
      </p>
      <button
        class="btn btn-sm w-full"
        :class="coachCopied ? 'btn-success' : 'btn-primary'"
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
          class="btn btn-sm btn-primary"
          :disabled="!coachJsonInput.trim()"
          @click="importCoachPhases"
        >
          🔄 Remplacer les cycles
        </button>
      </div>
    </div>

    <!-- Edit form -->
    <div v-if="isEditing" ref="formRef" class="bg-base-200 rounded-lg p-4 space-y-3">
      <h4 class="font-medium">{{ editingPhase ? '✏️ Modifier le cycle' : '➕ Nouveau cycle' }}</h4>

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
              :class="formData.emoji === item.emoji ? 'btn-primary' : 'btn-ghost'"
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

      <div v-if="durationWeeks > 0" class="text-sm text-base-content/60">
        → Durée : <span class="font-bold">{{ durationWeeks }} semaine{{ durationWeeks > 1 ? 's' : '' }}</span>
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

      <div>
        <label class="text-sm text-base-content/70 mb-1 block">Répartition volume</label>
        <div class="flex items-center gap-3 mb-2">
          <span class="text-lg">🚴</span>
          <input
            v-model.number="formData.cycling_pct"
            type="range"
            min="0"
            max="100"
            step="10"
            class="range range-sm range-primary flex-1"
          />
          <span class="text-lg">🏃</span>
        </div>
        <div class="flex justify-between text-sm mb-4">
          <span class="font-bold text-primary">{{ formData.cycling_pct }}% Vélo</span>
          <span class="text-base-content/60">{{ volumeHint }}</span>
          <span class="font-bold text-secondary">{{ running_pct }}% Run</span>
        </div>
        <input
          v-model="formData.volume_note"
          type="text"
          class="input input-bordered input-sm w-full"
          placeholder="Vigilance (ex: Maintenance cardio, Build run...)"
        />
      </div>

      <div>
        <label class="text-sm text-base-content/70 mb-1 block">Événement (optionnel)</label>
        <input
          v-model="formData.challenge"
          type="text"
          class="input input-bordered input-sm w-full"
          placeholder="Ex: Course 10km, Cyclosportive..."
        />
      </div>

      <div class="flex justify-end gap-2 pt-2">
        <button class="btn btn-sm btn-ghost" @click="cancelEdit">Annuler</button>
        <button
          class="btn btn-sm btn-primary"
          :disabled="!formData.name || !formData.start_date || !formData.end_date"
          @click="savePhase"
        >
          💾 Sauvegarder
        </button>
      </div>
    </div>

    <!-- Cycles Timeline -->
    <div v-if="sortedPhases.length === 0 && !isEditing" class="text-center py-8 text-base-content/50">
      <p>Aucun cycle défini</p>
      <p class="text-sm">Clique sur "+ Ajouter" pour créer ton premier cycle</p>
    </div>

    <ul v-else class="timeline timeline-vertical timeline-compact">
      <li
        v-for="(phase, index) in sortedPhases"
        :key="phase.id"
        :ref="el => { if (getPhaseStatus(phase) === 'current') currentPhaseRef = el as HTMLElement }"
      >
        <!-- Timeline connector (before) -->
        <hr v-if="index > 0" :class="getPhaseStatus(phase) !== 'future' ? 'bg-primary' : ''" />

        <!-- Timeline start: dates -->
        <div class="timeline-start text-xs text-base-content/50 text-right pr-2 whitespace-nowrap">
          {{ formatDate(phase.start_date).split('/').slice(0, 2).join('/') }} → {{ formatDate(phase.end_date).split('/').slice(0, 2).join('/') }}
        </div>

        <!-- Timeline middle: icon -->
        <div class="timeline-middle">
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center text-lg"
            :class="{
              'bg-primary text-primary-content': getPhaseStatus(phase) === 'current',
              'bg-primary/30 text-primary': getPhaseStatus(phase) === 'past',
              'bg-base-300 text-base-content/30': getPhaseStatus(phase) === 'future'
            }"
          >
            {{ phase.emoji || getPhaseEmoji(phase.name) }}
          </div>
        </div>

        <!-- Timeline end: content -->
        <div
          class="timeline-end timeline-box ml-2 flex-1"
          :class="{
            'border-primary border-2 bg-primary/10': getPhaseStatus(phase) === 'current',
            'bg-base-200': getPhaseStatus(phase) !== 'current'
          }"
        >
          <div class="flex justify-between items-start gap-2">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-bold">{{ phase.name.toUpperCase() }}</span>
                <span class="badge badge-xs badge-neutral">{{ getPhaseDuration(phase) }} sem</span>
                <span v-if="getPhaseStatus(phase) === 'current'" class="badge badge-xs badge-primary">
                  S{{ getCurrentWeek(phase) }}/{{ getPhaseDuration(phase) }}
                </span>
              </div>
              <div v-if="phase.objectives || phase.goals" class="text-sm mt-1 text-base-content/70">
                {{ phase.objectives || phase.goals }}
              </div>
              <div v-if="phase.keywords" class="text-xs text-base-content/50 mt-1">
                {{ phase.keywords }}
              </div>
              <div v-if="phase.volume_distribution" class="text-xs text-pink-400 mt-1">
                {{ phase.volume_distribution.replace(/\s*\([^)]*\)/, '') }}
              </div>
              <div v-if="phase.challenge" class="text-xs text-base-content/60 mt-1">
                🎯 {{ phase.challenge }}
              </div>
            </div>
            <div class="flex gap-1 shrink-0">
              <button class="btn btn-xs btn-ghost" @click="startEdit(phase)">✏️</button>
              <button class="btn btn-xs btn-ghost text-error" @click="deletePhase(phase)">🗑️</button>
            </div>
          </div>
        </div>

        <!-- Timeline connector (after) -->
        <hr v-if="index < sortedPhases.length - 1" :class="getPhaseStatus(phase) !== 'future' ? 'bg-primary' : ''" />
      </li>
    </ul>
  </div>
</template>
