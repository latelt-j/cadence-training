<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { marked } from 'marked'
import type { ScheduledSession } from '../types/session'
import { SPORT_CONFIG } from '../types/session'

// Configure marked for inline rendering (no <p> tags)
marked.setOptions({
  breaks: true,
  gfm: true,
})

const props = defineProps<{
  session: ScheduledSession | null
}>()

const emit = defineEmits<{
  close: []
  delete: [sessionId: string]
  updateFeedback: [sessionId: string, feedback: string]
}>()

const copied = ref(false)
const feedbackText = ref('')
const feedbackSaved = ref(false)
const isEditingFeedback = ref(false)
const currentPage = ref<'details' | 'coach'>('details')

// Sync feedback text when session changes
watch(() => props.session, (newSession) => {
  feedbackText.value = newSession?.coach_feedback || ''
  feedbackSaved.value = false
  isEditingFeedback.value = false
  currentPage.value = 'details'
}, { immediate: true })

// Check if feedback exists
const hasFeedback = computed(() => !!feedbackText.value.trim())

// Render markdown feedback
const renderedFeedback = computed(() => {
  if (!feedbackText.value.trim()) return ''
  return marked(feedbackText.value)
})

const saveFeedback = () => {
  if (props.session) {
    emit('updateFeedback', props.session.id, feedbackText.value)
    feedbackSaved.value = true
    isEditingFeedback.value = false
    setTimeout(() => {
      feedbackSaved.value = false
    }, 2000)
  }
}

const startEditFeedback = () => {
  isEditingFeedback.value = true
}

const cancelEditFeedback = () => {
  feedbackText.value = props.session?.coach_feedback || ''
  isEditingFeedback.value = false
}

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

const formatLapDuration = (seconds: number): string => {
  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  return `${min}'${sec.toString().padStart(2, '0')}"`
}

