<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useSessions } from './composables/useSessions'
import { useStrava } from './composables/useStrava'
import { useSupabase } from './composables/useSupabase'
import type { SessionTemplate, ScheduledSession, TrainingPhase, TrainingObjective, ImportedPhase, AthleteProfile } from './types/session'
import FileImport from './components/FileImport.vue'
import WeekCalendar from './components/WeekCalendar.vue'
import SessionDetailModal from './components/SessionDetailModal.vue'
import WeeklyStats from './components/WeeklyStats.vue'
import VolumeChart from './components/VolumeChart.vue'
import WellnessWidget from './components/WellnessWidget.vue'
import ObjectiveSettings from './components/ObjectiveSettings.vue'
import AthleteProfileComponent from './components/AthleteProfile.vue'
import TrainingPhasesManager from './components/TrainingPhasesManager.vue'
import ShareWeekModal from './components/ShareWeekModal.vue'
import { copySessionForCoach } from './utils/coach'
import { marked } from 'marked'

const {
  sessions,
  init: initSessions,
  loadFromJson,
  addSession,
  updateSessionDate,
  updateSessionFeedback,
  updateSession,
  removeSession,
  reset,
  weeklyStats,
  setCurrentWeek,
  currentWeekDate,
} = useSessions()

// Import modal
const showImportModal = ref(false)
const fileImportRef = ref<InstanceType<typeof FileImport> | null>(null)

const closeImportModal = () => {
  showImportModal.value = false
  fileImportRef.value?.resetForm()
}

// Strava disconnect modal
const showStravaDisconnectModal = ref(false)

// Share week modal
const showShareModal = ref(false)

// Supabase (must be before watch that uses it)
const { fetchSettings, updateSettings, fetchWeeklyGuidelines, upsertWeeklyGuidelines } = useSupabase()

// Guidelines modal
const showGuidelinesModal = ref(false)
const weeklyGuidelines = ref('')
const guidelinesEditMode = ref(false)
const guidelinesPromptCopied = ref(false)

const renderedGuidelines = computed(() => {
  if (!weeklyGuidelines.value) return ''
  return marked(weeklyGuidelines.value) as string
})

const copyGuidelinesPrompt = async () => {
  const prompt = `Génère uniquement les GUIDELINES / DIRECTIVES pour ma semaine d'entraînement.

Je veux un texte markdown qui explique :
- L'objectif principal de la semaine
- La philosophie d'entraînement (pourquoi ces types de séances)
- La répartition des sports et des intensités
- Les points clés à retenir

Format attendu (markdown brut) :

## 🎯 Objectif de la semaine

[Explication de l'objectif principal]

### Philosophie

[Pourquoi ces séances, dans cet ordre, logique d'entraînement]

### Répartition

- [Sport 1] : X séances
- [Sport 2] : Y séances
- Repos : Z jours

### Points clés

- [Point important 1]
- [Point important 2]
- [Point important 3]

Réponds UNIQUEMENT avec le markdown, rien d'autre.`

  await navigator.clipboard.writeText(prompt)
  guidelinesPromptCopied.value = true
  setTimeout(() => {
    guidelinesPromptCopied.value = false
  }, 2000)
}

const saveGuidelines = async () => {
  guidelinesEditMode.value = false

  // Don't save empty guidelines
  if (!weeklyGuidelines.value.trim()) {
    showToast('Les directives ne peuvent pas être vides', 'error')
    return
  }

  console.log('Saving guidelines for week:', weekStartString.value)
  console.log('Guidelines content:', weeklyGuidelines.value.substring(0, 100) + '...')

  try {
    await upsertWeeklyGuidelines(weekStartString.value, weeklyGuidelines.value)
    console.log('Guidelines saved successfully')
    showToast('Directives sauvegardées')
  } catch (e) {
    console.error('Error saving guidelines:', e)
    showToast('Erreur de sauvegarde', 'error')
  }
}

