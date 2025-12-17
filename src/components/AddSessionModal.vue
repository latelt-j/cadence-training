<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { SessionTemplate, Sport, StructurePhase } from '../types/session'
import { SPORT_CONFIG } from '../types/session'

const props = defineProps<{
  open: boolean
  date: string
}>()

const emit = defineEmits<{
  close: []
  add: [sessions: SessionTemplate[]]
}>()

// Tab state
const activeTab = ref<'form' | 'json'>('form')

// JSON mode
const jsonInput = ref('')
const error = ref('')

// Form mode
const formData = ref({
  sport: 'cycling' as Sport,
  type: '',
  title: '',
  duration_min: 60,
  description: '',
})

const phases = ref<StructurePhase[]>([
  { phase: 'warmup', min: 10 },
  { phase: 'work', min: 40 },
  { phase: 'cooldown', min: 10 },
])

const sports = Object.entries(SPORT_CONFIG).map(([key, config]) => ({
  value: key as Sport,
  label: `${config.emoji} ${config.label}`,
}))

const phaseTypes = [
  { value: 'warmup', label: 'Échauffement' },
  { value: 'work', label: 'Travail' },
  { value: 'rest', label: 'Récupération' },
  { value: 'cooldown', label: 'Retour au calme' },
]

const sessionTypes = [
  { value: 'recovery', label: 'Récupération' },
  { value: 'endurance', label: 'Endurance / Z2' },
  { value: 'tempo', label: 'Tempo / Z3' },
  { value: 'sweet_spot', label: 'Sweet Spot' },
  { value: 'threshold', label: 'Seuil / FTP' },
  { value: 'intervals', label: 'Intervalles / Fractionné' },
  { value: 'vo2max', label: 'VO2max' },
  { value: 'sprint', label: 'Sprint / Anaérobie' },
  { value: 'strength', label: 'Force' },
  { value: 'technique', label: 'Technique' },
  { value: 'race', label: 'Course / Compétition' },
  { value: 'test', label: 'Test' },
]

const totalDuration = computed(() => {
  return phases.value.reduce((sum, p) => {
    const phaseDuration = p.min * (p.reps || 1)
    return sum + phaseDuration
  }, 0)
})

const exampleJson = `{
  "sport": "cycling",
  "type": "endurance",
  "title": "Sortie Z2",
  "duration_min": 60,
  "description": "Sortie tranquille",
  "structure": [
    { "phase": "warmup", "min": 10, "ftp_pct": [50, 60] },
    { "phase": "work", "min": 40, "ftp_pct": [65, 75] },
    { "phase": "cooldown", "min": 10, "ftp_pct": [50, 60] }
  ]
}`

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      jsonInput.value = ''
      error.value = ''
      activeTab.value = 'form'
      resetForm()
    }
  }
)

