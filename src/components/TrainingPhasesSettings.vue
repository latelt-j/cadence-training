<script setup lang="ts">
import { ref, watch } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type { TrainingPhase } from '../types/session'

const props = defineProps<{
  phases: TrainingPhase[]
}>()

const emit = defineEmits<{
  save: [phases: TrainingPhase[]]
  close: []
}>()

const localPhases = ref<TrainingPhase[]>([...props.phases])
const editingPhase = ref<TrainingPhase | null>(null)

watch(() => props.phases, (newPhases) => {
  localPhases.value = [...newPhases]
}, { deep: true })

const phasePresets = [
  { name: 'Base', description: 'Construction de la base aérobie' },
  { name: 'Build', description: 'Augmentation de l\'intensité' },
  { name: 'Peak', description: 'Préparation spécifique course' },
  { name: 'Taper', description: 'Affûtage avant compétition' },
  { name: 'Recovery', description: 'Récupération active' },
  { name: 'Race', description: 'Période de compétition' },
]

const addPhase = () => {
  const today = new Date()
  const nextWeek = new Date(today)
  nextWeek.setDate(today.getDate() + 7)

  editingPhase.value = {
    id: uuidv4(),
    name: '',
    start_date: today.toISOString().split('T')[0] ?? '',
    end_date: nextWeek.toISOString().split('T')[0] ?? '',
    description: '',
    goals: '',
  }
}

const editPhase = (phase: TrainingPhase) => {
  editingPhase.value = { ...phase }
}

const savePhase = () => {
  if (!editingPhase.value || !editingPhase.value.name) return

  const index = localPhases.value.findIndex(p => p.id === editingPhase.value!.id)
  if (index !== -1) {
    localPhases.value[index] = editingPhase.value
  } else {
    localPhases.value.push(editingPhase.value)
  }

  // Sort by start date
  localPhases.value.sort((a, b) => a.start_date.localeCompare(b.start_date))
  editingPhase.value = null
}

const deletePhase = (id: string) => {
  localPhases.value = localPhases.value.filter(p => p.id !== id)
}

const cancelEdit = () => {
  editingPhase.value = null
}

const saveAll = () => {
  emit('save', localPhases.value)
  emit('close')
}

const selectPreset = (preset: { name: string; description: string }) => {
  if (editingPhase.value) {
    editingPhase.value.name = preset.name
    editingPhase.value.description = preset.description
  }
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  })
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="font-bold text-lg">📅 Phases d'entraînement</h3>
      <button class="btn btn-sm btn-primary" @click="addPhase">
        + Ajouter
      </button>
    </div>

    <!-- Phase editor -->
    <div v-if="editingPhase" class="bg-base-200 rounded-lg p-4 space-y-3">
      <div class="text-sm font-medium mb-2">
        {{ localPhases.find(p => p.id === editingPhase?.id) ? 'Modifier' : 'Nouvelle' }} phase
      </div>

      <!-- Presets -->
      <div class="flex flex-wrap gap-1 mb-2">
        <button
          v-for="preset in phasePresets"
          :key="preset.name"
          class="btn btn-xs"
          :class="editingPhase.name === preset.name ? 'btn-primary' : 'btn-ghost'"
          @click="selectPreset(preset)"
        >
          {{ preset.name }}
        </button>
      </div>

      <div class="form-control">
        <label class="label label-text text-xs">Nom</label>
        <input
          v-model="editingPhase.name"
          type="text"
          class="input input-sm input-bordered"
          placeholder="Ex: Base, Build, Peak..."
        />
      </div>

      <div class="grid grid-cols-2 gap-2">
        <div class="form-control">
          <label class="label label-text text-xs">Début</label>
          <input
            v-model="editingPhase.start_date"
            type="date"
            class="input input-sm input-bordered"
          />
        </div>
        <div class="form-control">
          <label class="label label-text text-xs">Fin</label>
          <input
            v-model="editingPhase.end_date"
            type="date"
            class="input input-sm input-bordered"
          />
        </div>
      </div>

      <div class="form-control">
        <label class="label label-text text-xs">Description</label>
        <input
          v-model="editingPhase.description"
          type="text"
          class="input input-sm input-bordered"
          placeholder="Description courte de la phase"
        />
      </div>

      <div class="form-control">
        <label class="label label-text text-xs">Objectifs</label>
        <textarea
          v-model="editingPhase.goals"
          class="textarea textarea-sm textarea-bordered"
          rows="2"
          placeholder="Objectifs spécifiques pour cette phase..."
        ></textarea>
      </div>

      <div class="flex justify-end gap-2">
        <button class="btn btn-sm btn-ghost" @click="cancelEdit">Annuler</button>
        <button class="btn btn-sm btn-primary" @click="savePhase" :disabled="!editingPhase.name">
          Valider
        </button>
      </div>
    </div>

    <!-- Phases list -->
    <div v-if="localPhases.length > 0" class="space-y-2">
      <div
        v-for="phase in localPhases"
        :key="phase.id"
        class="flex items-center justify-between p-3 bg-base-200 rounded-lg"
      >
        <div class="flex-1">
          <div class="font-medium">{{ phase.name }}</div>
          <div class="text-xs text-base-content/60">
            {{ formatDate(phase.start_date) }} → {{ formatDate(phase.end_date) }}
          </div>
          <div v-if="phase.description" class="text-xs text-base-content/70 mt-1">
            {{ phase.description }}
          </div>
        </div>
        <div class="flex gap-1">
          <button class="btn btn-xs btn-ghost" @click="editPhase(phase)">✏️</button>
          <button class="btn btn-xs btn-ghost text-error" @click="deletePhase(phase.id)">🗑️</button>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-6 text-base-content/50">
      <p>Aucune phase définie</p>
      <p class="text-xs mt-1">Ajoute des phases pour planifier ta périodisation</p>
    </div>

    <!-- Save button -->
    <div class="flex justify-end gap-2 pt-4 border-t border-base-300">
      <button class="btn btn-ghost" @click="emit('close')">Annuler</button>
      <button class="btn btn-primary" @click="saveAll">Enregistrer</button>
    </div>
  </div>
</template>
