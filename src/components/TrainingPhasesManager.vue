<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { TrainingPhase } from '../types/session'
import { v4 as uuidv4 } from 'uuid'

const props = defineProps<{
  phases: TrainingPhase[]
}>()

const emit = defineEmits<{
  save: [phases: TrainingPhase[]]
}>()

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

// Form data
const formData = ref({
  name: '',
  start_date: '',
  end_date: '',
  objectives: '',
  keywords: '',
  challenge: '',
})

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

// Check if phase is current
const isCurrentPhase = (phase: TrainingPhase) => {
  const today = new Date().toISOString().split('T')[0] ?? ''
  return phase.start_date <= today && phase.end_date >= today
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
    start_date: tomorrow.toISOString().split('T')[0] ?? '',
    end_date: endDate.toISOString().split('T')[0] ?? '',
    objectives: '',
    keywords: '',
    challenge: '',
  }
  isEditing.value = true
}

// Start editing existing phase
const startEdit = (phase: TrainingPhase) => {
  editingPhase.value = phase
  formData.value = {
    name: phase.name,
    start_date: phase.start_date,
    end_date: phase.end_date,
    objectives: phase.objectives || phase.goals || '',
    keywords: phase.keywords || '',
    challenge: phase.challenge || '',
  }
  isEditing.value = true
}

// Cancel editing
const cancelEdit = () => {
  isEditing.value = false
  editingPhase.value = null
}

// Save phase
const savePhase = () => {
  if (!formData.value.name || !formData.value.start_date || !formData.value.end_date) return

  if (editingPhase.value) {
    // Update existing
    const index = localPhases.value.findIndex(p => p.id === editingPhase.value!.id)
    if (index !== -1) {
      localPhases.value[index] = {
        ...editingPhase.value,
        name: formData.value.name,
        start_date: formData.value.start_date,
        end_date: formData.value.end_date,
        objectives: formData.value.objectives || undefined,
        keywords: formData.value.keywords || undefined,
        challenge: formData.value.challenge || undefined,
      }
    }
  } else {
    // Add new
    localPhases.value.push({
      id: uuidv4(),
      name: formData.value.name,
      start_date: formData.value.start_date,
      end_date: formData.value.end_date,
      objectives: formData.value.objectives || undefined,
      keywords: formData.value.keywords || undefined,
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
  if (!confirm(`Supprimer la phase "${phase.name}" ?`)) return
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
</script>

<template>
  <div class="space-y-4">
    <!-- Header with add button -->
    <div class="flex justify-between items-center">
      <h3 class="font-bold text-lg">📊 Phases d'entraînement</h3>
      <button v-if="!isEditing" class="btn btn-sm btn-primary" @click="startAdd">
        + Ajouter
      </button>
    </div>

    <!-- Edit form -->
    <div v-if="isEditing" class="bg-base-200 rounded-lg p-4 space-y-3">
      <h4 class="font-medium">{{ editingPhase ? '✏️ Modifier la phase' : '➕ Nouvelle phase' }}</h4>

      <div>
        <label class="text-sm text-base-content/70 mb-1 block">Nom *</label>
        <input
          v-model="formData.name"
          type="text"
          class="input input-bordered input-sm w-full"
          placeholder="Ex: Base, Build, Peak..."
        />
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
        <label class="text-sm text-base-content/70 mb-1 block">Challenge (optionnel)</label>
        <input
          v-model="formData.challenge"
          type="text"
          class="input input-bordered input-sm w-full"
          placeholder="Ex: Sortie longue 3h chaque week-end"
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

    <!-- Phases list -->
    <div v-if="sortedPhases.length === 0 && !isEditing" class="text-center py-8 text-base-content/50">
      <p>Aucune phase définie</p>
      <p class="text-sm">Clique sur "+ Ajouter" pour créer ta première phase</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="phase in sortedPhases"
        :key="phase.id"
        class="bg-base-200 rounded-lg p-3"
        :class="{ 'ring-2 ring-primary': isCurrentPhase(phase) }"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <span class="badge badge-sm badge-neutral">Phase {{ phase.number }}</span>
              <span class="text-lg">{{ getPhaseEmoji(phase.name) }}</span>
              <span class="font-bold">{{ phase.name.toUpperCase() }}</span>
              <span v-if="isCurrentPhase(phase)" class="badge badge-sm badge-primary">
                S{{ getCurrentWeek(phase) }}/{{ getPhaseDuration(phase) }}
              </span>
            </div>
            <div class="text-sm text-base-content/70 mt-1">
              {{ formatDate(phase.start_date) }} → {{ formatDate(phase.end_date) }}
              <span class="text-base-content/50">({{ getPhaseDuration(phase) }} sem)</span>
            </div>
            <div v-if="phase.objectives || phase.goals" class="text-sm mt-1">
              <span class="text-base-content/50">Objectifs:</span> {{ phase.objectives || phase.goals }}
            </div>
            <div v-if="phase.keywords" class="text-sm text-base-content/60">
              <span class="text-base-content/50">Mots-clés:</span> {{ phase.keywords }}
            </div>
            <div v-if="phase.challenge" class="text-sm text-warning">
              <span class="text-base-content/50">Challenge:</span> {{ phase.challenge }}
            </div>
          </div>
          <div class="flex gap-1">
            <button class="btn btn-xs btn-ghost" @click="startEdit(phase)">✏️</button>
            <button class="btn btn-xs btn-ghost text-error" @click="deletePhase(phase)">🗑️</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
