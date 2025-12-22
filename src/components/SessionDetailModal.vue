<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { marked } from 'marked'
import type { ScheduledSession } from '../types/session'
import { SPORT_CONFIG } from '../types/session'
import { generateAnalysisText } from '../utils/coach'

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
  update: [sessionId: string, updates: { title: string; description: string }]
}>()

const copied = ref(false)
const feedbackText = ref('')
const feedbackSaved = ref(false)
const isEditingFeedback = ref(false)
const currentPage = ref<'details' | 'planned' | 'coach'>('details')

// Strava session editing
const isEditingStrava = ref(false)
const editTitle = ref('')
const editDescription = ref('')

// Sync state when session changes
watch(() => props.session, (newSession) => {
  feedbackText.value = newSession?.coach_feedback || ''
  feedbackSaved.value = false
  isEditingFeedback.value = false
  currentPage.value = 'details'
  // Reset Strava editing
  isEditingStrava.value = false
  editTitle.value = newSession?.title || ''
  editDescription.value = newSession?.description || ''
}, { immediate: true })

// Check if feedback exists
const hasFeedback = computed(() => !!feedbackText.value.trim())

// Check if planned session info exists (for Strava sessions that replaced a planned one)
const hasPlannedInfo = computed(() => {
  return props.session?.type === 'strava' &&
    (props.session.planned_title || props.session.planned_description)
})

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

const copyForAnalysis = async () => {
  if (!props.session) return
  const text = generateAnalysisText(props.session)
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

// Strava editing functions
const startEditStrava = () => {
  editTitle.value = props.session?.title || ''
  editDescription.value = props.session?.description || ''
  isEditingStrava.value = true
}

const applyPlannedInfo = () => {
  // Pre-fill with planned session info and start editing
  editTitle.value = props.session?.planned_title || props.session?.title || ''
  editDescription.value = props.session?.planned_description || props.session?.description || ''
  isEditingStrava.value = true
  currentPage.value = 'details'
}

const cancelEditStrava = () => {
  editTitle.value = props.session?.title || ''
  editDescription.value = props.session?.description || ''
  isEditingStrava.value = false
}

const saveStrava = () => {
  if (props.session && editTitle.value.trim()) {
    emit('update', props.session.id, {
      title: editTitle.value.trim(),
      description: editDescription.value.trim()
    })
    isEditingStrava.value = false
  }
}

// Download Zwift .zwo workout file (XML provided by Gemini)
const downloadZwoFile = () => {
  if (!props.session?.zwift_workout) return

  const blob = new Blob([props.session.zwift_workout], { type: 'application/xml' })
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
          <!-- Edit mode for Strava -->
          <div v-if="isEditingStrava" class="space-y-2">
            <input
              v-model="editTitle"
              type="text"
              class="input input-sm input-bordered w-full font-bold"
              placeholder="Titre de la séance"
            />
          </div>
          <!-- Normal display -->
          <div v-else class="flex items-center gap-2">
            <h3 class="font-bold text-lg">{{ session.title }}</h3>
            <button
              v-if="session.type === 'strava'"
              class="btn btn-xs btn-ghost"
              @click="startEditStrava"
            >
              ✏️
            </button>
          </div>
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
          v-if="hasPlannedInfo"
          class="tab"
          :class="{ 'tab-active': currentPage === 'planned' }"
          @click="currentPage = 'planned'"
        >
          📋 Prévu
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

        <!-- Description: editable for Strava -->
        <div v-if="isEditingStrava" class="space-y-3">
          <textarea
            v-model="editDescription"
            class="textarea textarea-bordered w-full h-24"
            placeholder="Description de la séance..."
          ></textarea>
          <div class="flex justify-end gap-2">
            <button class="btn btn-sm btn-ghost" @click="cancelEditStrava">Annuler</button>
            <button class="btn btn-sm btn-primary" @click="saveStrava" :disabled="!editTitle.trim()">
              💾 Enregistrer
            </button>
          </div>
        </div>
        <p v-else class="text-base-content/80 whitespace-pre-line">{{ session.description }}</p>

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
            v-if="session.zwift_workout"
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

      <!-- Page: Planned (when Strava activity replaced a planned session) -->
      <div v-show="currentPage === 'planned'" class="space-y-4 flex-1 overflow-y-auto">
        <div class="bg-base-200 rounded-lg p-4 space-y-3">
          <div class="text-sm text-base-content/60">Cette activité a remplacé une séance prévue</div>

          <div>
            <div class="text-xs text-base-content/50 mb-1">Titre prévu</div>
            <div class="font-semibold">{{ session.planned_title }}</div>
          </div>

          <div v-if="session.planned_description">
            <div class="text-xs text-base-content/50 mb-1">Description prévue</div>
            <div class="text-sm text-base-content/80 whitespace-pre-wrap">{{ session.planned_description }}</div>
          </div>
        </div>

        <button
          class="btn btn-primary w-full"
          @click="applyPlannedInfo"
        >
          ✏️ Appliquer à l'activité
        </button>

        <p class="text-xs text-center text-base-content/50">
          Ceci pré-remplira le titre et la description pour modification
        </p>
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
