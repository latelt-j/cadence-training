<script setup lang="ts">
import { ref, watch } from 'vue'
import type { TrainingPhase } from '../types/session'

const props = defineProps<{
  phases: TrainingPhase[]
}>()

const emit = defineEmits<{
  save: [phases: TrainingPhase[]]
  close: []
}>()

const jsonText = ref('')
const parseError = ref<string | null>(null)

// Initialize with current phases
watch(() => props.phases, (newPhases) => {
  jsonText.value = JSON.stringify(newPhases, null, 2)
}, { immediate: true })

const validateAndSave = () => {
  try {
    const parsed = JSON.parse(jsonText.value)
    if (!Array.isArray(parsed)) {
      parseError.value = 'Le JSON doit être un tableau'
      return
    }
    parseError.value = null
    emit('save', parsed as TrainingPhase[])
    emit('close')
  } catch {
    parseError.value = 'JSON invalide'
  }
}

const exampleJson = `[
  {
    "id": "1",
    "name": "Base",
    "start_date": "2025-01-01",
    "end_date": "2025-02-28",
    "description": "Construction base aérobie"
  },
  {
    "id": "2",
    "name": "Build",
    "start_date": "2025-03-01",
    "end_date": "2025-04-15",
    "description": "Augmentation intensité"
  }
]`

const loadExample = () => {
  jsonText.value = exampleJson
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="font-bold text-lg">📅 Phases d'entraînement</h3>
      <button class="btn btn-xs btn-ghost" @click="loadExample">Exemple</button>
    </div>

    <p class="text-sm text-base-content/60">
      Colle ton JSON de phases (Base, Build, Peak, Taper, etc.)
    </p>

    <textarea
      v-model="jsonText"
      class="textarea textarea-bordered w-full font-mono text-xs"
      rows="12"
      placeholder="Colle ton JSON ici..."
    ></textarea>

    <div v-if="parseError" class="text-error text-sm">
      {{ parseError }}
    </div>

    <div class="flex justify-end gap-2 pt-2">
      <button class="btn btn-ghost" @click="emit('close')">Annuler</button>
      <button class="btn btn-primary" @click="validateAndSave">Enregistrer</button>
    </div>
  </div>
</template>