const resetForm = () => {
  formData.value = {
    sport: 'cycling',
    type: '',
    title: '',
    duration_min: 60,
    description: '',
  }
  phases.value = [
    { phase: 'warmup', min: 10 },
    { phase: 'work', min: 40 },
    { phase: 'cooldown', min: 10 },
  ]
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

const addPhase = () => {
  phases.value.push({ phase: 'work', min: 10 })
}

const removePhase = (index: number) => {
  phases.value.splice(index, 1)
}

const handleAddFromForm = () => {
  error.value = ''

  if (!formData.value.title.trim()) {
    error.value = 'Le titre est requis'
    return
  }

  const session: SessionTemplate = {
    sport: formData.value.sport,
    type: formData.value.type || formData.value.sport,
    title: formData.value.title,
    duration_min: totalDuration.value || formData.value.duration_min,
    description: formData.value.description,
    structure: phases.value.filter(p => p.min > 0),
  }

  emit('add', [session])
  emit('close')
}

const handleAddFromJson = () => {
  error.value = ''
  try {
    const data = JSON.parse(jsonInput.value)
    const sessions = Array.isArray(data) ? data : [data]

    for (const session of sessions) {
      if (!session.sport || !session.title || !session.duration_min) {
        throw new Error('Chaque séance doit avoir: sport, title, duration_min')
      }
    }

    emit('add', sessions)
    emit('close')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'JSON invalide'
  }
}

const insertExample = () => {
  jsonInput.value = exampleJson
}
</script>

<template>
  <dialog class="modal" :class="{ 'modal-open': open }">
    <div class="modal-box max-w-2xl">
      <h3 class="font-bold text-lg mb-4">
        ➕ Ajouter une séance — <span class="text-primary">{{ formatDate(date) }}</span>
      </h3>

      <!-- Tabs -->
      <div class="tabs tabs-boxed mb-4">
        <a
          class="tab"
          :class="{ 'tab-active': activeTab === 'form' }"
          @click="activeTab = 'form'"
        >
          📝 Formulaire
        </a>
        <a
          class="tab"
          :class="{ 'tab-active': activeTab === 'json' }"
          @click="activeTab = 'json'"
        >
          { } JSON
        </a>
      </div>

      <!-- Form Tab -->
      <div v-if="activeTab === 'form'" class="space-y-4">
        <!-- Sport -->
        <div class="flex flex-col gap-1">
          <span class="text-sm font-medium">Sport</span>
          <select v-model="formData.sport" class="select select-bordered w-full">
            <option v-for="sport in sports" :key="sport.value" :value="sport.value">
              {{ sport.label }}
            </option>
          </select>
        </div>

        <!-- Type -->
        <div class="flex flex-col gap-1">
          <span class="text-sm font-medium">Type</span>
          <select v-model="formData.type" class="select select-bordered w-full">
            <option value="" disabled>Choisir un type...</option>
            <option v-for="type in sessionTypes" :key="type.value" :value="type.value">
              {{ type.label }}
            </option>
          </select>
        </div>

        <!-- Title -->
        <div class="flex flex-col gap-1">
          <span class="text-sm font-medium">Titre *</span>
          <input
            v-model="formData.title"
            type="text"
            class="input input-bordered w-full"
            placeholder="Ex: Sortie longue Z2"
          />
        </div>

        <!-- Description -->
        <div class="flex flex-col gap-1">
          <span class="text-sm font-medium">Description</span>
          <textarea
            v-model="formData.description"
            class="textarea textarea-bordered w-full"
            rows="2"
            placeholder="Objectif de la séance..."
          ></textarea>
        </div>

        <!-- Phases -->
        <div class="flex flex-col gap-2">
          <div class="flex justify-between items-center">
            <span class="text-sm font-medium">Structure de la séance</span>
            <span class="badge badge-primary">{{ totalDuration }} min</span>
          </div>

          <div class="space-y-3">
            <div
              v-for="(phase, index) in phases"
              :key="index"
              class="p-3 bg-base-200 rounded-lg space-y-3"
            >
              <div class="flex justify-between items-center">
                <span class="text-xs font-medium text-base-content/50">Phase {{ index + 1 }}</span>
                <button
                  class="btn btn-ghost btn-xs btn-square"
                  @click="removePhase(index)"
                  :disabled="phases.length <= 1"
                >
                  ✕
                </button>
              </div>

              <div class="flex flex-col gap-1">
                <span class="text-xs text-base-content/70">Type de phase</span>
                <select v-model="phase.phase" class="select select-bordered select-sm w-full">
                  <option v-for="pt in phaseTypes" :key="pt.value" :value="pt.value">
                    {{ pt.label }}
                  </option>
                </select>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="flex flex-col gap-1">
                  <span class="text-xs text-base-content/70">Durée (min)</span>
                  <input
                    v-model.number="phase.min"
                    type="number"
                    class="input input-bordered input-sm w-full"
                    min="1"
                  />
                </div>

                <div class="flex flex-col gap-1">
                  <span class="text-xs text-base-content/70">Répétitions</span>
                  <input
                    v-model.number="phase.reps"
                    type="number"
                    class="input input-bordered input-sm w-full"
                    min="1"
                    placeholder="1"
                  />
                </div>
              </div>
            </div>
          </div>

          <button class="btn btn-ghost btn-sm mt-2" @click="addPhase">
            + Ajouter une phase
          </button>
        </div>
      </div>

      <!-- JSON Tab -->
      <div v-if="activeTab === 'json'" class="space-y-4">
        <div class="flex flex-col gap-1">
          <div class="flex justify-between items-center">
            <span class="text-sm font-medium">Colle ton JSON ici</span>
            <button class="btn btn-xs btn-ghost" @click="insertExample">
              📋 Exemple
            </button>
          </div>
          <textarea
            v-model="jsonInput"
            class="textarea textarea-bordered h-64 font-mono text-sm w-full"
            placeholder='{ "sport": "cycling", "title": "...", ... }'
          ></textarea>
        </div>
      </div>

      <!-- Error -->
      <div v-if="error" class="alert alert-error mt-4">
        <span>{{ error }}</span>
      </div>

      <!-- Actions -->
      <div class="modal-action">
        <button class="btn btn-ghost" @click="emit('close')">Annuler</button>
        <button
          v-if="activeTab === 'form'"
          class="btn btn-primary"
          @click="handleAddFromForm"
        >
          ✅ Ajouter
        </button>
        <button
          v-else
          class="btn btn-primary"
          @click="handleAddFromJson"
        >
          ✅ Importer
        </button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop" @click="emit('close')">
      <button>close</button>
    </form>
  </dialog>
</template>
