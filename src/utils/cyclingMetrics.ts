// Cycling metrics calculation utilities

export interface StreamData {
  heartrate?: number[]
  watts?: number[]
  velocity_smooth?: number[]
  altitude?: number[]
  grade_smooth?: number[]
  time?: number[]
  distance?: number[]
}

export interface CalculatedMetrics {
  intensity_factor?: number
  variability_index?: number
  aerobic_decoupling?: number
  average_vam?: number
}

/**
 * Calculate Intensity Factor (IF = NP / FTP)
 * IF > 1.0 means effort above threshold
 */
export const calculateIntensityFactor = (
  normalizedPower: number | undefined,
  ftp: number | undefined
): number | undefined => {
  if (!normalizedPower || !ftp || ftp === 0) return undefined
  return Math.round((normalizedPower / ftp) * 100) / 100 // 2 decimal places
}

/**
 * Calculate Variability Index (VI = NP / Avg Power)
 * VI > 1.05 indicates highly variable effort (criterium, intervals)
 * VI ~1.0 indicates steady effort (time trial)
 */
export const calculateVariabilityIndex = (
  normalizedPower: number | undefined,
  averagePower: number | undefined
): number | undefined => {
  if (!normalizedPower || !averagePower || averagePower === 0) return undefined
  return Math.round((normalizedPower / averagePower) * 100) / 100
}

/**
 * Calculate Aerobic Decoupling (Pw:Hr drift)
 * Compare efficiency (power/HR) first half vs second half
 * Positive % means HR drifted up relative to power (cardiac drift)
 * > 5% suggests aerobic fitness needs work or pacing issue
 * < 5% indicates good aerobic endurance
 */
export const calculateAerobicDecoupling = (
  streams: StreamData
): number | undefined => {
  const { heartrate, watts, time } = streams

  if (!heartrate || !watts || !time || heartrate.length < 10) return undefined

  // Filter out zero values (stopped periods)
  const validData = heartrate
    .map((hr, i) => ({ hr, w: watts[i], t: time[i] }))
    .filter((d) => d.hr > 0 && d.w !== undefined && d.w > 0)

  if (validData.length < 10) return undefined

  const midpoint = Math.floor(validData.length / 2)
  const firstHalf = validData.slice(0, midpoint)
  const secondHalf = validData.slice(midpoint)

  // Calculate average efficiency (power/HR) for each half
  const avgEfficiencyFirst =
    firstHalf.reduce((sum, d) => sum + d.w! / d.hr, 0) / firstHalf.length
  const avgEfficiencySecond =
    secondHalf.reduce((sum, d) => sum + d.w! / d.hr, 0) / secondHalf.length

  if (avgEfficiencyFirst === 0) return undefined

  // Decoupling = % decrease in efficiency (positive = HR drift up)
  const decoupling =
    ((avgEfficiencyFirst - avgEfficiencySecond) / avgEfficiencyFirst) * 100

  return Math.round(decoupling * 100) / 100 // 2 decimal places
}

/**
 * Calculate Average VAM (Vertical Ascent Meters per hour)
 * Only counts climbing segments (positive elevation gain)
 * Good VAM for amateur: 800-1000 m/h
 * Pro level: 1500-1800 m/h
 */
export const calculateAverageVam = (streams: StreamData): number | undefined => {
  const { altitude, time, grade_smooth } = streams

  if (!altitude || !time || altitude.length < 2) return undefined

  // Calculate total positive elevation gain and climbing time
  let totalClimbMeters = 0
  let totalClimbSeconds = 0

  for (let i = 1; i < altitude.length; i++) {
    const altCurrent = altitude[i]
    const altPrevious = altitude[i - 1]
    const timeCurrent = time[i]
    const timePrevious = time[i - 1]

    if (altCurrent === undefined || altPrevious === undefined) continue
    if (timeCurrent === undefined || timePrevious === undefined) continue

    const elevDiff = altCurrent - altPrevious
    const timeDiff = timeCurrent - timePrevious

    // Only count climbing (positive elevation gain)
    if (elevDiff > 0 && timeDiff > 0) {
      // Only significant climbs (>1% grade if available)
      const grade = grade_smooth?.[i]
      if (grade === undefined || grade > 1) {
        totalClimbMeters += elevDiff
        totalClimbSeconds += timeDiff
      }
    }
  }

  if (totalClimbSeconds < 60) return undefined // Need at least 1 min of climbing

  // VAM = (meters climbed / hours climbing)
  const climbHours = totalClimbSeconds / 3600
  const vam = Math.round(totalClimbMeters / climbHours)

  return vam > 0 ? vam : undefined
}

/**
 * Calculate all metrics from streams data
 */
export const calculateAllMetrics = (
  streams: StreamData,
  normalizedPower?: number,
  averagePower?: number,
  ftp?: number
): CalculatedMetrics => {
  return {
    intensity_factor: calculateIntensityFactor(normalizedPower, ftp),
    variability_index: calculateVariabilityIndex(normalizedPower, averagePower),
    aerobic_decoupling: calculateAerobicDecoupling(streams),
    average_vam: calculateAverageVam(streams),
  }
}