const formatSpeed = (metersPerSec: number, sport: string): string => {
  const kmh = metersPerSec * 3.6
  if (sport === 'running') {
    // Convert to pace min/km
    const paceMinPerKm = 60 / kmh
    const paceMin = Math.floor(paceMinPerKm)
    const paceSec = Math.round((paceMinPerKm - paceMin) * 60)
    return `${paceMin}'${paceSec.toString().padStart(2, '0')}"/km`
  }
  return `${kmh.toFixed(1)} km/h`
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

  // Heart rate data
  if (s.average_heartrate || s.max_heartrate) {
    text += `\n\n**Fréquence cardiaque:**`
    if (s.average_heartrate) text += `\n- Moyenne: ${Math.round(s.average_heartrate)} bpm`
    if (s.max_heartrate) text += `\n- Max: ${Math.round(s.max_heartrate)} bpm`
  }

  // Power data
  if (s.average_watts || s.max_watts) {
    text += `\n\n**Puissance:**`
    if (s.average_watts) text += `\n- Moyenne: ${Math.round(s.average_watts)} W`
    if (s.max_watts) text += `\n- Max: ${Math.round(s.max_watts)} W`
  }

  // Cadence
  if (s.average_cadence) {
    text += `\n**Cadence moyenne:** ${Math.round(s.average_cadence)} ${s.sport === 'running' ? 'ppm' : 'rpm'}`
  }

  if (s.description) {
    text += `\n\n**Description:**\n${s.description}`
  }

  // Laps / Intervals from Strava
  if (s.laps && s.laps.length > 0) {
    text += `\n\n**Intervalles/Tours (${s.laps.length}):**`
    s.laps.forEach((lap, i) => {
      const distKm = (lap.distance / 1000).toFixed(2)
      let lapText = `\n${i + 1}. ${lap.name} - ${formatLapDuration(lap.moving_time)}, ${distKm} km`
      lapText += `, ${formatSpeed(lap.average_speed, s.sport)}`
      if (lap.average_heartrate) lapText += `, ${Math.round(lap.average_heartrate)} bpm`
      if (lap.average_watts) lapText += `, ${Math.round(lap.average_watts)} W`
      if (lap.total_elevation_gain) lapText += `, ${Math.round(lap.total_elevation_gain)}m D+`
      text += lapText
    })
  }

  // Structure for planned sessions
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

  text += `\n\n---
**Format de réponse demandé (en Markdown brut) :**
Réponds UNIQUEMENT avec le code Markdown brut ci-dessous. Ne fais aucun rendu visuel, je veux le code source Markdown. Commence par ## sans rien avant :

\`\`\`
## Bilan de la séance

### ⚡ Charge
[Légère/Modérée/Intense] - [commentaire bref]

### ✅ Points positifs
- [point 1]
- [point 2]

### ⚠️ À améliorer
- [point 1]
- [point 2]

### 💡 Conseil
[1 conseil actionnable pour la prochaine séance]
\`\`\``

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

// Generate Zwift .zwo workout file
const generateZwoFile = (): string => {
  if (!props.session || props.session.sport !== 'cycling') return ''

  const s = props.session
  let workoutElements = ''

  if (s.structure && s.structure.length > 0) {
    s.structure.forEach((phase) => {
      const durationSec = phase.min * 60
      // Convert FTP percentage to decimal (e.g., 75 -> 0.75)
      const powerLow = phase.ftp_pct ? phase.ftp_pct[0] / 100 : 0.5
      const powerHigh = phase.ftp_pct ? phase.ftp_pct[1] / 100 : 0.7

      if (phase.phase === 'warmup') {
        workoutElements += `        <Warmup Duration="${durationSec}" PowerLow="${powerLow.toFixed(2)}" PowerHigh="${powerHigh.toFixed(2)}"/>\n`
      } else if (phase.phase === 'cooldown') {
        workoutElements += `        <Cooldown Duration="${durationSec}" PowerLow="${powerHigh.toFixed(2)}" PowerHigh="${powerLow.toFixed(2)}"/>\n`
      } else if (phase.phase === 'work' || phase.phase === 'rest') {
        const avgPower = ((powerLow + powerHigh) / 2).toFixed(2)
        if (phase.reps && phase.reps > 1) {
          // For intervals, we need work and rest phases
          // Assuming work phase uses current settings, rest at 50%
          const isWork = phase.phase === 'work'
          workoutElements += `        <IntervalsT Repeat="${phase.reps}" OnDuration="${durationSec}" OffDuration="${Math.round(durationSec * 0.5)}" OnPower="${isWork ? avgPower : '0.50'}" OffPower="${isWork ? '0.50' : avgPower}"/>\n`
        } else {
          workoutElements += `        <SteadyState Duration="${durationSec}" Power="${avgPower}"/>\n`
        }
      }
    })
  } else {
    // No structure - create a simple steady state workout
    const durationSec = s.duration_min * 60
    workoutElements = `        <SteadyState Duration="${durationSec}" Power="0.75"/>\n`
  }

  const zwoContent = `<workout_file>
    <author>Cadence</author>
    <name>${escapeXml(s.title)}</name>
    <description>${escapeXml(s.description || 'Workout exported from Cadence')}</description>
    <sportType>bike</sportType>
    <workout>
${workoutElements}    </workout>
</workout_file>`

  return zwoContent
}

const escapeXml = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

const downloadZwoFile = () => {
  const content = generateZwoFile()
  if (!content || !props.session) return

  const blob = new Blob([content], { type: 'application/xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  // Clean filename
  const filename = props.session.title
    .replace(/[^a-zA-Z0-9àâäéèêëïîôùûüç\s-]/g, '')
    .replace(/\s+/g, '_')
  a.download = `${filename}.zwo`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <dialog class="modal" :class="{ 'modal-open': !!session }">
    <div class="modal-box max-w-2xl h-[40rem] flex flex-col" v-if="session">
      <!-- Header -->
      <div class="flex items-center gap-3 mb-4 flex-shrink-0">
        <span class="text-4xl">{{ SPORT_CONFIG[session.sport].emoji }}</span>
        <div class="flex-1">
          <h3 class="font-bold text-lg">{{ session.title }}</h3>
          <p class="text-sm text-base-content/70">{{ formatDate(session.date) }}</p>
        </div>
        <button class="btn btn-sm btn-circle btn-ghost" @click="emit('close')">✕</button>
      </div>

      <!-- Tabs -->
      <div class="tabs tabs-boxed mb-4 flex-shrink-0">
        <button
          class="tab"
          :class="{ 'tab-active': currentPage === 'details' }"
          @click="currentPage = 'details'"
        >
          📊 Détails
        </button>
        <button
          class="tab"
          :class="{ 'tab-active': currentPage === 'coach' }"
          @click="currentPage = 'coach'"
        >
          💬 Coach
          <span v-if="hasFeedback" class="ml-1 badge badge-xs badge-success">✓</span>
        </button>
      </div>

      <!-- Page: Details -->
      <div v-show="currentPage === 'details'" class="space-y-4 flex-1 overflow-y-auto">
        <div class="flex gap-2">
          <div class="badge badge-outline">{{ session.type }}</div>
          <div class="badge badge-primary">{{ formatDuration(session.duration_min) }}</div>
        </div>

        <p class="text-base-content/80">{{ session.description }}</p>

        <!-- Strava stats -->
        <div v-if="session.average_heartrate || session.average_watts" class="flex flex-wrap gap-2">
          <div v-if="session.average_heartrate" class="badge badge-error gap-1">
            <span>❤️</span> {{ Math.round(session.average_heartrate) }} bpm
          </div>
          <div v-if="session.max_heartrate" class="badge badge-error badge-outline gap-1">
            max {{ session.max_heartrate }} bpm
          </div>
          <div v-if="session.average_watts" class="badge badge-warning gap-1">
            <span>⚡</span> {{ Math.round(session.average_watts) }} W
          </div>
          <div v-if="session.average_cadence" class="badge badge-info gap-1">
            {{ Math.round(session.average_cadence) }} {{ session.sport === 'running' ? 'ppm' : 'rpm' }}
          </div>
        </div>

        <!-- Laps / Intervals -->
        <div v-if="session.laps && session.laps.length > 0" class="collapse collapse-arrow bg-base-200">
          <input type="checkbox" checked />
          <div class="collapse-title font-medium">Intervalles ({{ session.laps.length }} tours)</div>
          <div class="collapse-content">
            <div class="overflow-x-auto">
              <table class="table table-xs">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nom</th>
                    <th>Durée</th>
                    <th>Dist.</th>
                    <th>Vitesse</th>
                    <th v-if="session.laps.some(l => l.average_heartrate)">FC</th>
                    <th v-if="session.laps.some(l => l.average_watts)">Watts</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(lap, i) in session.laps" :key="i" class="hover">
                    <td class="font-mono">{{ i + 1 }}</td>
                    <td class="truncate max-w-24">{{ lap.name }}</td>
                    <td class="font-mono">{{ formatLapDuration(lap.moving_time) }}</td>
                    <td class="font-mono">{{ (lap.distance / 1000).toFixed(2) }}</td>
                    <td class="font-mono">{{ formatSpeed(lap.average_speed, session.sport) }}</td>
                    <td v-if="session.laps.some(l => l.average_heartrate)" class="font-mono text-error">
                      {{ lap.average_heartrate ? Math.round(lap.average_heartrate) : '-' }}
                    </td>
                    <td v-if="session.laps.some(l => l.average_watts)" class="font-mono text-warning">
                      {{ lap.average_watts ? Math.round(lap.average_watts) : '-' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Structure for planned sessions -->
        <div v-if="session.structure && session.structure.length > 0" class="collapse collapse-arrow bg-base-200">
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

        <!-- Actions for Details page -->
        <div class="flex flex-wrap gap-2 pt-4 border-t border-base-300">
          <button
            class="btn btn-sm btn-outline"
            :class="copied ? 'btn-success' : 'btn-primary'"
            @click="copyForAnalysis"
          >
            {{ copied ? '✓ Copié !' : '📋 Copier pour coach' }}
          </button>
          <button
            v-if="session.sport === 'cycling' && session.type !== 'strava'"
            class="btn btn-sm btn-outline btn-warning"
            @click="downloadZwoFile"
          >
            🚴 Zwift
          </button>
          <button v-if="session.type !== 'strava'" class="btn btn-sm btn-error btn-outline" @click="handleDelete">
            🗑️ Supprimer
          </button>
        </div>
      </div>

      <!-- Page: Coach -->
      <div v-show="currentPage === 'coach'" class="space-y-4 flex-1 overflow-y-auto">
        <!-- Read mode: Display feedback nicely with markdown -->
        <div v-if="hasFeedback && !isEditingFeedback" class="space-y-3">
          <div
            class="bg-base-200 rounded-lg p-4 text-sm feedback-markdown"
            v-html="renderedFeedback"
          ></div>
          <div class="flex justify-end">
            <button class="btn btn-sm btn-ghost" @click="startEditFeedback">
              ✏️ Modifier
            </button>
          </div>
        </div>

        <!-- Edit mode: Textarea -->
        <div v-else class="space-y-3">
          <textarea
            v-model="feedbackText"
            class="textarea textarea-bordered w-full h-32"
            placeholder="Colle ici le retour de ton coach...

Exemple:
⚡ Charge: Modérée - bonne séance d'endurance
✅ Points positifs: Régularité, bonne gestion de l'effort
⚠️ À améliorer: Cadence un peu basse
💡 Conseil: Travaille la vélocité sur le prochain entraînement"
          ></textarea>
          <div class="flex justify-end gap-2">
            <button v-if="hasFeedback" class="btn btn-sm btn-ghost" @click="cancelEditFeedback">
              Annuler
            </button>
            <button
              class="btn btn-sm"
              :class="feedbackSaved ? 'btn-success' : 'btn-primary'"
              @click="saveFeedback"
            >
              {{ feedbackSaved ? '✓ Sauvegardé !' : '💾 Sauvegarder' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop" @click="emit('close')">
      <button>close</button>
    </form>
  </dialog>
</template>