// Compute week start from currentWeekDate
const getMonday = (d: Date): Date => {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  date.setDate(diff)
  date.setHours(0, 0, 0, 0)
  return date
}

const weekStart = computed(() => getMonday(currentWeekDate.value))

// Format week start as YYYY-MM-DD for database
const weekStartString = computed(() => {
  const d = weekStart.value
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})

// Load guidelines when week changes
const loadGuidelines = async (weekStart: string) => {
  console.log('Loading guidelines for week:', weekStart)
  try {
    const guidelines = await fetchWeeklyGuidelines(weekStart)
    console.log('Loaded guidelines:', guidelines ? 'found' : 'none')
    weeklyGuidelines.value = guidelines || ''
    guidelinesEditMode.value = false
  } catch (e) {
    console.error('Error loading weekly guidelines:', e)
    weeklyGuidelines.value = ''
  }
}

watch(weekStartString, (newWeekStart) => {
  loadGuidelines(newWeekStart)
})

// Get sessions for the week of the selected session (for AI modify context)
const selectedSessionWeekSessions = computed(() => {
  if (!selectedSession.value) return []
  const sessionDate = new Date(selectedSession.value.date)
  const monday = getMonday(sessionDate)
  const sunday = new Date(monday)
  sunday.setDate(sunday.getDate() + 6)

  const mondayStr = monday.toISOString().split('T')[0] ?? ''
  const sundayStr = sunday.toISOString().split('T')[0] ?? ''

  return sessions.value.filter(s => s.date >= mondayStr && s.date <= sundayStr)
})

const {
  isConnected: stravaConnected,
  isLoading: stravaLoading,
  authorize: stravaAuthorize,
  handleCallback: stravaHandleCallback,
  fetchActivities,
  fetchActivitiesWithMetrics,
  convertToSessions,
  resyncActivity,
  disconnect: stravaDisconnect,
} = useStrava()


// Training phases & objectives & athlete profile
const trainingPhases = ref<TrainingPhase[]>([])
const trainingObjectives = ref<TrainingObjective[]>([])
const showObjectivesModal = ref(false)
const showPhasesModal = ref(false)
const athleteProfile = ref<AthleteProfile>({})
const showAthleteProfileModal = ref(false)

// Track new sessions for animation
const newSessionIds = ref<Set<string>>(new Set())
const spotlightSession = ref<ScheduledSession | null>(null)
const toastMessage = ref<string | null>(null)
const toastType = ref<'success' | 'error'>('success')
const spotlightCardRef = ref<HTMLElement | null>(null)

// Fun messages for new sessions
const funMessages = [
  "C'est parti, on va en baver ! 💪",
  "Les jambes vont parler... 🔥",
  "Pas de repos pour les guerriers !",
  "La douleur est temporaire, la fierté est éternelle 🏆",
  "Allez, on envoie du lourd ! 🚀",
  "Mode bête activé 🦁",
  "Ça va piquer un peu... beaucoup 😅",
  "Les watts n'attendent pas !",
  "Prêt à tout donner ? 💥",
  "La sueur, c'est juste la graisse qui pleure 😂",
]

const pickRandomMessage = (): string => funMessages[Math.floor(Math.random() * funMessages.length)] ?? funMessages[0] ?? "C'est parti !"

// Spotlight comment modal
const showSpotlightComment = ref(false)
const spotlightComment = ref('')

// 3D mouse effect for spotlight card
const onSpotlightMouseMove = (e: MouseEvent) => {
  if (!spotlightCardRef.value) return
  const card = spotlightCardRef.value
  const rect = card.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const centerX = rect.width / 2
  const centerY = rect.height / 2
  const rotateX = (y - centerY) / 10
  const rotateY = (centerX - x) / 10
  card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
}

const onSpotlightMouseLeave = () => {
  if (!spotlightCardRef.value) return
  spotlightCardRef.value.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)'
}

// Show spotlight for new session
const showSpotlight = (session: ScheduledSession) => {
  spotlightSession.value = session
  newSessionIds.value = new Set([session.id])
}

