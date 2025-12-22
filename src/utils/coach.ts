import type { ScheduledSession } from '../types/session'

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

export const generateAnalysisText = (s: ScheduledSession): string => {
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

  text += `\n\n---
**Format de réponse demandé (pour copier dans mon suivi) :**
Réponds avec ce format concis en 4-5 lignes max :

⚡ **Charge:** [Légère/Modérée/Intense] - [commentaire bref]
✅ **Points positifs:** [1-2 points]
⚠️ **À améliorer:** [1-2 points]
💡 **Conseil:** [1 conseil actionnable pour la prochaine séance]`

  return text
}

export const copySessionForCoach = async (session: ScheduledSession): Promise<void> => {
  const text = generateAnalysisText(session)
  await navigator.clipboard.writeText(text)
}
