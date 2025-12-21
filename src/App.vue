<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSessions } from './composables/useSessions'
import { useStrava } from './composables/useStrava'
import { useGoogleCalendar } from './composables/useGoogleCalendar'
import { useSupabase } from './composables/useSupabase'
import type { SessionTemplate, ScheduledSession, TrainingPhase, TrainingObjective, ImportedPhase } from './types/session'
import { v4 as uuidv4 } from 'uuid'
import FileImport from './components/FileImport.vue'
import WeekCalendar from './components/WeekCalendar.vue'
import AddSessionModal from './components/AddSessionModal.vue'
import SessionDetailModal from './components/SessionDetailModal.vue'
import WeeklyStats from './components/WeeklyStats.vue'
import VolumeChart from './components/VolumeChart.vue'
import WellnessWidget from './components/WellnessWidget.vue'
import ObjectiveSettings from './components/ObjectiveSettings.vue'

const {
  sessions,
  init: initSessions,
  loadFromJson,
  addSession,
  addSessions,
  updateSessionDate,
  updateSessionFeedback,
  updateSession,
  removeSession,
  downloadJson,
  reset,
  weeklyStats,
  setCurrentWeek,
} = useSessions()

// Import modal
const showImportModal = ref(false)

// Strava disconnect modal
const showStravaDisconnectModal = ref(false)

const {
  isConnected: stravaConnected,
  isLoading: stravaLoading,
  authorize: stravaAuthorize,
  handleCallback: stravaHandleCallback,
  fetchActivities,
  fetchActivitiesWithDetails,
  convertToSessions,
  disconnect: stravaDisconnect,
} = useStrava()

const {
  isConnected: googleConnected,
  isLoading: googleLoading,
  authorize: googleAuthorize,
  handleCallback: googleHandleCallback,
  syncToCalendar,
  deleteAllEvents: googleDeleteAll,
  disconnect: googleDisconnect,
} = useGoogleCalendar()

// Google modals
const showGoogleDisconnectModal = ref(false)
const showGoogleDeleteModal = ref(false)

// Training phases & objectives
const { fetchSettings, updateSettings } = useSupabase()
const trainingPhases = ref<TrainingPhase[]>([])
const trainingObjectives = ref<TrainingObjective[]>([])
const showObjectivesModal = ref(false)

// Track new sessions for animation
const newSessionIds = ref<Set<string>>(new Set())
const spotlightSession = ref<ScheduledSession | null>(null)
const toastMessage = ref<string | null>(null)

// Show spotlight for new session
const showSpotlight = (session: ScheduledSession) => {
  spotlightSession.value = session
  newSessionIds.value = new Set([session.id])
}

const closeSpotlight = async () => {
  // Copy session data before closing
  if (spotlightSession.value) {
    await copySessionForCoach(spotlightSession.value)
    showToast('Séance copiée ! Envoie-la à ton coach 🏋️')
  }

  spotlightSession.value = null
  // Keep the calendar glow for a bit longer
  setTimeout(() => {
    newSessionIds.value = new Set()
  }, 3000)
}

const showToast = (message: string) => {
  toastMessage.value = message
  setTimeout(() => {
    toastMessage.value = null
  }, 3000)
}

// Copy spotlight session for coach analysis
const formatDateForCopy = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

const formatDurationForCopy = (min: number) => {
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
    const paceMinPerKm = 60 / kmh
    const paceMin = Math.floor(paceMinPerKm)
    const paceSec = Math.round((paceMinPerKm - paceMin) * 60)
    return `${paceMin}'${paceSec.toString().padStart(2, '0')}"/km`
  }
  return `${kmh.toFixed(1)} km/h`
}

