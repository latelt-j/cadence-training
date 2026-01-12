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
import { useAI } from './composables/useAI'

const { isLoading: aiLoading, generateGuidelines: generateGuidelinesAI } = useAI()

const {
  sessions,
  init: initSessions,
  loadFromJson,
  addSession,
  updateSessionDate,
  updateSessionFeedback,
  updateSession,
  removeSession,
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

// Share week modal
const showShareModal = ref(false)

// Supabase (must be before watch that uses it)
const { fetchSettings, updateSettings, fetchWeeklyGuidelines, upsertWeeklyGuidelines, setCurrentUser } = useSupabase()

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

// Guidelines modal
const showGuidelinesModal = ref(false)
const weeklyGuidelines = ref('')
const guidelinesEditMode = ref(false)
const guidelinesPromptCopied = ref(false)

const renderedGuidelines = computed(() => {
  if (!weeklyGuidelines.value) return ''
  return marked(weeklyGuidelines.value) as string
})

const getGuidelinesPrompt = () => {
  // Get sessions for current week
  const weekSessions = sessions.value.filter(s => {
    const sessionDate = new Date(s.date)
    const monday = weekStart.value
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    return sessionDate >= monday && sessionDate <= sunday
  })

  let prompt = `Génère uniquement les GUIDELINES / DIRECTIVES pour ma semaine d'entraînement.

`

  if (weekSessions.length > 0) {
    prompt += `Séances de la semaine :
`
    weekSessions.forEach(s => {
      const sportEmoji = s.sport === 'cycling' ? '🚴' : s.sport === 'mtb' ? '🚵' : s.sport === 'running' ? '🏃' : '💪'
      prompt += `- ${s.date} : ${s.title} ${sportEmoji} (${s.duration_min}min)
`
    })
    prompt += `
`
  }

  prompt += `Je veux un texte markdown qui explique :
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

  return prompt
}

const copyGuidelinesPrompt = async () => {
  await navigator.clipboard.writeText(getGuidelinesPrompt())
  guidelinesPromptCopied.value = true
  setTimeout(() => {
    guidelinesPromptCopied.value = false
  }, 2000)
}

const generateGuidelinesWithAI = async () => {
  try {
    const prompt = getGuidelinesPrompt()
    const result = await generateGuidelinesAI(prompt)
    weeklyGuidelines.value = result
    guidelinesEditMode.value = false
    // Auto-save
    await upsertWeeklyGuidelines(weekStartString.value, result)
    showToast('Directives générées et sauvegardées')
  } catch (e) {
    showToast('Erreur lors de la génération', 'error')
  }
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

// Modal states (must be before computed that uses selectedSession)
const selectedSession = ref<ScheduledSession | null>(null)
const sessionDetailModalRef = ref<{ onResyncComplete: () => void } | null>(null)
const weekCalendarRef = ref<{ goToDate: (date: Date | string) => void; prevWeek: () => void; nextWeek: () => void } | null>(null)

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
  isAuthenticated,
  isLoading: stravaLoading,
  athlete,
  athleteId,
  authorize: stravaAuthorize,
  handleCallback: stravaHandleCallback,
  fetchActivities,
  fetchActivitiesWithMetrics,
  convertToSessions,
  resyncActivity,
  logout: stravaLogout,
} = useStrava()

// Check if we're still loading auth state
const isCheckingAuth = ref(true)


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


// Migrate orphan data to user on first login
const migrateOrphanData = async (userId: number) => {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/migrate-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
    })
    const result = await response.json()
    if (result.migrated) {
      console.log('Data migrated:', result.message)
    }
  } catch (e) {
    console.error('Error migrating data:', e)
  }
}

// Initialize app data when authenticated
const initAppData = async () => {
  // Set the current user for Supabase RLS
  setCurrentUser(athleteId.value)

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
}

// Handle OAuth callbacks and init
onMounted(async () => {
  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get('code')
  const state = urlParams.get('state')

  // Handle Strava OAuth callback
  if (code && state !== 'google') {
    const success = await stravaHandleCallback(code)
    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname)

    if (success && athleteId.value) {
      // Migrate orphan data to this user
      await migrateOrphanData(athleteId.value)
      // Auto-sync after successful Strava connection
      await initAppData()
      await syncStrava()
    }
  }

  // Done checking auth
  isCheckingAuth.value = false

  // Initialize data if already authenticated
  if (isAuthenticated.value) {
    await initAppData()
  }

  // Global keyboard handler
  document.addEventListener('keydown', handleGlobalKeydown)
})

// Check if any modal is open
const isAnyModalOpen = () => {
  return showImportModal.value ||
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
  const target = e.target as HTMLElement
  const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable

  // Escape always works to close modals
  if (e.key === 'Escape') {
    if (showImportModal.value) closeImportModal()
    else if (showObjectivesModal.value) showObjectivesModal.value = false
    else if (showPhasesModal.value) showPhasesModal.value = false
    else if (showAthleteProfileModal.value) showAthleteProfileModal.value = false
    else if (showGuidelinesModal.value) { showGuidelinesModal.value = false; guidelinesEditMode.value = false }
    else if (showShareModal.value) showShareModal.value = false
    else if (selectedSession.value) selectedSession.value = null
    return
  }

  // Don't handle other keys if user is typing
  if (isTyping) return

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

const handleLogout = () => {
  stravaLogout()
  setCurrentUser(null)
  // Reset local state
  sessions.value = []
  trainingPhases.value = []
  trainingObjectives.value = []
  athleteProfile.value = {}
  weeklyGuidelines.value = ''
}
</script>

<template>
  <!-- Loading State -->
  <div v-if="isCheckingAuth" class="min-h-screen app-bg flex items-center justify-center">
    <span class="loading loading-spinner loading-lg text-emerald-400"></span>
  </div>

  <!-- Login Screen -->
  <div v-else-if="!isAuthenticated" class="min-h-screen app-bg flex flex-col items-center justify-center p-4">
    <img src="/icon.svg" alt="Cadence" class="w-24 h-24 rounded-2xl mb-6 shadow-lg" />
    <h1 class="text-4xl font-bold mb-2">Cadence</h1>
    <p class="text-base-content/70 mb-8 text-center">Planifie et suis ton entraînement</p>
    <button
      class="btn btn-lg gap-3 bg-[#fc4c02] hover:bg-[#e04402] border-0 text-white shadow-lg"
      @click="stravaAuthorize"
    >
      <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"/>
      </svg>
      Connexion avec Strava
    </button>
  </div>

  <!-- Authenticated App -->
  <div v-else class="min-h-screen app-bg pb-20 md:pb-0">
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

            <!-- User Menu -->
            <div class="dropdown dropdown-end">
              <button tabindex="0" class="btn btn-sm btn-ghost gap-2 hover:bg-emerald-500/20">
                <img
                  v-if="athlete?.profile"
                  :src="athlete.profile"
                  :alt="athlete.firstname"
                  class="w-6 h-6 rounded-full"
                />
                <span class="hidden lg:inline">{{ athlete?.firstname }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-xl z-50 w-52 p-2 shadow-xl mt-2 border border-base-300">
                <li>
                  <a class="text-error rounded-lg" @click="handleLogout">Déconnexion</a>
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
        <!-- User avatar -->
        <div class="dropdown dropdown-end">
          <button tabindex="0" class="btn btn-sm btn-ghost btn-circle">
            <img
              v-if="athlete?.profile"
              :src="athlete.profile"
              :alt="athlete.firstname"
              class="w-8 h-8 rounded-full"
            />
          </button>
          <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-xl z-50 w-52 p-2 shadow-xl mt-2 border border-base-300">
            <li><span class="font-medium px-4 py-2">{{ athlete?.firstname }} {{ athlete?.lastname }}</span></li>
            <li class="border-t border-base-300 mt-1 pt-1">
              <a class="text-error rounded-lg" @click="handleLogout">Déconnexion</a>
            </li>
          </ul>
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
      <div class="modal-box w-full h-full max-h-full md:max-w-3xl md:h-auto md:max-h-[85vh] rounded-none md:rounded-2xl flex flex-col overflow-hidden">
        <!-- Header (fixed) -->
        <div class="flex items-center justify-between pb-4 border-b border-base-300 flex-shrink-0">
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

        <!-- Content (scrollable) -->
        <div class="flex-1 overflow-y-auto py-4">
          <!-- Empty state -->
          <div v-if="!weeklyGuidelines && !guidelinesEditMode" class="text-center py-8">
            <div class="text-4xl mb-4">📋</div>
            <p class="text-base-content/70 mb-4">Pas encore de directives pour cette semaine</p>
            <div class="flex flex-col gap-2 items-center">
              <button
                class="btn btn-sm btn-primary"
                :disabled="aiLoading"
                @click="generateGuidelinesWithAI"
              >
                <span v-if="aiLoading" class="loading loading-spinner loading-xs"></span>
                {{ aiLoading ? 'Generation...' : '🤖 Generer avec Gemini' }}
              </button>
              <div class="flex gap-2">
                <button
                  class="btn btn-xs btn-ghost"
                  :class="guidelinesPromptCopied ? 'btn-success' : ''"
                  @click="copyGuidelinesPrompt"
                >
                  {{ guidelinesPromptCopied ? '✓ Copie !' : '📋 Copier prompt' }}
                </button>
                <button
                  class="btn btn-xs btn-ghost"
                  @click="guidelinesEditMode = true"
                >
                  ✏️ Ecrire manuellement
                </button>
              </div>
            </div>
          </div>

          <!-- Edit mode -->
          <div v-else-if="guidelinesEditMode" class="space-y-4">
            <textarea
              v-model="weeklyGuidelines"
              class="textarea textarea-bordered w-full h-64 font-mono text-sm"
              placeholder="## 🎯 Objectif de la semaine&#10;&#10;Cette semaine...&#10;&#10;### Philosophie&#10;&#10;...&#10;&#10;### Répartition&#10;&#10;- ...&#10;&#10;### Points clés&#10;&#10;- ..."
            ></textarea>
          </div>

          <!-- Display mode -->
          <div v-else class="feedback-markdown" v-html="renderedGuidelines"></div>
        </div>

        <!-- Footer (fixed) -->
        <div class="flex justify-end gap-2 pt-4 border-t border-base-300 flex-shrink-0">
          <button
            v-if="guidelinesEditMode"
            class="btn btn-sm btn-ghost"
            @click="guidelinesEditMode = false"
          >
            Annuler
          </button>
          <button
            v-if="guidelinesEditMode"
            class="btn btn-sm btn-primary"
            @click="saveGuidelines"
          >
            💾 Sauvegarder
          </button>
          <button
            v-if="weeklyGuidelines && !guidelinesEditMode"
            class="btn btn-sm btn-ghost"
            :disabled="aiLoading"
            @click="generateGuidelinesWithAI"
          >
            <span v-if="aiLoading" class="loading loading-spinner loading-xs"></span>
            {{ aiLoading ? 'Generation...' : '🤖 Regenerer' }}
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
