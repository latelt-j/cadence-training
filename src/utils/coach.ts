import type { ScheduledSession, AthleteProfile } from '../types/session'

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
    const paceMinPerKm = 60 / kmh
    const paceMin = Math.floor(paceMinPerKm)
    const paceSec = Math.round((paceMinPerKm - paceMin) * 60)
    return `${paceMin}'${paceSec.toString().padStart(2, '0')}"/km`
  }
  return `${kmh.toFixed(1)} km/h`
}

export const generateAnalysisText = (
  s: ScheduledSession,
  comment?: string,
  athleteProfile?: AthleteProfile
): string => {
  const sportName =
    s.sport === 'cycling' ? 'Vélo' : s.sport === 'mtb' ? 'VTT' : s.sport === 'running' ? 'Course à pied' : 'Renforcement'

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

  // Enhanced power section with cycling metrics
  if (s.average_watts || s.max_watts || s.normalized_power) {
    text += `\n\n**Puissance:**`
    if (s.average_watts) text += `\n- Moyenne: ${Math.round(s.average_watts)} W`
    if (s.normalized_power) text += `\n- Puissance Normalisée (NP): ${Math.round(s.normalized_power)} W`
    if (s.max_watts) text += `\n- Max: ${Math.round(s.max_watts)} W`
    if (s.device_watts !== undefined) {
      text += `\n- Source: ${s.device_watts ? 'Capteur de puissance' : 'Estimation'}`
    }
  }

  // Cycling/MTB advanced metrics
  if (
    (s.sport === 'cycling' || s.sport === 'mtb') &&
    (s.intensity_factor || s.variability_index || s.aerobic_decoupling !== undefined || s.average_vam)
  ) {
    text += `\n\n**Métriques avancées:**`
    if (s.intensity_factor) {
      text += `\n- Intensity Factor (IF): ${s.intensity_factor.toFixed(2)}`
      if (athleteProfile?.ftp) {
        text += ` (basé sur FTP ${athleteProfile.ftp}W)`
      }
    }
    if (s.variability_index) {
      const viComment = s.variability_index > 1.05 ? ' (effort variable)' : ' (effort régulier)'
      text += `\n- Variability Index (VI): ${s.variability_index.toFixed(2)}${viComment}`
    }
    if (s.aerobic_decoupling !== undefined) {
      const decouplingComment =
        s.aerobic_decoupling > 5 ? ' (dérive cardiaque élevée)' : ' (bonne endurance aérobie)'
      text += `\n- Découplage aérobie: ${s.aerobic_decoupling.toFixed(1)}%${decouplingComment}`
    }
    if (s.average_vam) {
      text += `\n- VAM moyen: ${s.average_vam} m/h`
    }
  }

  // Effort/Energy metrics
  if (s.suffer_score || s.kilojoules || s.calories) {
    text += `\n\n**Effort/Énergie:**`
    if (s.suffer_score) text += `\n- Effort relatif (Strava): ${s.suffer_score}`
    if (s.kilojoules) text += `\n- Travail: ${Math.round(s.kilojoules)} kJ`
    if (s.calories) text += `\n- Calories: ${s.calories} kcal`
  }

  if (s.average_cadence) {
    text += `\n**Cadence moyenne:** ${Math.round(s.average_cadence)} ${s.sport === 'running' ? 'ppm' : 'rpm'}`
  }

  if (s.description) {
    text += `\n\n**Description:**\n${s.description}`
  }

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

  // Athlete profile context (if available)
  if (athleteProfile && (athleteProfile.ftp || athleteProfile.max_hr || athleteProfile.resting_hr)) {
    text += `\n\n**Profil athlète:**`
    if (athleteProfile.ftp) text += `\n- FTP: ${athleteProfile.ftp} W`
    if (athleteProfile.max_hr) text += `\n- FC Max: ${athleteProfile.max_hr} bpm`
    if (athleteProfile.resting_hr) text += `\n- FC Repos: ${athleteProfile.resting_hr} bpm`
  }

  // Ajouter le commentaire de l'utilisateur s'il existe
  if (comment?.trim()) {
    text += `\n\n**💬 Ressenti :** ${comment.trim()}`
  }

  text += `\n\n---
**Format de réponse demandé :**

**PARTIE 1 - Bilan (Markdown brut, commence par ## sans rien avant) :**

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

---

**PARTIE 2 - Suggestions pour Strava (texte simple, PAS de markdown) :**

🎭 IMPORTANT : Sois DRÔLE et CRÉATIF ! Je partage sur Strava avec beaucoup de followers.
Les titres/descriptions doivent faire sourire : autodérision, jeux de mots, références pop culture, humour sur la souffrance...

Propose 3 variantes de titre + description :

1. **Sobre mais malin** (sans emoji, humour subtil)
Titre:
Description:

2. **Fun et décalé** (1-2 emojis, ton léger)
Titre:
Description:

3. **Full entertainment** (plusieurs emojis, assumé drôle)
Titre:
Description:`

  return text
}

export const copySessionForCoach = async (
  session: ScheduledSession,
  comment?: string,
  athleteProfile?: AthleteProfile
): Promise<void> => {
  const text = generateAnalysisText(session, comment, athleteProfile)
  await navigator.clipboard.writeText(text)
}

export const generateTitleSuggestionPrompt = (s: ScheduledSession): string => {
  // Réutilise le texte d'analyse mais avec une instruction différente
  const baseText = generateAnalysisText(s)
  // Remplace l'instruction finale
  const withoutInstruction = baseText.split('\n\n---')[0]

  return withoutInstruction + `\n\n---
**Propose-moi un titre et une description pour cette séance.**

Format :
**Titre:** [court, ex: "Intervalles 5x1km" ou "Sortie longue Z2"]
**Description:** [2-3 lignes décrivant le type de séance et l'intensité]`
}
