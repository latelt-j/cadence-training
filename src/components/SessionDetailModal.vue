<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { marked } from 'marked'
import type { ScheduledSession, AthleteProfile } from '../types/session'
import { SPORT_CONFIG } from '../types/session'
import { generateAnalysisText, generateTitleSuggestionPrompt } from '../utils/coach'
import { useStrava } from '../composables/useStrava'

const { updateActivity } = useStrava()

// Configure marked for inline rendering (no <p> tags)
marked.setOptions({
  breaks: true,
  gfm: true,
})

const props = defineProps<{
  session: ScheduledSession | null
  athleteProfile?: AthleteProfile
}>()

const emit = defineEmits<{
  close: []
  delete: [sessionId: string]
  updateFeedback: [sessionId: string, feedback: string]
  update: [sessionId: string, updates: { title: string; description: string }]
  resync: [sessionId: string, stravaId: number]
  toast: [message: string, type?: 'success' | 'error']
}>()

const copied = ref(false)
const feedbackText = ref('')
const feedbackSaved = ref(false)
const feedbackError = ref(false)
const isSavingFeedback = ref(false)
const isEditingFeedback = ref(false)
const currentPage = ref<'details' | 'planned' | 'coach'>('details')

// Coach comment dropdown
const coachComment = ref('')
const dropdownRef = ref<HTMLDetailsElement | null>(null)

// Strava session editing
const isEditingStrava = ref(false)
const editTitle = ref('')
const editDescription = ref('')
const suggestionCopied = ref(false)
const isSaving = ref(false)
const isResyncing = ref(false)

const handleResync = () => {
  if (!props.session?.strava_id) return
  isResyncing.value = true
  emit('resync', props.session.id, props.session.strava_id)
}

// Called by parent when resync is done
const onResyncComplete = () => {
  isResyncing.value = false
}

defineExpose({ onResyncComplete })

const copyTitleSuggestion = async () => {
  if (!props.session) return
  const text = generateTitleSuggestionPrompt(props.session)
  await navigator.clipboard.writeText(text)
  suggestionCopied.value = true
  setTimeout(() => {
    suggestionCopied.value = false
  }, 2000)
}