const closeSpotlight = () => {
  // Afficher la modal de commentaire au lieu de copier directement
  showSpotlightComment.value = true
}

const confirmSpotlightCopy = async (withComment: boolean) => {
  if (spotlightSession.value) {
    const comment = withComment ? spotlightComment.value : undefined
    await copySessionForCoach(spotlightSession.value, comment, athleteProfile.value)
    showToast('Séance copiée ! Envoie-la à ton coach 🏋️')
  }

  // Reset tout
  showSpotlightComment.value = false
  spotlightComment.value = ''
  spotlightSession.value = null

  // Keep the calendar glow for a bit longer
  setTimeout(() => {
    newSessionIds.value = new Set()
  }, 3000)
}

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  toastMessage.value = message
  toastType.value = type
  setTimeout(() => {
    toastMessage.value = null
  }, 3000)
}


// Handle OAuth callbacks and init
onMounted(async () => {
  // Init sessions from Supabase
  await initSessions()

  // Load training phases & objectives & athlete profile from settings
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
    // Load athlete profile
    if (settings?.ftp || settings?.max_hr || settings?.resting_hr || settings?.environment) {
      athleteProfile.value = {
        ftp: settings.ftp ?? undefined,
        max_hr: settings.max_hr ?? undefined,
        resting_hr: settings.resting_hr ?? undefined,
        environment: settings.environment ?? undefined,
      }
    }
  } catch (e) {
    console.error('Error loading settings:', e)
  }

  // Load guidelines for current week
  await loadGuidelines(weekStartString.value)

  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get('code')
  const state = urlParams.get('state')

  if (code && state !== 'google') {
    const success = await stravaHandleCallback(code)
    // Auto-sync after successful Strava connection
    if (success) {
      await syncStrava()
    }
    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname)
  }

  // Global keyboard handler
  document.addEventListener('keydown', handleGlobalKeydown)
})

// Check if any modal is open
const isAnyModalOpen = () => {
  return showImportModal.value ||
    showStravaDisconnectModal.value ||
    showObjectivesModal.value ||
    showPhasesModal.value ||
    showAthleteProfileModal.value ||
    showGuidelinesModal.value ||
    showShareModal.value ||
    selectedSession.value !== null ||
    spotlightSession.value !== null
}

// Global keyboard handler
const handleGlobalKeydown = (e: KeyboardEvent) => {
  // Don't handle if user is typing in an input or textarea
  const target = e.target as HTMLElement
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
    return
  }

  if (e.key === 'Escape') {
    if (showImportModal.value) closeImportModal()
    else if (showStravaDisconnectModal.value) showStravaDisconnectModal.value = false
    else if (showObjectivesModal.value) showObjectivesModal.value = false
    else if (showPhasesModal.value) showPhasesModal.value = false
    else if (showAthleteProfileModal.value) showAthleteProfileModal.value = false
    else if (showGuidelinesModal.value) { showGuidelinesModal.value = false; guidelinesEditMode.value = false }
    else if (selectedSession.value) selectedSession.value = null
  }

  // Arrow keys for week navigation (only when no modal is open)
  if (!isAnyModalOpen() && weekCalendarRef.value) {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      weekCalendarRef.value.prevWeek()
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      weekCalendarRef.value.nextWeek()
    }
  }
}

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
})

