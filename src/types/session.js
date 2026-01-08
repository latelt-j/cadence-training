"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ESTIMATES = exports.SPORT_CONFIG = void 0;
exports.SPORT_CONFIG = {
    cycling: { emoji: '🚴', label: 'Vélo', color: 'success' },
    mtb: { emoji: '🚵', label: 'VTT', color: 'success' },
    running: { emoji: '🏃', label: 'Course', color: 'warning' },
    strength: { emoji: '💪', label: 'Renfo', color: 'error' },
    hiking: { emoji: '🥾', label: 'Rando', color: 'info' },
};
// Estimation constants
exports.ESTIMATES = {
    cycling: {
        avgSpeedKmh: 28, // Average speed in km/h
        avgElevationPerHour: 500, // D+ per hour
    },
    running: {
        avgSpeedKmh: 60 / 6.5, // 6:30/km = ~9.23 km/h
    },
};