// Sync state when session changes
watch(() => props.session, (newSession, oldSession) => {
  // Ne pas reset si on édite et que c'est la même session (juste une mise à jour)
  const isSameSession = oldSession && newSession && oldSession.id === newSession.id

  if (!isSameSession || !isEditingFeedback.value) {
    feedbackText.value = newSession?.coach_feedback || ''
    isEditingFeedback.value = false
  }

  if (!isSameSession) {
    feedbackSaved.value = false
    currentPage.value = 'details'
    // Reset Strava editing
    isEditingStrava.value = false
    suggestionCopied.value = false
  }

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

const saveFeedback = async () => {
  if (!props.session) return

  isSavingFeedback.value = true
  feedbackError.value = false

  try {
    emit('updateFeedback', props.session.id, feedbackText.value)
    feedbackSaved.value = true
    isEditingFeedback.value = false
    setTimeout(() => {
      feedbackSaved.value = false
    }, 2000)
  } catch {
    feedbackError.value = true
    emit('toast', 'Erreur de sauvegarde', 'error')
  } finally {
    isSavingFeedback.value = false
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

const copyForAnalysis = async (withComment: boolean = false) => {
  if (!props.session) return
  const comment = withComment ? coachComment.value : undefined
  const text = generateAnalysisText(props.session, comment, props.athleteProfile)
  await navigator.clipboard.writeText(text)
  copied.value = true
  coachComment.value = ''
  // Fermer le dropdown
  if (dropdownRef.value) {
    dropdownRef.value.open = false
  }
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

const saveStrava = async () => {
  if (!props.session || !editTitle.value.trim()) return

  isSaving.value = true

  try {
    // Update on Strava if it's a Strava activity
    if (props.session.strava_id) {
      const success = await updateActivity(props.session.strava_id, {
        name: editTitle.value.trim(),
        description: editDescription.value.trim(),
      })

      if (!success) {
        emit('toast', 'Erreur lors de la mise à jour sur Strava', 'error')
        isSaving.value = false
        return
      }
    }

    // Update locally
    emit('update', props.session.id, {
      title: editTitle.value.trim(),
      description: editDescription.value.trim(),
    })

    isEditingStrava.value = false
    emit('toast', 'Activité mise à jour sur Strava ✓', 'success')
  } catch {
    emit('toast', 'Erreur lors de la mise à jour', 'error')
  } finally {
    isSaving.value = false
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
          <div class="flex justify-between items-center">
            <button
              class="btn btn-sm btn-outline"
              :class="suggestionCopied ? 'btn-success' : ''"
              @click="copyTitleSuggestion"
            >
              {{ suggestionCopied ? '✓ Copié !' : '🤖 Suggérer titre' }}
            </button>
            <div class="flex gap-2">
              <button class="btn btn-sm btn-ghost" @click="cancelEditStrava" :disabled="isSaving">Annuler</button>
              <button class="btn btn-sm btn-primary" @click="saveStrava" :disabled="!editTitle.trim() || isSaving">
                <span v-if="isSaving" class="loading loading-spinner loading-xs"></span>
                {{ isSaving ? 'Envoi...' : '💾 Enregistrer' }}
              </button>
            </div>
          </div>
        </div>
        <p v-else class="text-base-content/80 whitespace-pre-line">{{ session.description }}</p>

        <!-- Strava stats -->
        <div v-if="session.average_heartrate || session.average_watts" class="flex flex-wrap gap-2">
          <div v-if="session.average_heartrate" class="badge badge-error gap-1">
            <span>&#10084;&#65039;</span> {{ Math.round(session.average_heartrate) }} bpm
          </div>
          <div v-if="session.max_heartrate" class="badge badge-error badge-outline gap-1">
            max {{ session.max_heartrate }} bpm
          </div>
          <div v-if="session.average_watts" class="badge badge-warning gap-1">
            <span>&#9889;</span> {{ Math.round(session.average_watts) }} W
          </div>
          <div v-if="session.average_cadence" class="badge badge-info gap-1">
            {{ Math.round(session.average_cadence) }} {{ session.sport === 'running' ? 'ppm' : 'rpm' }}
          </div>
        </div>

        <!-- Cycling advanced metrics -->
        <div
          v-if="
            session.sport === 'cycling' &&
            (session.normalized_power ||
              session.intensity_factor ||
              session.variability_index ||
              session.aerobic_decoupling !== undefined ||
              session.average_vam ||
              session.suffer_score ||
              session.kilojoules)
          "
          class="bg-base-200 rounded-lg p-3"
        >
          <div class="text-sm font-medium mb-2">Metriques velo</div>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center">
            <div v-if="session.normalized_power" class="bg-base-100 rounded p-2">
              <div class="text-xs text-base-content/60">NP</div>
              <div class="font-bold text-warning">{{ Math.round(session.normalized_power) }}W</div>
            </div>
            <div v-if="session.intensity_factor" class="bg-base-100 rounded p-2">
              <div class="text-xs text-base-content/60">IF</div>
              <div class="font-bold" :class="session.intensity_factor > 1 ? 'text-error' : 'text-success'">
                {{ session.intensity_factor.toFixed(2) }}
              </div>
            </div>
            <div v-if="session.variability_index" class="bg-base-100 rounded p-2">
              <div class="text-xs text-base-content/60">VI</div>
              <div class="font-bold">{{ session.variability_index.toFixed(2) }}</div>
            </div>
            <div v-if="session.aerobic_decoupling !== undefined" class="bg-base-100 rounded p-2">
              <div class="text-xs text-base-content/60">Decouplage</div>
              <div class="font-bold" :class="session.aerobic_decoupling > 5 ? 'text-warning' : 'text-success'">
                {{ session.aerobic_decoupling.toFixed(1) }}%
              </div>
            </div>
            <div v-if="session.average_vam" class="bg-base-100 rounded p-2">
              <div class="text-xs text-base-content/60">VAM</div>
              <div class="font-bold">{{ session.average_vam }} m/h</div>
            </div>
            <div v-if="session.suffer_score" class="bg-base-100 rounded p-2">
              <div class="text-xs text-base-content/60">Effort</div>
              <div class="font-bold text-error">{{ session.suffer_score }}</div>
            </div>
            <div v-if="session.kilojoules" class="bg-base-100 rounded p-2">
              <div class="text-xs text-base-content/60">Travail</div>
              <div class="font-bold">{{ Math.round(session.kilojoules) }} kJ</div>
            </div>
            <div v-if="session.calories" class="bg-base-100 rounded p-2">
              <div class="text-xs text-base-content/60">Calories</div>
              <div class="font-bold">{{ session.calories }} kcal</div>
            </div>
          </div>
          <div v-if="session.device_watts === false" class="text-xs text-warning mt-2 text-center">
            Puissance estimee (pas de capteur)
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
            <button v-if="hasFeedback" class="btn btn-sm btn-ghost" @click="cancelEditFeedback" :disabled="isSavingFeedback">
              Annuler
            </button>
            <button
              class="btn btn-sm"
              :class="{
                'btn-success': feedbackSaved,
                'btn-error': feedbackError,
                'btn-primary': !feedbackSaved && !feedbackError
              }"
              :disabled="isSavingFeedback"
              @click="saveFeedback"
            >
              <span v-if="isSavingFeedback" class="loading loading-spinner loading-xs"></span>
              {{ isSavingFeedback ? 'Sauvegarde...' : feedbackSaved ? '✓ Sauvegardé !' : feedbackError ? '✗ Erreur' : '💾 Sauvegarder' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Actions footer (outside scrollable area to fix dropdown z-index) -->
      <div v-show="currentPage === 'details'" class="flex flex-wrap gap-2 pt-4 border-t border-base-300 flex-shrink-0">
        <!-- Dropdown pour copier avec commentaire -->
        <details ref="dropdownRef" class="dropdown dropdown-top">
          <summary
            class="btn btn-sm btn-outline"
            :class="copied ? 'btn-success' : 'btn-primary'"
          >
            {{ copied ? '✓ Copié !' : '📋 Copier pour coach' }}
          </summary>
          <div class="dropdown-content bg-base-200 rounded-box p-4 shadow-xl w-72 mb-2 right-1">
            <p class="text-sm font-medium mb-2">💬 Un commentaire ?</p>
            <textarea
              v-model="coachComment"
              class="textarea textarea-bordered w-full h-20 text-sm"
              placeholder="Jambes lourdes, super sensations, objectif atteint..."
            ></textarea>
            <div class="flex justify-end gap-2 mt-2">
              <button class="btn btn-sm btn-ghost" @click="copyForAnalysis(false)">Passer</button>
              <button class="btn btn-sm btn-primary" @click="copyForAnalysis(true)">📋 Copier</button>
            </div>
          </div>
        </details>
        <button
          v-if="session.type === 'strava' && session.strava_id"
          class="btn btn-sm btn-outline btn-info"
          :disabled="isResyncing"
          @click="handleResync"
        >
          <span v-if="isResyncing" class="loading loading-spinner loading-xs"></span>
          {{ isResyncing ? 'Sync...' : '🔄 Re-sync' }}
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
    <form method="dialog" class="modal-backdrop" @click="emit('close')">
      <button>close</button>
    </form>
  </dialog>
</template>
