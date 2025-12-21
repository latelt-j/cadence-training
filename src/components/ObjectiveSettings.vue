<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type { TrainingObjective } from '../types/session'

const props = defineProps<{
  objectives: TrainingObjective[]
}>()

const emit = defineEmits<{
  save: [objectives: TrainingObjective[]]
  close: []
}>()

const localObjectives = ref<TrainingObjective[]>([...props.objectives])
const editingObjective = ref<TrainingObjective | null>(null)

watch(() => props.objectives, (newObjectives) => {
  localObjectives.value = [...newObjectives]
}, { deep: true })

const addObjective = () => {
  const nextMonth = new Date()
  nextMonth.setMonth(nextMonth.getMonth() + 1)

  editingObjective.value = {
    id: uuidv4(),
    type: 'trail',
    name: '',
    date: nextMonth.toISOString().split('T')[0] ?? '',
    distance_km: 0,
    elevation_gain: 0,
    elevation_loss: 0,
  }
}

const editObjective = (obj: TrainingObjective) => {
  editingObjective.value = { ...obj }
}

const saveObjective = () => {
  if (!editingObjective.value || !editingObjective.value.name) return

  const index = localObjectives.value.findIndex(o => o.id === editingObjective.value!.id)
  if (index !== -1) {
    localObjectives.value[index] = editingObjective.value
  } else {
    localObjectives.value.push(editingObjective.value)
  }

  // Sort by date
  localObjectives.value.sort((a, b) => a.date.localeCompare(b.date))
  editingObjective.value = null
}

const deleteObjective = (id: string) => {
  localObjectives.value = localObjectives.value.filter(o => o.id !== id)
}

const cancelEdit = () => {
  editingObjective.value = null
}

const saveAll = () => {
  emit('save', localObjectives.value)
  emit('close')
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const daysUntil = (dateStr: string) => {
  const target = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return 'Passé'
  if (diff === 0) return "Aujourd'hui"
  if (diff === 1) return 'Demain'
  return `J-${diff}`
}

const isTrail = computed(() => editingObjective.value?.type === 'trail')
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="font-bold text-lg">🎯 Objectifs</h3>
      <button class="btn btn-sm btn-primary" @click="addObjective">
        + Ajouter
      </button>
    </div>

    <!-- Objective editor -->
    <div v-if="editingObjective" class="bg-base-200 rounded-lg p-4 space-y-3">
      <div class="text-sm font-medium mb-2">
        {{ localObjectives.find(o => o.id === editingObjective?.id) ? 'Modifier' : 'Nouvel' }} objectif
      </div>

      <!-- Type selector -->
      <div class="flex gap-2">
        <button
          class="btn btn-sm flex-1"
          :class="editingObjective.type === 'trail' ? 'btn-primary' : 'btn-ghost'"
          @click="editingObjective.type = 'trail'"
        >
          🏃 Trail
        </button>
        <button
          class="btn btn-sm flex-1"
          :class="editingObjective.type === 'road_cycling' ? 'btn-primary' : 'btn-ghost'"
          @click="editingObjective.type = 'road_cycling'"
        >
          🚴 Vélo route
        </button>
      </div>

      <div class="form-control">
        <label class="label label-text text-xs">Nom de l'épreuve</label>
        <input
          v-model="editingObjective.name"
          type="text"
          class="input input-sm input-bordered"
          placeholder="Ex: UTMB, Étape du Tour..."
        />
      </div>

      <div class="form-control">
        <label class="label label-text text-xs">Date</label>
        <input
          v-model="editingObjective.date"
          type="date"
          class="input input-sm input-bordered"
        />
      </div>

      <div class="form-control">
        <label class="label label-text text-xs">Distance (km)</label>
        <input
          v-model.number="editingObjective.distance_km"
          type="number"
          class="input input-sm input-bordered"
          min="0"
          step="0.1"
        />
      </div>

      <div :class="isTrail ? 'grid grid-cols-2 gap-2' : ''">
        <div class="form-control">
          <label class="label label-text text-xs">Dénivelé + (m)</label>
          <input
            v-model.number="editingObjective.elevation_gain"
            type="number"
            class="input input-sm input-bordered"
            min="0"
          />
        </div>
        <div v-if="isTrail" class="form-control">
          <label class="label label-text text-xs">Dénivelé - (m)</label>
          <input
            v-model.number="editingObjective.elevation_loss"
            type="number"
            class="input input-sm input-bordered"
            min="0"
          />
        </div>
      </div>

      <div class="flex justify-end gap-2">
        <button class="btn btn-sm btn-ghost" @click="cancelEdit">Annuler</button>
        <button class="btn btn-sm btn-primary" @click="saveObjective" :disabled="!editingObjective.name">
          Valider
        </button>
      </div>
    </div>

    <!-- Objectives list -->
    <div v-if="localObjectives.length > 0" class="space-y-2">
      <div
        v-for="obj in localObjectives"
        :key="obj.id"
        class="flex items-center justify-between p-3 bg-base-200 rounded-lg"
      >
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <span>{{ obj.type === 'trail' ? '🏃' : '🚴' }}</span>
            <span class="font-medium">{{ obj.name }}</span>
            <span class="badge badge-sm badge-primary">{{ daysUntil(obj.date) }}</span>
          </div>
          <div class="text-xs text-base-content/60 mt-1">
            {{ formatDate(obj.date) }} • {{ obj.distance_km }} km • {{ obj.elevation_gain }}m D+
            <span v-if="obj.type === 'trail' && obj.elevation_loss"> / {{ obj.elevation_loss }}m D-</span>
          </div>
        </div>
        <div class="flex gap-1">
          <button class="btn btn-xs btn-ghost" @click="editObjective(obj)">✏️</button>
          <button class="btn btn-xs btn-ghost text-error" @click="deleteObjective(obj.id)">🗑️</button>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-6 text-base-content/50">
      <p>Aucun objectif défini</p>
      <p class="text-xs mt-1">Ajoute une course ou un événement cible</p>
    </div>

    <!-- Save button -->
    <div class="flex justify-end gap-2 pt-4 border-t border-base-300">
      <button class="btn btn-ghost" @click="emit('close')">Annuler</button>
      <button class="btn btn-primary" @click="saveAll">Enregistrer</button>
    </div>
  </div>
</template>
