<script setup lang="ts">
import { ref } from 'vue'
import type { ScheduledSession } from '../types/session'
import { SPORT_CONFIG } from '../types/session'

const props = defineProps<{
  session: ScheduledSession | null
}>()

const emit = defineEmits<{
  close: []
  delete: [sessionId: string]
}>()

const copied = ref(false)

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

const formatDuration = (min: number) => {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m} min`
  if (m === 0) return `${h}h`
  return `${h}h${m.toString().padStart(2, '0')}`
}

const generateAnalysisText = (): string => {
  if (!props.session) return ''

  const s = props.session
  const sportName = s.sport === 'cycling' ? 'Vélo' : s.sport === 'running' ? 'Course à pied' : 'Renforcement'

  let text = `## Séance d'entraînement à analyser

**Sport:** ${sportName}
**Titre:** ${s.title}
**Date:** ${formatDate(s.date)}
**Durée:** ${formatDuration(s.duration_min)}`

  if (s.actual_km) {
    text += `\n**Distance:** ${s.actual_km} km`
  }

  if (s.actual_elevation) {
    text += `\n**Dénivelé:** ${s.actual_elevation} m D+`
  }

  // Calculate average speed for cycling/running
  if (s.actual_km && s.duration_min > 0) {
    const hours = s.duration_min / 60
    const avgSpeed = (s.actual_km / hours).toFixed(1)
    if (s.sport === 'cycling') {
      text += `\n**Vitesse moyenne:** ${avgSpeed} km/h`
    } else if (s.sport === 'running') {
      const paceMin = Math.floor(60 / parseFloat(avgSpeed))
      const paceSec = Math.round((60 / parseFloat(avgSpeed) - paceMin) * 60)
      text += `\n**Allure moyenne:** ${paceMin}'${paceSec.toString().padStart(2, '0')}" /km`
    }
  }

  if (s.description) {
    text += `\n\n**Description:**\n${s.description}`
  }

  if (s.structure && s.structure.length > 0) {
    text += `\n\n**Structure de la séance:**`
    s.structure.forEach((phase, i) => {
      let phaseText = `\n${i + 1}. ${phase.phase} - ${phase.min} min`
      if (phase.reps && phase.reps > 1) {
        phaseText += ` (x${phase.reps})`
      }
      if (phase.ftp_pct) {
        phaseText += ` @ ${phase.ftp_pct[0]}-${phase.ftp_pct[1]}% FTP`
      } else if (phase.hr_max_pct) {
        phaseText += ` @ ${phase.hr_max_pct[0]}-${phase.hr_max_pct[1]}% FCmax`
      }
      text += phaseText
    })
  }

  text += `\n\n---\nMerci d'analyser cette séance et de me donner ton feedback sur la charge, l'intensité et les points d'amélioration.`

  return text
}

const copyForAnalysis = async () => {
  const text = generateAnalysisText()
  await navigator.clipboard.writeText(text)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}

const handleDelete = () => {
  if (props.session) {
    emit('delete', props.session.id)
    emit('close')
  }
}
</script>

<template>
  <dialog class="modal" :class="{ 'modal-open': !!session }">
    <div class="modal-box" v-if="session">
      <div class="flex items-center gap-3 mb-4">
        <span class="text-4xl">{{ SPORT_CONFIG[session.sport].emoji }}</span>
        <div>
          <h3 class="font-bold text-lg">{{ session.title }}</h3>
          <p class="text-sm text-base-content/70">{{ formatDate(session.date) }}</p>
        </div>
      </div>

      <div class="space-y-4">
        <div class="flex gap-2">
          <div class="badge badge-outline">{{ session.type }}</div>
          <div class="badge badge-primary">{{ formatDuration(session.duration_min) }}</div>
        </div>

        <p class="text-base-content/80">{{ session.description }}</p>

        <div class="collapse collapse-arrow bg-base-200">
          <input type="checkbox" />
          <div class="collapse-title font-medium">Structure de la séance</div>
          <div class="collapse-content">
            <div class="overflow-x-auto">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Phase</th>
                    <th>Durée</th>
                    <th>Intensité</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(phase, i) in session.structure" :key="i">
                    <td class="capitalize">
                      {{ phase.phase }}
                      <span v-if="phase.reps && phase.reps > 1" class="badge badge-xs">x{{ phase.reps }}</span>
                    </td>
                    <td>{{ phase.min }} min</td>
                    <td>
                      <span v-if="phase.ftp_pct">{{ phase.ftp_pct[0] }}-{{ phase.ftp_pct[1] }}% FTP</span>
                      <span v-else-if="phase.hr_max_pct">{{ phase.hr_max_pct[0] }}-{{ phase.hr_max_pct[1] }}% FCmax</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-action flex-wrap gap-2">
        <button
          class="btn btn-outline"
          :class="copied ? 'btn-success' : 'btn-primary'"
          @click="copyForAnalysis"
        >
          {{ copied ? '✓ Copié !' : '📋 Copier pour coach' }}
        </button>
        <button class="btn btn-error btn-outline" @click="handleDelete">
          🗑️ Supprimer
        </button>
        <button class="btn" @click="emit('close')">Fermer</button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop" @click="emit('close')">
      <button>close</button>
    </form>
  </dialog>
</template>
