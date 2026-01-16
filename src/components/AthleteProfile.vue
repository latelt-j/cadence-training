<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { AthleteProfile } from '../types/session'

const props = defineProps<{
  profile: AthleteProfile
}>()

const emit = defineEmits<{
  save: [profile: AthleteProfile]
  close: []
}>()

const localProfile = ref<AthleteProfile>({ ...props.profile })

watch(
  () => props.profile,
  (newProfile) => {
    localProfile.value = { ...newProfile }
  },
  { deep: true }
)

const saveProfile = () => {
  emit('save', localProfile.value)
  emit('close')
}

// Helper text based on FTP values
const getFtpLevel = computed(() => {
  const ftp = localProfile.value.ftp
  if (!ftp) return null
  if (ftp < 150) return { text: 'Debutant', color: 'text-info' }
  if (ftp < 200) return { text: 'Intermediaire', color: 'text-success' }
  if (ftp < 250) return { text: 'Avance', color: 'text-warning' }
  if (ftp < 300) return { text: 'Tres avance', color: 'text-error' }
  return { text: 'Elite', color: 'text-emerald-500' }
})

// Calculate HR reserve
const hrReserve = computed(() => {
  const { max_hr, resting_hr } = localProfile.value
  if (!max_hr || !resting_hr) return null
  return max_hr - resting_hr
})

// Calculate zones based on FTP
const ftpZones = computed(() => {
  const ftp = localProfile.value.ftp
  if (!ftp) return null
  return [
    { name: 'Z1 Recup', min: Math.round(ftp * 0.55), max: Math.round(ftp * 0.75) },
    { name: 'Z2 Endurance', min: Math.round(ftp * 0.75), max: Math.round(ftp * 0.9) },
    { name: 'Z3 Tempo', min: Math.round(ftp * 0.9), max: Math.round(ftp * 1.05) },
    { name: 'Z4 Seuil', min: Math.round(ftp * 1.05), max: Math.round(ftp * 1.2) },
    { name: 'Z5 VO2max', min: Math.round(ftp * 1.2), max: Math.round(ftp * 1.5) },
  ]
})

// Calculate HR zones for running using Karvonen formula (based on HR reserve)
// Target HR = ((max HR - resting HR) × %intensity) + resting HR
const hrZones = computed(() => {
  const maxHr = localProfile.value.max_hr
  const restingHr = localProfile.value.resting_hr
  if (!maxHr || !restingHr) return null
  const reserve = maxHr - restingHr
  const calcZone = (pct: number) => Math.round(reserve * pct + restingHr)
  return [
    { name: 'Z1 Recup', min: calcZone(0.50), max: calcZone(0.60) },
    { name: 'Z2 Endurance', min: calcZone(0.60), max: calcZone(0.70) },
    { name: 'Z3 Tempo', min: calcZone(0.70), max: calcZone(0.80) },
    { name: 'Z4 Seuil', min: calcZone(0.80), max: calcZone(0.90) },
    { name: 'Z5 VO2max', min: calcZone(0.90), max: maxHr },
  ]
})

