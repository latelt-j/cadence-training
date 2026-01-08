"use strict";
// Cycling metrics calculation utilities
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateAllMetrics = exports.calculateAverageVam = exports.calculateAerobicDecoupling = exports.calculateVariabilityIndex = exports.calculateIntensityFactor = void 0;
/**
 * Calculate Intensity Factor (IF = NP / FTP)
 * IF > 1.0 means effort above threshold
 */
var calculateIntensityFactor = function (normalizedPower, ftp) {
    if (!normalizedPower || !ftp || ftp === 0)
        return undefined;
    return Math.round((normalizedPower / ftp) * 100) / 100; // 2 decimal places
};
exports.calculateIntensityFactor = calculateIntensityFactor;
/**
 * Calculate Variability Index (VI = NP / Avg Power)
 * VI > 1.05 indicates highly variable effort (criterium, intervals)
 * VI ~1.0 indicates steady effort (time trial)
 */
var calculateVariabilityIndex = function (normalizedPower, averagePower) {
    if (!normalizedPower || !averagePower || averagePower === 0)
        return undefined;
    return Math.round((normalizedPower / averagePower) * 100) / 100;
};
exports.calculateVariabilityIndex = calculateVariabilityIndex;
/**
 * Calculate Aerobic Decoupling (Pw:Hr drift)
 * Compare efficiency (power/HR) first half vs second half
 * Positive % means HR drifted up relative to power (cardiac drift)
 * > 5% suggests aerobic fitness needs work or pacing issue
 * < 5% indicates good aerobic endurance
 */
var calculateAerobicDecoupling = function (streams) {
    var heartrate = streams.heartrate, watts = streams.watts, time = streams.time;
    if (!heartrate || !watts || !time || heartrate.length < 10)
        return undefined;
    // Filter out zero values (stopped periods)
    var validData = heartrate
        .map(function (hr, i) { return ({ hr: hr, w: watts[i], t: time[i] }); })
        .filter(function (d) { return d.hr > 0 && d.w !== undefined && d.w > 0; });
    if (validData.length < 10)
        return undefined;
    var midpoint = Math.floor(validData.length / 2);
    var firstHalf = validData.slice(0, midpoint);
    var secondHalf = validData.slice(midpoint);
    // Calculate average efficiency (power/HR) for each half
    var avgEfficiencyFirst = firstHalf.reduce(function (sum, d) { return sum + d.w / d.hr; }, 0) / firstHalf.length;
    var avgEfficiencySecond = secondHalf.reduce(function (sum, d) { return sum + d.w / d.hr; }, 0) / secondHalf.length;
    if (avgEfficiencyFirst === 0)
        return undefined;
    // Decoupling = % decrease in efficiency (positive = HR drift up)
    var decoupling = ((avgEfficiencyFirst - avgEfficiencySecond) / avgEfficiencyFirst) * 100;
    return Math.round(decoupling * 100) / 100; // 2 decimal places
};
exports.calculateAerobicDecoupling = calculateAerobicDecoupling;
/**
 * Calculate Average VAM (Vertical Ascent Meters per hour)
 * Only counts climbing segments (positive elevation gain)
 * Good VAM for amateur: 800-1000 m/h
 * Pro level: 1500-1800 m/h
 */
var calculateAverageVam = function (streams) {
    var altitude = streams.altitude, time = streams.time, grade_smooth = streams.grade_smooth;
    if (!altitude || !time || altitude.length < 2)
        return undefined;
    // Calculate total positive elevation gain and climbing time
    var totalClimbMeters = 0;
    var totalClimbSeconds = 0;
    for (var i = 1; i < altitude.length; i++) {
        var altCurrent = altitude[i];
        var altPrevious = altitude[i - 1];
        var timeCurrent = time[i];
        var timePrevious = time[i - 1];
        if (altCurrent === undefined || altPrevious === undefined)
            continue;
        if (timeCurrent === undefined || timePrevious === undefined)
            continue;
        var elevDiff = altCurrent - altPrevious;
        var timeDiff = timeCurrent - timePrevious;
        // Only count climbing (positive elevation gain)
        if (elevDiff > 0 && timeDiff > 0) {
            // Only significant climbs (>1% grade if available)
            var grade = grade_smooth === null || grade_smooth === void 0 ? void 0 : grade_smooth[i];
            if (grade === undefined || grade > 1) {
                totalClimbMeters += elevDiff;
                totalClimbSeconds += timeDiff;
            }
        }
    }
    if (totalClimbSeconds < 60)
        return undefined; // Need at least 1 min of climbing
    // VAM = (meters climbed / hours climbing)
    var climbHours = totalClimbSeconds / 3600;
    var vam = Math.round(totalClimbMeters / climbHours);
    return vam > 0 ? vam : undefined;
};
exports.calculateAverageVam = calculateAverageVam;
/**
 * Calculate all metrics from streams data
 */
var calculateAllMetrics = function (streams, normalizedPower, averagePower, ftp) {
    return {
        intensity_factor: (0, exports.calculateIntensityFactor)(normalizedPower, ftp),
        variability_index: (0, exports.calculateVariabilityIndex)(normalizedPower, averagePower),
        aerobic_decoupling: (0, exports.calculateAerobicDecoupling)(streams),
        average_vam: (0, exports.calculateAverageVam)(streams),
    };
};
exports.calculateAllMetrics = calculateAllMetrics;