const copySessionForCoach = async (s: ScheduledSession) => {
  try {
    const sportName = s.sport === 'cycling' ? 'Vélo' : s.sport === 'running' ? 'Course à pied' : 'Renforcement'

    let text = `## Séance d'entraînement à analyser

**Sport:** ${sportName}
**Titre:** ${s.title}
**Date:** ${formatDateForCopy(s.date)}
**Durée:** ${formatDurationForCopy(s.duration_min)}`

    if (s.actual_km) text += `\n**Distance:** ${s.actual_km} km`
    if (s.actual_elevation) text += `\n**Dénivelé:** ${s.actual_elevation} m D+`

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

    if (s.average_heartrate || s.max_heartrate) {
      text += `\n\n**Fréquence cardiaque:**`
      if (s.average_heartrate) text += `\n- Moyenne: ${Math.round(s.average_heartrate)} bpm`
      if (s.max_heartrate) text += `\n- Max: ${Math.round(s.max_heartrate)} bpm`
    }

    if (s.average_watts || s.max_watts) {
      text += `\n\n**Puissance:**`
      if (s.average_watts) text += `\n- Moyenne: ${Math.round(s.average_watts)} W`
      if (s.max_watts) text += `\n- Max: ${Math.round(s.max_watts)} W`
    }

    if (s.average_cadence) {
      text += `\n**Cadence moyenne:** ${Math.round(s.average_cadence)} ${s.sport === 'running' ? 'ppm' : 'rpm'}`
    }

    if (s.description) text += `\n\n**Description:**\n${s.description}`

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

    text += `\n\n---
**Format de réponse demandé (pour copier dans mon suivi) :**
Réponds avec ce format concis en 4-5 lignes max :

⚡ **Charge:** [Légère/Modérée/Intense] - [commentaire bref]
✅ **Points positifs:** [1-2 points]
⚠️ **À améliorer:** [1-2 points]
💡 **Conseil:** [1 conseil actionnable pour la prochaine séance]`

    await navigator.clipboard.writeText(text)
  } catch (err) {
    console.error('Copy failed:', err)
  }
}

// Delete all from Google Calendar
const deleteFromGoogle = async () => {
  showGoogleDeleteModal.value = false
  const deleted = await googleDeleteAll()
  alert(`${deleted} événement(s) supprimé(s) de Google Calendar`)
}

// Handle OAuth callbacks and init
onMounted(async () => {
  // Init sessions from Supabase
  await initSessions()

  // Load training phases & objectives from settings
  try {
    const settings = await fetchSettings()
    if (settings?.training_phases) {
      trainingPhases.value = settings.training_phases
    }
    if (settings?.training_objectives) {
      // Add default priority for old objectives without it
      trainingObjectives.value = settings.training_objectives.map(obj => ({
        ...obj,
        priority: obj.priority || 'A'
      }))
    }
  } catch (e) {
    console.error('Error loading settings:', e)
  }

  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get('code')
  const state = urlParams.get('state')

  if (code) {
    if (state === 'google') {
      await googleHandleCallback(code)
    } else {
      const success = await stravaHandleCallback(code)
      // Auto-sync after successful Strava connection
      if (success) {
        await syncStrava()
      }
    }
    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname)
  }
})

// Strava sync - only fetch details for NEW activities
const syncStrava = async () => {
  // First, get basic activity list (1 API call)
  const basicActivities = await fetchActivities(30)

  // Filter to only new activities (not already in sessions)
  const existingKeys = new Set(
    sessions.value
      .filter(s => s.type === 'strava')
      .map(s => `${s.title}-${s.date}`)
  )

  const newActivities = basicActivities.filter(activity => {
    const date = activity.start_date_local.split('T')[0]
    const key = `${activity.name}-${date}`
    return !existingKeys.has(key)
  })

  // Only fetch detailed data for new activities (no unnecessary API calls)
  if (newActivities.length === 0) {
    alert('Aucune nouvelle activité')
    return
  }

  const detailedActivities = await fetchActivitiesWithDetails(30, newActivities)
  const sessionsToAdd = convertToSessions(detailedActivities)

  let added = 0
  let replacedPlanned = 0
  const newIds: string[] = []

  for (const { session, date } of sessionsToAdd) {
    // Trouver la séance prévue du MÊME SPORT pour ce jour
    const plannedSameSport = sessions.value.find(
      s => s.date === date && s.sport === session.sport && s.type !== 'strava'
    )

    // Stocker les infos avant suppression pour les rattacher à l'activité Strava
    let sessionToAdd = { ...session }
    if (plannedSameSport) {
      sessionToAdd.planned_title = plannedSameSport.title
      sessionToAdd.planned_description = plannedSameSport.description
      await removeSession(plannedSameSport.id)
      replacedPlanned++
    }

    await addSession(sessionToAdd, date)
    const lastSession = sessions.value[sessions.value.length - 1]
    if (lastSession) {
      newIds.push(lastSession.id)
    }
    added++
  }

  // Trigger spotlight for new sessions
  if (newIds.length > 0) {
    const lastNewSession = sessions.value.find(s => s.id === newIds[newIds.length - 1])
    if (lastNewSession) {
      showSpotlight(lastNewSession)
    }
  }

  if (added > 0) {
    const msg = [`${added} activité(s) ajoutée(s)`]
    if (replacedPlanned > 0) {
      msg.push(`${replacedPlanned} séance(s) prévue(s) remplacée(s)`)
    }
    alert(`Strava : ${msg.join(', ')}`)
  }
}