// Copy HR zones to clipboard
const hrZonesCopied = ref(false)
const copyHrZones = () => {
  if (!hrZones.value) return
  const text = hrZones.value
    .map(z => `${z.name}: ${z.min}-${z.max} bpm`)
    .join('\n')
  navigator.clipboard.writeText(text)
  hrZonesCopied.value = true
  setTimeout(() => {
    hrZonesCopied.value = false
  }, 2000)
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <span class="text-2xl">&#9889;</span>
        <h3 class="font-bold text-lg">Profil athlete</h3>
      </div>
      <button class="btn btn-sm btn-circle btn-ghost" @click="emit('close')">✕</button>
    </div>

    <p class="text-sm text-base-content/70">
      Ces donnees permettent de calculer les metriques avancees (IF, zones d'intensite...) et sont
      incluses dans le rapport coach.
    </p>

    <div class="space-y-4 pt-2">
      <!-- FTP -->
      <div>
        <label class="text-sm font-medium mb-1 block"> FTP (Functional Threshold Power) </label>
        <div class="flex gap-2 items-center">
          <input
            v-model.number="localProfile.ftp"
            type="number"
            class="input input-bordered flex-1"
            placeholder="Ex: 250"
            min="0"
            max="500"
          />
          <span class="text-sm text-base-content/60">watts</span>
        </div>
        <p v-if="getFtpLevel" class="text-xs mt-1" :class="getFtpLevel.color">
          Niveau: {{ getFtpLevel.text }}
        </p>
      </div>

      <!-- Max HR -->
      <div>
        <label class="text-sm font-medium mb-1 block"> Frequence cardiaque max </label>
        <div class="flex gap-2 items-center">
          <input
            v-model.number="localProfile.max_hr"
            type="number"
            class="input input-bordered flex-1"
            placeholder="Ex: 185"
            min="100"
            max="220"
          />
          <span class="text-sm text-base-content/60">bpm</span>
        </div>
        <p class="text-xs text-base-content/50 mt-1">Formule approx: 220 - age</p>
      </div>

      <!-- Resting HR -->
      <div>
        <label class="text-sm font-medium mb-1 block"> Frequence cardiaque au repos </label>
        <div class="flex gap-2 items-center">
          <input
            v-model.number="localProfile.resting_hr"
            type="number"
            class="input input-bordered flex-1"
            placeholder="Ex: 55"
            min="30"
            max="100"
          />
          <span class="text-sm text-base-content/60">bpm</span>
        </div>
      </div>

      <!-- Divider -->
      <div class="divider text-xs text-base-content/50">Contexte</div>

      <!-- Environment -->
      <div>
        <label class="text-sm font-medium mb-1 block">Contexte environnement</label>
        <textarea
          v-model="localProfile.environment"
          class="textarea textarea-bordered w-full h-24"
          placeholder="Ex: J'habite a Lyon (zone urbaine, pas de denivele).
Trail/montagne possible uniquement le week-end
(Monts d'Or a 30min, moyenne montagne a 1h en voiture)."
        ></textarea>
        <p class="text-xs text-base-content/50 mt-1">Inclus dans le prompt coach pour adapter les seances</p>
      </div>

      <!-- HR Reserve info -->
      <div v-if="hrReserve" class="bg-base-200 rounded-lg p-3">
        <div class="text-sm font-medium">Reserve cardiaque</div>
        <div class="text-2xl font-bold text-emerald-500">{{ hrReserve }} bpm</div>
        <div class="text-xs text-base-content/60">FCmax - FCrepos</div>
      </div>

      <!-- FTP Zones -->
      <div v-if="ftpZones" class="bg-base-200 rounded-lg p-3">
        <div class="text-sm font-medium mb-2">Zones de puissance</div>
        <div class="grid grid-cols-1 gap-1 text-xs">
          <div v-for="zone in ftpZones" :key="zone.name" class="flex justify-between">
            <span class="text-base-content/70">{{ zone.name }}</span>
            <span class="font-mono">{{ zone.min }}-{{ zone.max }}W</span>
          </div>
        </div>
      </div>

      <!-- HR Zones for Running -->
      <div v-if="hrZones" class="bg-base-200 rounded-lg p-3">
        <div class="flex items-center justify-between mb-2">
          <div class="text-sm font-medium">Zones FC course</div>
          <button
            class="btn btn-xs btn-ghost"
            :class="hrZonesCopied ? 'text-success' : ''"
            @click="copyHrZones"
          >
            {{ hrZonesCopied ? '✓ Copie' : '📋 Copier' }}
          </button>
        </div>
        <div class="grid grid-cols-1 gap-1 text-xs">
          <div v-for="zone in hrZones" :key="zone.name" class="flex justify-between">
            <span class="text-base-content/70">{{ zone.name }}</span>
            <span class="font-mono">{{ zone.min }}-{{ zone.max }} bpm</span>
          </div>
        </div>
        <p class="text-xs text-base-content/50 mt-2">Formule Karvonen (FC reserve)</p>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex justify-end gap-2 pt-4 border-t border-base-300">
      <button class="btn btn-ghost" @click="emit('close')">Annuler</button>
      <button class="btn btn bg-emerald-500 text-white hover:bg-emerald-600 border-0" @click="saveProfile">Enregistrer</button>
    </div>
  </div>
</template>
