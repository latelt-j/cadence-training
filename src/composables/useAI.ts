import { ref } from 'vue'
import type { ScheduledSession, AthleteProfile, ImportedPhase } from '../types/session'
import { generateAnalysisText } from '../utils/coach'

// Response types
export interface WeeklyPlanResponse {
  guidelines?: string
  phase?: ImportedPhase
  sessions: ScheduledSession[]
}

export interface TitleSuggestion {
  title: string
  description: string
}

export interface SessionModification {
  title?: string
  description?: string
  duration_min?: number
  intensity?: number
  zwift_workout?: string
}

export function useAI() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // All calls go through the secure Edge Function
  const chat = async (prompt: string, jsonMode = false): Promise<string> => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Configuration Supabase manquante')
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/gemini-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        prompt,
        jsonMode,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Erreur Edge Function: ${response.status}`)
    }

    const data = await response.json()
    return data.content || ''
  }

  // Generate weekly training plan
  const generateWeeklyPlan = async (prompt: string): Promise<WeeklyPlanResponse> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await chat(prompt, true)

      // Parse JSON response
      let cleanText = response.trim()

      // Remove markdown code blocks if present
      cleanText = cleanText.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '')

      // Handle duplicated JSON objects (Gemini sometimes returns the same response twice)
      const duplicateIndex = cleanText.search(/\}\s*\{/)
      if (duplicateIndex !== -1 && cleanText.startsWith('{')) {
        cleanText = cleanText.substring(0, duplicateIndex + 1)
      } else {
        // Try to extract JSON object or array from the text
        const jsonMatch = cleanText.match(/(\{[\s\S]*\}|\[[\s\S]*\])/)
        if (jsonMatch && jsonMatch[1]) {
          cleanText = jsonMatch[1]
        }
      }

      // Handle multiple arrays concatenated
      cleanText = cleanText.replace(/\]\s*\[/g, ',')

      const data = JSON.parse(cleanText)

      // New format with phase and guidelines: { guidelines: "...", phase: {...}, sessions: [...] }
      if (data && typeof data === 'object' && !Array.isArray(data) && data.sessions) {
        return {
          guidelines: data.guidelines,
          phase: data.phase,
          sessions: Array.isArray(data.sessions) ? data.sessions : [data.sessions],
        }
      }

      // Old format: array of sessions or single session
      const sessions = Array.isArray(data) ? data : [data]
      return { sessions }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erreur lors de la génération du planning'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  // Analyze a training session
  const analyzeSession = async (
    session: ScheduledSession,
    comment?: string,
    athleteProfile?: AthleteProfile
  ): Promise<string> => {
    isLoading.value = true
    error.value = null

    try {
      const prompt = generateAnalysisText(session, comment, athleteProfile)
      const response = await chat(prompt, false)
      return response
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erreur lors de l\'analyse'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  // Generate weekly guidelines/directives
  const generateGuidelines = async (prompt: string): Promise<string> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await chat(prompt, false)
      return response
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erreur lors de la génération des directives'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  // Modify a session based on instructions
  const modifySession = async (
    session: ScheduledSession,
    weekContext: string,
    instruction: string
  ): Promise<SessionModification> => {
    isLoading.value = true
    error.value = null

    try {
      const prompt = `# Modification de séance

## Séance actuelle
- Sport: ${session.sport}
- Titre: ${session.title}
- Date: ${session.date}
- Durée: ${session.duration_min} min
- Intensité: ${session.intensity ?? 'non définie'}
- Description: ${session.description || 'Aucune'}
${session.zwift_workout ? `- Zwift workout: présent` : ''}

## Contexte semaine
${weekContext}

## Instruction
${instruction}

---

Modifie la séance selon l'instruction. Réponds UNIQUEMENT avec le JSON des champs à modifier :
{
  "title": "nouveau titre si modifié",
  "description": "nouvelle description si modifiée",
  "duration_min": nombre si modifié,
  "intensity": 1-10 si modifié,
  "zwift_workout": "XML complet si séance Zwift modifiée"
}

N'inclus que les champs qui changent.`

      const response = await chat(prompt, true)
      const data = JSON.parse(response)
      return data as SessionModification
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erreur lors de la modification'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  // Suggest title and description for Strava
  const suggestTitle = async (session: ScheduledSession): Promise<TitleSuggestion[]> => {
    isLoading.value = true
    error.value = null

    try {
      const sportName =
        session.sport === 'cycling' ? 'Vélo'
          : session.sport === 'mtb' ? 'VTT'
            : session.sport === 'running' ? 'Course à pied'
              : 'Renforcement'

      let prompt = `## Séance à titrer pour Strava

**Sport:** ${sportName}
**Titre actuel:** ${session.title}
**Durée:** ${session.duration_min} min`

      if (session.actual_km) {
        prompt += `\n**Distance:** ${session.actual_km} km`
      }

      if (session.actual_elevation) {
        prompt += `\n**Dénivelé:** ${session.actual_elevation} m D+`
      }

      if (session.description) {
        prompt += `\n**Description:** ${session.description}`
      }

      prompt += `

---

🎭 Propose 3 variantes de titre + description pour Strava (drôle, créatif, avec autodérision).

Réponds en JSON :
{
  "suggestions": [
    { "title": "Titre sobre mais malin", "description": "Description courte" },
    { "title": "Titre fun et décalé", "description": "Description avec 1-2 emojis" },
    { "title": "Titre full entertainment", "description": "Description assumée drôle" }
  ]
}`

      const response = await chat(prompt, true)
      const data = JSON.parse(response)
      return data.suggestions as TitleSuggestion[]
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erreur lors de la suggestion'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    error,
    chat,
    generateWeeklyPlan,
    analyzeSession,
    generateGuidelines,
    modifySession,
    suggestTitle,
  }
}