// Strava sync - only fetch details for NEW activities
const syncStrava = async () => {
  // First, get basic activity list (1 API call)
  const basicActivities = await fetchActivities(30)

  // Filter to only new activities (not already in sessions) - use strava_id for dedup
  const existingStravaIds = new Set(
    sessions.value
      .filter(s => s.type === 'strava' && s.strava_id)
      .map(s => s.strava_id)
  )

  const newActivities = basicActivities.filter(activity => {
    return !existingStravaIds.has(activity.id)
  })

  // Only fetch detailed data for new activities (no unnecessary API calls)
  if (newActivities.length === 0) {
    alert('Aucune nouvelle activité')
    return
  }

  // Fetch detailed activities with cycling metrics (streams + calculations)
  const detailedActivities = await fetchActivitiesWithMetrics(30, newActivities, athleteProfile.value)
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
      // Conserver l'intensité prévue
      if (plannedSameSport.intensity) {
        sessionToAdd.intensity = plannedSameSport.intensity
      }
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

// Modal states
const selectedSession = ref<ScheduledSession | null>(null)
const sessionDetailModalRef = ref<{ onResyncComplete: () => void } | null>(null)
const weekCalendarRef = ref<{ goToDate: (date: Date | string) => void; prevWeek: () => void; nextWeek: () => void } | null>(null)

// Dark mode only
document.documentElement.setAttribute('data-theme', 'dracula')

// Handlers
const handleImport = async (data: (SessionTemplate | ScheduledSession)[], replaceExisting: boolean, _phase?: ImportedPhase, navigateToDate?: string, guidelines?: string) => {
  // Track session count before import to find new ones
  const existingIds = new Set(sessions.value.map(s => s.id))

  await loadFromJson(data, replaceExisting)

  // Find newly added sessions
  const newIds = sessions.value
    .filter(s => !existingIds.has(s.id))
    .map(s => s.id)

  if (newIds.length > 0) {
    // Animate new sessions
    newSessionIds.value = new Set(newIds)

    // Show fun message
    showToast(pickRandomMessage())

    // Clear animation after 5 seconds
    setTimeout(() => {
      newSessionIds.value = new Set()
    }, 5000)
  }

  // Store guidelines if provided
  if (guidelines && navigateToDate) {
    // Calculate the week start for the imported week
    const importDate = new Date(navigateToDate)
    const importWeekStart = getMonday(importDate)
    const importWeekStartStr = `${importWeekStart.getFullYear()}-${String(importWeekStart.getMonth() + 1).padStart(2, '0')}-${String(importWeekStart.getDate()).padStart(2, '0')}`

    // Also persist to database
    try {
      await upsertWeeklyGuidelines(importWeekStartStr, guidelines)
    } catch (e) {
      console.error('Error saving guidelines from import:', e)
    }

    // Update local state (will be refreshed when navigating)
    weeklyGuidelines.value = guidelines
  }

  // Navigate to the week of the imported sessions
  if (navigateToDate && weekCalendarRef.value) {
    weekCalendarRef.value.goToDate(navigateToDate)
  }

  // Note: phases are now managed manually via TrainingPhasesManager, not auto-created from import
  showImportModal.value = false
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

const handleSaveAthleteProfile = async (profile: AthleteProfile) => {
  athleteProfile.value = profile
  try {
    await updateSettings({
      ftp: profile.ftp ?? null,
      max_hr: profile.max_hr ?? null,
      resting_hr: profile.resting_hr ?? null,
      environment: profile.environment ?? null,
    } as any)
    showToast('Profil sauvegarde')
  } catch (e) {
    console.error('Error saving athlete profile:', e)
    showToast('Erreur de sauvegarde', 'error')
  }
}

const handleSavePhases = async (phases: TrainingPhase[]) => {
  trainingPhases.value = phases
  try {
    await updateSettings({ training_phases: phases } as any)
    showToast('Cycles sauvegardés')
  } catch (e) {
    console.error('Error saving phases:', e)
    showToast('Erreur de sauvegarde', 'error')
  }
}

const handleDeleteSession = async (sessionId: string) => {
  await removeSession(sessionId)
}

const handleUpdateFeedback = async (sessionId: string, feedback: string): Promise<boolean> => {
  const success = await updateSessionFeedback(sessionId, feedback)
  if (!success) {
    showToast('Erreur de sauvegarde, réessayez')
  }
  return success
}

const handleUpdateSession = async (sessionId: string, updates: { title: string; description: string }) => {
  await updateSession(sessionId, updates)
}

const handleResyncSession = async (sessionId: string, stravaId: number) => {
  const newData = await resyncActivity(stravaId, athleteProfile.value)

  if (newData) {
    // Merge new data with existing session (keep id, date, planned info, feedback)
    const existingSession = sessions.value.find(s => s.id === sessionId)
    if (existingSession) {
      await updateSession(sessionId, {
        ...newData,
        // Preserve these fields
        planned_title: existingSession.planned_title,
        planned_description: existingSession.planned_description,
        coach_feedback: existingSession.coach_feedback,
      } as any)

      // Update selectedSession to reflect changes
      selectedSession.value = sessions.value.find(s => s.id === sessionId) || null
      showToast('Metriques mises a jour')
    }
  } else {
    showToast('Erreur lors de la synchronisation', 'error')
  }

  sessionDetailModalRef.value?.onResyncComplete()
}

const handleReset = () => {
  if (confirm('Réinitialiser toutes les données ?')) {
    reset()
  }
}
</script>

<template>
  <div class="min-h-screen app-bg pb-20 md:pb-0">
    <!-- Header - Desktop -->
    <header class="sticky top-0 z-50 border-b border-base-300/50 bg-emerald-950/70 backdrop-blur-lg hidden md:block">
      <div class="container mx-auto max-w-6xl px-4">
        <div class="flex h-16 items-center justify-between">
          <!-- Logo -->
          <div class="flex items-center gap-3">
            <img src="/icon.svg" alt="Cadence" class="w-9 h-9 rounded-xl" />
            <span class="text-xl font-bold tracking-tight">Cadence</span>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2">
            <!-- Strava sync -->
            <button
              v-if="stravaConnected"
              class="btn btn-sm btn-ghost gap-2 hover:bg-emerald-500/20 hover:text-emerald-400"
              :disabled="stravaLoading"
              @click="syncStrava"
            >
              <span v-if="stravaLoading" class="loading loading-spinner loading-xs"></span>
              <span v-else class="w-2 h-2 rounded-full bg-[#fc4c02]"></span>
              Sync Strava
            </button>
            <button
              v-else
              class="btn btn-sm btn-ghost gap-2 hover:bg-emerald-500/20 hover:text-emerald-400"
              @click="stravaAuthorize"
            >
              <span class="w-2 h-2 rounded-full bg-base-content/30"></span>
              Strava
            </button>

            <!-- Divider -->
            <div class="w-px h-6 bg-base-300"></div>

            <!-- Navigation buttons -->
            <button class="btn btn-sm btn-ghost gap-1 hover:bg-emerald-500/20 hover:text-emerald-400" @click="showObjectivesModal = true">
              🎯 Objectifs
            </button>
            <button class="btn btn-sm btn-ghost gap-1 hover:bg-emerald-500/20 hover:text-emerald-400" @click="showPhasesModal = true">
              📊 Cycles
            </button>
            <button class="btn btn-sm btn-ghost gap-1 hover:bg-emerald-500/20 hover:text-emerald-400" @click="showAthleteProfileModal = true">
              ⚡ Profil
            </button>

            <!-- Divider -->
            <div class="w-px h-6 bg-base-300"></div>

            <!-- Settings Menu -->
            <div class="dropdown dropdown-end">
              <button tabindex="0" class="btn btn-sm btn-ghost btn-square hover:bg-emerald-500/20 hover:text-emerald-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-xl z-50 w-52 p-2 shadow-xl mt-2 border border-base-300">
                <li v-if="stravaConnected"><a class="text-error rounded-lg" @click="showStravaDisconnectModal = true">Déconnecter Strava</a></li>
                <li class="border-t border-base-300 mt-1 pt-1">
                  <a class="text-error rounded-lg" @click="handleReset">🗑️ Réinitialiser</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Header - Mobile -->
    <header class="sticky top-0 z-50 border-b border-base-300/50 bg-emerald-950/70 backdrop-blur-lg md:hidden">
      <div class="flex h-14 items-center justify-between px-4">
        <div class="flex items-center gap-2">
          <img src="/icon.svg" alt="Cadence" class="w-8 h-8 rounded-xl" />
          <span class="text-lg font-bold tracking-tight">Cadence</span>
        </div>
      </div>
    </header>

    <!-- Bottom Navigation - Mobile -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-300 z-50 safe-area-bottom">
      <div class="flex justify-around py-2">
        <!-- Strava Sync -->
        <button
          class="flex flex-col items-center gap-0.5 px-3 py-1"
          :disabled="stravaLoading"
          @click="stravaConnected ? syncStrava() : stravaAuthorize()"
        >
          <span v-if="stravaLoading" class="loading loading-spinner loading-sm"></span>
          <span v-else class="text-xl" :class="stravaConnected ? 'text-[#fc4c02]' : ''">🔄</span>
          <span class="text-[10px] text-base-content/70">Strava</span>
        </button>

        <!-- Objectives -->
        <button
          class="flex flex-col items-center gap-0.5 px-3 py-1"
          @click="showObjectivesModal = true"
        >
          <span class="text-xl">🎯</span>
          <span class="text-[10px] text-base-content/70">Objectifs</span>
        </button>

        <!-- Profile -->
        <button
          class="flex flex-col items-center gap-0.5 px-3 py-1"
          @click="showAthleteProfileModal = true"
        >
          <span class="text-xl">⚡</span>
          <span class="text-[10px] text-base-content/70">Profil</span>
        </button>

        <!-- More menu -->
        <div class="dropdown dropdown-top dropdown-end">
          <button tabindex="0" class="flex flex-col items-center gap-0.5 px-3 py-1">
            <span class="text-xl">⋯</span>
            <span class="text-[10px] text-base-content/70">Plus</span>
          </button>
          <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-50 w-52 p-2 shadow-xl mb-2 border border-base-300">
            <li><a @click="showPhasesModal = true" class="rounded-lg">📊 Cycles</a></li>
            <li v-if="stravaConnected"><a class="text-error rounded-lg" @click="showStravaDisconnectModal = true">Déconnecter Strava</a></li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="container mx-auto p-4 max-w-6xl">
      <div class="space-y-6">
        <WeekCalendar
          ref="weekCalendarRef"
          :sessions="sessions"
          :new-session-ids="newSessionIds"
          :training-phases="trainingPhases"
          @update-date="handleUpdateDate"
          @select-session="handleSelectSession"
          @week-change="setCurrentWeek"
          @open-share-modal="showShareModal = true"
          @open-import-modal="showImportModal = true"
          @open-guidelines-modal="showGuidelinesModal = true"
        />

        <WeeklyStats :stats="weeklyStats" />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <VolumeChart :sessions="sessions" />
          <WellnessWidget />
        </div>
      </div>
    </div>

    <!-- Modals -->
    <SessionDetailModal
      ref="sessionDetailModalRef"
      :session="selectedSession"
      :athlete-profile="athleteProfile"
      :week-sessions="selectedSessionWeekSessions"
      @close="selectedSession = null"
      @delete="handleDeleteSession"
      @update-feedback="handleUpdateFeedback"
      @update="handleUpdateSession"
      @resync="handleResyncSession"
      @toast="showToast"
    />

    <!-- Import Modal -->
    <dialog class="modal" :class="{ 'modal-open': showImportModal }">
      <div class="modal-box w-full h-full max-h-full md:max-w-2xl md:h-auto md:max-h-[90vh] rounded-none md:rounded-2xl">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-lg">📥 Importer des séances</h3>
          <button class="btn btn-sm btn-circle btn-ghost" @click="closeImportModal">✕</button>
        </div>
        <FileImport
          ref="fileImportRef"
          :sessions="sessions"
          :training-phases="trainingPhases"
          :training-objectives="trainingObjectives"
          :athlete-profile="athleteProfile"
          @import="handleImport"
        />
        <div v-if="fileImportRef?.step !== 'paste'" class="modal-action">
          <button class="btn btn-ghost" @click="closeImportModal">Fermer</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop" @click="closeImportModal">
        <button>close</button>
      </form>
    </dialog>

    <!-- Strava Disconnect Modal -->
    <dialog class="modal" :class="{ 'modal-open': showStravaDisconnectModal }">
      <div class="modal-box w-full h-full max-h-full md:max-w-sm md:h-auto md:max-h-[90vh] rounded-none md:rounded-2xl">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-lg">Déconnecter Strava ?</h3>
          <button class="btn btn-sm btn-circle btn-ghost" @click="showStravaDisconnectModal = false">✕</button>
        </div>
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

    <!-- Objectives Modal -->
    <dialog class="modal" :class="{ 'modal-open': showObjectivesModal }">
      <div class="modal-box w-full h-full max-h-full md:max-w-lg md:h-auto md:max-h-[90vh] rounded-none md:rounded-2xl">
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

    <!-- Athlete Profile Modal -->
    <dialog class="modal" :class="{ 'modal-open': showAthleteProfileModal }">
      <div class="modal-box w-full h-full max-h-full md:max-w-md md:h-auto md:max-h-[90vh] rounded-none md:rounded-2xl">
        <AthleteProfileComponent
          :profile="athleteProfile"
          @save="handleSaveAthleteProfile"
          @close="showAthleteProfileModal = false"
        />
      </div>
      <form method="dialog" class="modal-backdrop" @click="showAthleteProfileModal = false">
        <button>close</button>
      </form>
    </dialog>

    <!-- Training Phases Modal -->
    <dialog class="modal" :class="{ 'modal-open': showPhasesModal }">
      <div class="modal-box w-full h-full max-h-full md:max-w-2xl md:h-auto md:max-h-[90vh] rounded-none md:rounded-2xl">
        <TrainingPhasesManager
          :phases="trainingPhases"
          :objectives="trainingObjectives"
          :athlete-profile="athleteProfile"
          @save="handleSavePhases"
          @close="showPhasesModal = false"
        />
      </div>
      <form method="dialog" class="modal-backdrop" @click="showPhasesModal = false">
        <button>close</button>
      </form>
    </dialog>

    <!-- Share Week Modal -->
    <ShareWeekModal
      :is-open="showShareModal"
      :sessions="sessions"
      :week-start="weekStart"
      :training-phases="trainingPhases"
      @close="showShareModal = false"
    />

    <!-- Guidelines Modal -->
    <dialog :class="['modal', { 'modal-open': showGuidelinesModal }]">
      <div class="modal-box w-full h-full max-h-full md:max-w-3xl md:h-auto md:max-h-[85vh] rounded-none md:rounded-2xl overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-lg flex items-center gap-2">
            📖 Directives de la semaine
            <button
              v-if="weeklyGuidelines && !guidelinesEditMode"
              class="btn btn-xs btn-ghost"
              @click="guidelinesEditMode = true"
            >
              ✏️ Modifier
            </button>
          </h3>
          <button class="btn btn-sm btn-circle btn-ghost" @click="showGuidelinesModal = false; guidelinesEditMode = false">✕</button>
        </div>

        <!-- Empty state -->
        <div v-if="!weeklyGuidelines && !guidelinesEditMode" class="text-center py-8">
          <div class="text-4xl mb-4">📋</div>
          <p class="text-base-content/70 mb-4">Pas encore de directives pour cette semaine</p>
          <div class="flex gap-2 justify-center">
            <button
              class="btn btn-sm"
              :class="guidelinesPromptCopied ? 'btn-success' : 'btn-primary'"
              @click="copyGuidelinesPrompt"
            >
              {{ guidelinesPromptCopied ? '✓ Copié !' : '🤖 Copier le prompt' }}
            </button>
            <button
              class="btn btn-sm btn-ghost"
              @click="guidelinesEditMode = true"
            >
              ✏️ Écrire manuellement
            </button>
          </div>
        </div>

        <!-- Edit mode -->
        <div v-else-if="guidelinesEditMode" class="space-y-4">
          <textarea
            v-model="weeklyGuidelines"
            class="textarea textarea-bordered w-full h-64 font-mono text-sm"
            placeholder="## 🎯 Objectif de la semaine&#10;&#10;Cette semaine...&#10;&#10;### Philosophie&#10;&#10;...&#10;&#10;### Répartition&#10;&#10;- ...&#10;&#10;### Points clés&#10;&#10;- ..."
          ></textarea>
          <div class="flex justify-end gap-2">
            <button class="btn btn-sm btn-ghost" @click="guidelinesEditMode = false">
              Annuler
            </button>
            <button class="btn btn-sm btn-primary" @click="saveGuidelines">
              💾 Sauvegarder
            </button>
          </div>
        </div>

        <!-- Display mode -->
        <div v-else class="feedback-markdown" v-html="renderedGuidelines"></div>

        <div class="modal-action">
          <button
            v-if="weeklyGuidelines && !guidelinesEditMode"
            class="btn btn-sm btn-ghost"
            :class="guidelinesPromptCopied ? 'text-success' : ''"
            @click="copyGuidelinesPrompt"
          >
            {{ guidelinesPromptCopied ? '✓ Copié !' : '🤖 Regénérer (copier prompt)' }}
          </button>
          <button class="btn" @click="showGuidelinesModal = false; guidelinesEditMode = false">
            Fermer
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="showGuidelinesModal = false; guidelinesEditMode = false">close</button>
      </form>
    </dialog>

    <!-- New Activity Spotlight -->
    <Teleport to="body">
      <Transition name="spotlight">
        <div
          v-if="spotlightSession"
          class="spotlight-overlay"
          @click="!showSpotlightComment && closeSpotlight()"
        >
          <!-- Session Card (avant le clic) -->
          <div
            v-if="!showSpotlightComment"
            ref="spotlightCardRef"
            class="spotlight-card"
            @click.stop="closeSpotlight"
            @mousemove="onSpotlightMouseMove"
            @mouseleave="onSpotlightMouseLeave"
          >
            <div class="spotlight-bg"></div>
            <div class="spotlight-content">
              <div class="spotlight-emoji">
                {{ spotlightSession.sport === 'cycling' ? '🚴' : spotlightSession.sport === 'running' ? '🏃' : '💪' }}
              </div>
              <h2 class="spotlight-title">{{ spotlightSession.title }}</h2>
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

          <!-- Comment Modal (après le clic) - Style épique 🎉 -->
          <div
            v-else
            class="spotlight-card"
            @click.stop
          >
            <div class="spotlight-bg"></div>
            <div class="spotlight-content text-center">
              <div class="text-6xl mb-4">🎉</div>
              <h2 class="text-2xl font-bold mb-2">Bien joué !</h2>
              <p class="text-base-content/70 mb-4">Un commentaire pour ton coach ?</p>
              <textarea
                v-model="spotlightComment"
                class="textarea textarea-bordered w-full h-20 mb-4 bg-base-100/50"
                placeholder="Super sensations, jambes en feu, objectif atteint..."
              ></textarea>
              <div class="flex gap-3 justify-center">
                <button class="btn btn-ghost" @click="confirmSpotlightCopy(false)">Passer</button>
                <button
                  class="btn bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-lg shadow-emerald-500/30"
                  @click="confirmSpotlightCopy(true)"
                >
                  📋 Copier pour le coach
                </button>
              </div>
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
          class="fixed bottom-6 right-6 z-[10000] px-4 py-3 rounded-xl shadow-lg flex items-center gap-2"
          :class="toastType === 'success' ? 'bg-success text-success-content' : 'bg-error text-error-content'"
        >
          <span class="text-lg">{{ toastType === 'success' ? '✓' : '✕' }}</span>
          <span>{{ toastMessage }}</span>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