// Google Calendar sync
const syncGoogle = async () => {
  const { added, updated } = await syncToCalendar(sessions.value)
  if (added > 0 || updated > 0) {
    alert(`Google Calendar : ${added} ajoutée(s), ${updated} mise(s) à jour`)
  } else {
    alert('Aucune séance à synchroniser')
  }
}

// Modal states
const showAddModal = ref(false)
const addModalDate = ref('')
const selectedSession = ref<ScheduledSession | null>(null)

// Theme
const isDarkMode = ref(localStorage.getItem('theme') === 'dracula')

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  const theme = isDarkMode.value ? 'dracula' : 'cupcake'
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
}

// Initialize theme
document.documentElement.setAttribute('data-theme', isDarkMode.value ? 'dracula' : 'cupcake')

// Handlers
const handleImport = async (data: (SessionTemplate | ScheduledSession)[], replaceExisting: boolean, phase?: ImportedPhase) => {
  await loadFromJson(data, replaceExisting)

  // If phase info was provided, create/update the training phase
  if (phase) {
    // Calculate start_date based on current week and phase week number
    const today = new Date()
    const dayOfWeek = today.getDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const thisMonday = new Date(today)
    thisMonday.setDate(today.getDate() + mondayOffset)

    // Go back (week - 1) weeks to get phase start
    const phaseStart = new Date(thisMonday)
    phaseStart.setDate(thisMonday.getDate() - (phase.week - 1) * 7)

    // Calculate end date
    const phaseEnd = new Date(phaseStart)
    phaseEnd.setDate(phaseStart.getDate() + phase.total_weeks * 7 - 1)

    const formatDate = (d: Date) => d.toISOString().split('T')[0] ?? ''

    // Create or update the phase
    const newPhase: TrainingPhase = {
      id: uuidv4(),
      name: phase.name,
      start_date: formatDate(phaseStart),
      end_date: formatDate(phaseEnd),
      description: phase.description,
    }

    // Replace existing phases (simple approach: one phase at a time)
    trainingPhases.value = [newPhase]
    await updateSettings({ training_phases: [newPhase] } as any)
  }

  showImportModal.value = false
}

const handleAddSession = (date: string) => {
  addModalDate.value = date
  showAddModal.value = true
}

const handleAddSessions = async (templates: SessionTemplate[]) => {
  await addSessions(templates, addModalDate.value)
}

const handleUpdateDate = async (sessionId: string, newDate: string) => {
  await updateSessionDate(sessionId, newDate)
}

const handleSelectSession = (session: ScheduledSession) => {
  selectedSession.value = session
}

const handleSaveObjectives = async (objectives: TrainingObjective[]) => {
  trainingObjectives.value = objectives
  try {
    await updateSettings({ training_objectives: objectives } as any)
  } catch (e) {
    console.error('Error saving objectives:', e)
  }
}

const handleDeleteSession = async (sessionId: string) => {
  await removeSession(sessionId)
}

const handleUpdateFeedback = async (sessionId: string, feedback: string) => {
  await updateSessionFeedback(sessionId, feedback)
}

const handleUpdateSession = async (sessionId: string, updates: { title: string; description: string }) => {
  await updateSession(sessionId, updates)
}

const handleReset = () => {
  if (confirm('Réinitialiser toutes les données ?')) {
    reset()
  }
}
</script>

