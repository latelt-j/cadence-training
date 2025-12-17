<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSessions } from './composables/useSessions'
import { useStrava } from './composables/useStrava'
import { useGoogleCalendar } from './composables/useGoogleCalendar'
import type { SessionTemplate, ScheduledSession } from './types/session'
import FileImport from './components/FileImport.vue'
import WeekCalendar from './components/WeekCalendar.vue'
import AddSessionModal from './components/AddSessionModal.vue'
import SessionDetailModal from './components/SessionDetailModal.vue'
import WeeklyStats from './components/WeeklyStats.vue'
import VolumeChart from './components/VolumeChart.vue'
import WellnessWidget from './components/WellnessWidget.vue'

const {
  sessions,
  init: initSessions,
  loadFromJson,
  addSession,
  addSessions,
  updateSessionDate,
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

// Track new sessions for animation
const newSessionIds = ref<Set<string>>(new Set())
const spotlightSession = ref<ScheduledSession | null>(null)
const spotlightCardRef = ref<HTMLElement | null>(null)

// Show spotlight for new session
const showSpotlight = (session: ScheduledSession) => {
  spotlightSession.value = session
  newSessionIds.value = new Set([session.id])
}

const closeSpotlight = () => {
  spotlightSession.value = null
  // Keep the calendar glow for a bit longer
  setTimeout(() => {
    newSessionIds.value = new Set()
  }, 3000)
}

// 3D hover effect
const handleSpotlightMouseMove = (e: MouseEvent) => {
  const card = spotlightCardRef.value
  if (!card) return

  const rect = card.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const centerX = rect.width / 2
  const centerY = rect.height / 2

  const rotateX = ((y - centerY) / centerY) * -15
  const rotateY = ((x - centerX) / centerX) * 15

  card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
}

const handleSpotlightMouseLeave = () => {
  const card = spotlightCardRef.value
  if (!card) return
  card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
}

const handleSpotlightClick = () => {
  const card = spotlightCardRef.value
  if (!card) return

  // Add celebration effect
  card.classList.add('spotlight-celebrate')

  // Close after animation
  setTimeout(() => {
    closeSpotlight()
  }, 600)
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

  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get('code')
  const state = urlParams.get('state')

  if (code) {
    if (state === 'google') {
      await googleHandleCallback(code)
    } else {
      await stravaHandleCallback(code)
    }
    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname)
  }
})

// Strava sync
const syncStrava = async () => {
  const activities = await fetchActivities(30) // 30 derniers jours
  const sessionsToAdd = convertToSessions(activities)

  let added = 0
  let updated = 0
  let removedPlanned = 0
  const newIds: string[] = []

  sessionsToAdd.forEach(({ session, date }) => {
    const key = `${session.title}-${date}`
    const existingIndex = sessions.value.findIndex(
      s => `${s.title}-${s.date}` === key
    )

    if (existingIndex !== -1) {
      // Remplacer l'activité existante
      const existing = sessions.value[existingIndex]
      if (existing) {
        sessions.value[existingIndex] = {
          ...session,
          id: existing.id,
          date,
        } as typeof sessions.value[0]
        updated++
      }
    } else {
      // Supprimer les séances prévues pour ce jour
      const plannedOnSameDay = sessions.value.filter(
        s => s.date === date && s.type !== 'strava'
      )
      plannedOnSameDay.forEach(planned => {
        removeSession(planned.id)
        removedPlanned++
      })

      // Nouvelle activité
      addSession(session, date)
      // Get the ID of the newly added session (last one)
      const lastSession = sessions.value[sessions.value.length - 1]
      if (lastSession) {
        newIds.push(lastSession.id)
      }
      added++
    }
  })

  // Trigger spotlight for new sessions
  if (newIds.length > 0) {
    const lastNewSession = sessions.value.find(s => s.id === newIds[newIds.length - 1])
    if (lastNewSession) {
      showSpotlight(lastNewSession)
    }
  }

  const messages = []
  if (added > 0) messages.push(`${added} ajoutée(s)`)
  if (updated > 0) messages.push(`${updated} mise(s) à jour`)
  if (removedPlanned > 0) messages.push(`${removedPlanned} prévue(s) supprimée(s)`)

  if (messages.length > 0) {
    alert(`Strava : ${messages.join(', ')}`)
  } else {
    alert('Aucune nouvelle activité')
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
const handleImport = async (data: (SessionTemplate | ScheduledSession)[]) => {
  await loadFromJson(data)
  showImportModal.value = false
}

const handleAddSession = (date: string) => {
  addModalDate.value = date
  showAddModal.value = true
}

const handleAddSessions = (templates: SessionTemplate[]) => {
  addSessions(templates, addModalDate.value)
}

const handleUpdateDate = (sessionId: string, newDate: string) => {
  updateSessionDate(sessionId, newDate)
}

const handleSelectSession = (session: ScheduledSession) => {
  selectedSession.value = session
}

const handleDeleteSession = (sessionId: string) => {
  removeSession(sessionId)
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
    />

    <!-- Import Modal -->
    <dialog class="modal" :class="{ 'modal-open': showImportModal }">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">📥 Importer des séances</h3>
        <FileImport @import="handleImport" />
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

    <!-- New Activity Spotlight -->
    <Teleport to="body">
      <Transition name="spotlight">
        <div
          v-if="spotlightSession"
          class="spotlight-overlay"
          @click="closeSpotlight"
        >
          <div
            ref="spotlightCardRef"
            class="spotlight-card"
            @click.stop="handleSpotlightClick"
            @mousemove="handleSpotlightMouseMove"
            @mouseleave="handleSpotlightMouseLeave"
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
              <div class="spotlight-badge">Nouvelle activité !</div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