<template>
  <div class="min-h-screen app-bg">
    <!-- Header -->
    <header class="sticky top-0 z-50 border-b border-base-300/50 bg-base-100/80 backdrop-blur-lg">
      <div class="container mx-auto max-w-6xl px-4">
        <div class="flex h-16 items-center justify-between">
          <!-- Logo -->
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span class="text-lg">🎯</span>
            </div>
            <span class="text-xl font-bold tracking-tight">Cadence</span>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-1">
            <!-- Strava -->
            <div v-if="stravaConnected" class="dropdown dropdown-end">
              <button
                tabindex="0"
                class="btn btn-sm btn-ghost gap-2"
                :class="{ 'loading': stravaLoading }"
                :disabled="stravaLoading"
              >
                <span class="w-2 h-2 rounded-full bg-[#fc4c02]"></span>
                <span v-if="!stravaLoading">Strava</span>
                <span v-else>Sync...</span>
              </button>
              <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-xl z-50 w-44 p-2 shadow-xl mt-2 border border-base-300">
                <li><a @click="syncStrava" class="rounded-lg">🔄 Synchroniser</a></li>
                <li><a class="text-error rounded-lg" @click="showStravaDisconnectModal = true">Déconnecter</a></li>
              </ul>
            </div>
            <button
              v-else
              class="btn btn-sm btn-ghost text-[#fc4c02]"
              @click="stravaAuthorize"
            >
              + Strava
            </button>

            <!-- Divider -->
            <div class="w-px h-6 bg-base-300 mx-1"></div>

            <!-- Google Calendar -->
            <div v-if="googleConnected" class="dropdown dropdown-end">
              <button
                tabindex="0"
                class="btn btn-sm btn-ghost gap-2"
                :class="{ 'loading': googleLoading }"
                :disabled="googleLoading"
              >
                <span class="w-2 h-2 rounded-full bg-[#4285f4]"></span>
                <span v-if="!googleLoading">Calendar</span>
                <span v-else>Sync...</span>
              </button>
              <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-xl z-50 w-44 p-2 shadow-xl mt-2 border border-base-300">
                <li><a @click="syncGoogle" class="rounded-lg">🔄 Synchroniser</a></li>
                <li><a @click="showGoogleDeleteModal = true" class="rounded-lg">🗑️ Tout supprimer</a></li>
                <li><a class="text-error rounded-lg" @click="showGoogleDisconnectModal = true">Déconnecter</a></li>
              </ul>
            </div>
            <button
              v-else
              class="btn btn-sm btn-ghost text-[#4285f4]"
              @click="googleAuthorize"
            >
              + Calendar
            </button>

            <!-- Divider -->
            <div class="w-px h-6 bg-base-300 mx-1"></div>

            <!-- Settings Menu -->
            <div class="dropdown dropdown-end">
              <button tabindex="0" class="btn btn-sm btn-ghost btn-square">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
              <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-xl z-50 w-48 p-2 shadow-xl mt-2 border border-base-300">
                <li><a @click="showImportModal = true" class="rounded-lg">📥 Importer</a></li>
                <li><a @click="downloadJson" class="rounded-lg">💾 Exporter</a></li>
                <li class="border-t border-base-300 mt-1 pt-1">
                  <a class="text-error rounded-lg" @click="handleReset">🗑️ Réinitialiser</a>
                </li>
              </ul>
            </div>

            <!-- Objectives button -->
            <button
              class="btn btn-sm gap-1 bg-pink-500 text-white font-semibold border-0 hover:bg-pink-600 shadow-lg shadow-pink-500/40 animate-pulse-subtle"
              @click="showObjectivesModal = true"
            >
              🎯 Objectifs
            </button>

            <!-- Theme Toggle -->
            <button class="btn btn-sm btn-ghost btn-square" @click="toggleTheme">
              <span v-if="isDarkMode">☀️</span>
              <span v-else>🌙</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="container mx-auto p-4 max-w-6xl">
      <div class="space-y-6">
        <WeekCalendar
          :sessions="sessions"
          :new-session-ids="newSessionIds"
          :training-phases="trainingPhases"
          @update-date="handleUpdateDate"
          @add-session="handleAddSession"
          @select-session="handleSelectSession"
          @week-change="setCurrentWeek"
        />

        <WeeklyStats :stats="weeklyStats" />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <VolumeChart :sessions="sessions" />
          <WellnessWidget />
        </div>
      </div>
    </div>

    <!-- Modals -->
    <AddSessionModal
      :open="showAddModal"
      :date="addModalDate"
      @close="showAddModal = false"
      @add="handleAddSessions"
    />

    <SessionDetailModal
      :session="selectedSession"
      @close="selectedSession = null"
      @delete="handleDeleteSession"
      @update-feedback="handleUpdateFeedback"
      @update="handleUpdateSession"
    />

    <!-- Import Modal -->
    <dialog class="modal" :class="{ 'modal-open': showImportModal }">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">📥 Importer des séances</h3>
        <FileImport
          :sessions="sessions"
          :training-phases="trainingPhases"
          :training-objectives="trainingObjectives"
          @import="handleImport"
        />
        <div class="modal-action">
          <button class="btn btn-ghost" @click="showImportModal = false">Fermer</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop" @click="showImportModal = false">
        <button>close</button>
      </form>
    </dialog>

    <!-- Strava Disconnect Modal -->
    <dialog class="modal" :class="{ 'modal-open': showStravaDisconnectModal }">
      <div class="modal-box">
        <h3 class="font-bold text-lg">Déconnecter Strava ?</h3>
        <p class="py-4 text-base-content/70">Tu devras te reconnecter pour synchroniser tes activités.</p>
        <div class="modal-action">
          <button class="btn btn-ghost" @click="showStravaDisconnectModal = false">Annuler</button>
          <button class="btn btn-error" @click="stravaDisconnect(); showStravaDisconnectModal = false">Déconnecter</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop" @click="showStravaDisconnectModal = false">
        <button>close</button>
      </form>
    </dialog>

    <!-- Google Disconnect Modal -->
    <dialog class="modal" :class="{ 'modal-open': showGoogleDisconnectModal }">
      <div class="modal-box">
        <h3 class="font-bold text-lg">Déconnecter Google Calendar ?</h3>
        <p class="py-4 text-base-content/70">Tu devras te reconnecter pour synchroniser tes séances dans ton agenda.</p>
        <div class="modal-action">
          <button class="btn btn-ghost" @click="showGoogleDisconnectModal = false">Annuler</button>
          <button class="btn btn-error" @click="googleDisconnect(); showGoogleDisconnectModal = false">Déconnecter</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop" @click="showGoogleDisconnectModal = false">
        <button>close</button>
      </form>
    </dialog>

    <!-- Google Delete Modal -->
    <dialog class="modal" :class="{ 'modal-open': showGoogleDeleteModal }">
      <div class="modal-box">
        <h3 class="font-bold text-lg">Supprimer de Google Calendar ?</h3>
        <p class="py-4 text-base-content/70">Toutes les séances synchronisées seront supprimées de ton agenda Google.</p>
        <div class="modal-action">
          <button class="btn btn-ghost" @click="showGoogleDeleteModal = false">Annuler</button>
          <button class="btn btn-error" @click="deleteFromGoogle">Supprimer</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop" @click="showGoogleDeleteModal = false">
        <button>close</button>
      </form>
    </dialog>

    <!-- Objectives Modal -->
    <dialog class="modal" :class="{ 'modal-open': showObjectivesModal }">
      <div class="modal-box max-w-lg">
        <ObjectiveSettings
          :objectives="trainingObjectives"
          @save="handleSaveObjectives"
          @close="showObjectivesModal = false"
        />
      </div>
      <form method="dialog" class="modal-backdrop" @click="showObjectivesModal = false">
        <button>close</button>
      </form>
    </dialog>

    <!-- New Activity Spotlight -->
    <Teleport to="body">
      <Transition name="spotlight">
        <div
          v-if="spotlightSession"
          class="spotlight-overlay"
          @click="closeSpotlight"
        >
          <div
            class="spotlight-card"
            @click="closeSpotlight"
          >
            <div class="spotlight-bg"></div>
            <div class="spotlight-content">
              <div class="spotlight-emoji">
                {{ spotlightSession.sport === 'cycling' ? '🚴' : spotlightSession.sport === 'running' ? '🏃' : '💪' }}
              </div>
              <h2 class="spotlight-title">{{ spotlightSession.title }}</h2>
              <p class="spotlight-description">{{ spotlightSession.description }}</p>
              <div class="spotlight-stats">
                <span>{{ Math.floor(spotlightSession.duration_min / 60) }}h{{ (spotlightSession.duration_min % 60).toString().padStart(2, '0') }}</span>
                <span v-if="spotlightSession.actual_km">{{ spotlightSession.actual_km }} km</span>
                <span v-if="spotlightSession.actual_elevation">{{ spotlightSession.actual_elevation }}m D+</span>
              </div>
              <!-- Extra stats if available -->
              <div v-if="spotlightSession.average_heartrate || spotlightSession.average_watts" class="spotlight-stats mt-1">
                <span v-if="spotlightSession.average_heartrate">❤️ {{ Math.round(spotlightSession.average_heartrate) }} bpm</span>
                <span v-if="spotlightSession.average_watts">⚡ {{ Math.round(spotlightSession.average_watts) }} W</span>
              </div>
              <div class="spotlight-badge">Nouvelle activité !</div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Toast notification -->
    <Teleport to="body">
      <Transition name="toast">
        <div
          v-if="toastMessage"
          class="fixed bottom-6 right-6 z-[10000] bg-success text-success-content px-4 py-3 rounded-xl shadow-lg flex items-center gap-2"
        >
          <span class="text-lg">✓</span>
          <span>{{ toastMessage }}</span>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
