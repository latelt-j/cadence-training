"use strict";
/* placeholder */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var vue_1 = require("vue");
var props = defineProps();
var emit = defineEmits();
// Reset form to defaults
var resetForm = function () {
    error.value = '';
    step.value = 'form';
    coachResponse.value = '';
    fatigue.value = 5;
    toutRealise.value = 'oui';
    difficulte.value = 'normal';
    contraintes.value = '';
    envies.value = '';
    // Reset dates to current week
    var defaults = getDefaultPlanDates();
    planStartDate.value = defaults.start;
    planEndDate.value = defaults.end;
};
var error = (0, vue_1.ref)('');
var copied = (0, vue_1.ref)(false);
var step = (0, vue_1.ref)('form');
var __VLS_exposed = { resetForm: resetForm, step: step };
defineExpose(__VLS_exposed);
var coachResponse = (0, vue_1.ref)('');
// Nouveaux champs pour le prompt coach
var fatigue = (0, vue_1.ref)(5);
var toutRealise = (0, vue_1.ref)('oui');
var difficulte = (0, vue_1.ref)('normal');
var contraintes = (0, vue_1.ref)('');
var envies = (0, vue_1.ref)('');
// Custom date range for workout request
var getDefaultPlanDates = function () {
    var today = new Date();
    var dayOfWeek = today.getDay();
    var monday = new Date(today);
    if (dayOfWeek === 0) {
        monday.setDate(today.getDate() + 1);
    }
    else {
        monday.setDate(today.getDate() - (dayOfWeek - 1));
    }
    var sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return {
        start: "".concat(monday.getFullYear(), "-").concat(String(monday.getMonth() + 1).padStart(2, '0'), "-").concat(String(monday.getDate()).padStart(2, '0')),
        end: "".concat(sunday.getFullYear(), "-").concat(String(sunday.getMonth() + 1).padStart(2, '0'), "-").concat(String(sunday.getDate()).padStart(2, '0')),
    };
};
var defaultDates = getDefaultPlanDates();
var planStartDate = (0, vue_1.ref)(defaultDates.start);
var planEndDate = (0, vue_1.ref)(defaultDates.end);
// Format date as YYYY-MM-DD in LOCAL timezone (not UTC!)
var formatLocalDate = function (date) {
    var year = date.getFullYear();
    var month = String(date.getMonth() + 1).padStart(2, '0');
    var day = String(date.getDate()).padStart(2, '0');
    return "".concat(year, "-").concat(month, "-").concat(day);
};
// Bilan week: the week BEFORE the planning period starts
var bilanWeekDates = (0, vue_1.computed)(function () {
    var planStart = new Date(planStartDate.value);
    var dayOfWeek = planStart.getDay(); // 0 = Sunday, 1 = Monday
    // Find the Monday of the week before planStart
    var prevMonday = new Date(planStart);
    if (dayOfWeek === 0) {
        // planStart is Sunday → previous Monday was 6 days ago
        prevMonday.setDate(planStart.getDate() - 6);
    }
    else if (dayOfWeek === 1) {
        // planStart is Monday → previous Monday was 7 days ago
        prevMonday.setDate(planStart.getDate() - 7);
    }
    else {
        // Tue-Sat → go back to this week's Monday, then subtract 7
        prevMonday.setDate(planStart.getDate() - (dayOfWeek - 1) - 7);
    }
    var prevSunday = new Date(prevMonday);
    prevSunday.setDate(prevMonday.getDate() + 6);
    return {
        start: formatLocalDate(prevMonday),
        end: formatLocalDate(prevSunday),
    };
});
// Generate all dates in the selected plan range
var planDatesRange = (0, vue_1.computed)(function () {
    var dates = [];
    var start = new Date(planStartDate.value);
    var end = new Date(planEndDate.value);
    var current = new Date(start);
    while (current <= end) {
        dates.push(formatLocalDate(current));
        current.setDate(current.getDate() + 1);
    }
    return dates;
});
// Get day name in French
var getDayName = function (dateStr) {
    var date = new Date(dateStr);
    var days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return days[date.getDay()];
};
// Filter Strava sessions for the bilan week (week before planning period)
var bilanStravaSessions = (0, vue_1.computed)(function () {
    if (!props.sessions)
        return [];
    var start = bilanWeekDates.value.start;
    var end = bilanWeekDates.value.end;
    return props.sessions.filter(function (s) {
        return s.date >= start && s.date <= end && s.type === 'strava';
    }).sort(function (a, b) { return a.date.localeCompare(b.date); });
});
// Current phase
var currentPhase = (0, vue_1.computed)(function () {
    var _a, _b;
    if (!((_a = props.trainingPhases) === null || _a === void 0 ? void 0 : _a.length))
        return null;
    var today = (_b = new Date().toISOString().split('T')[0]) !== null && _b !== void 0 ? _b : '';
    return props.trainingPhases.find(function (p) { return p.start_date <= today && p.end_date >= today; });
});
// Parse date string as local date (not UTC)
var parseLocalDate = function (dateStr) {
    var _a, _b, _c;
    var parts = dateStr.split('-').map(Number);
    return new Date((_a = parts[0]) !== null && _a !== void 0 ? _a : 2025, ((_b = parts[1]) !== null && _b !== void 0 ? _b : 1) - 1, (_c = parts[2]) !== null && _c !== void 0 ? _c : 1);
};
// Week number within current phase
var phaseWeekNumber = (0, vue_1.computed)(function () {
    if (!currentPhase.value)
        return null;
    var phaseStart = parseLocalDate(currentPhase.value.start_date);
    phaseStart.setHours(0, 0, 0, 0);
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var diffTime = today.getTime() - phaseStart.getTime();
    var diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, Math.floor(diffDays / 7) + 1);
});
// Total weeks in current phase
var phaseTotalWeeks = (0, vue_1.computed)(function () {
    if (!currentPhase.value)
        return null;
    var phaseStart = parseLocalDate(currentPhase.value.start_date);
    var phaseEnd = parseLocalDate(currentPhase.value.end_date);
    var diffTime = phaseEnd.getTime() - phaseStart.getTime();
    var diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.ceil(diffDays / 7);
});
// Week stats
var weekStats = (0, vue_1.computed)(function () {
    var stats = {
        totalHours: 0,
        totalKm: 0,
        totalElevation: 0,
        cycling: { hours: 0, km: 0, elevation: 0, count: 0 },
        mtb: { hours: 0, km: 0, elevation: 0, count: 0 },
        running: { hours: 0, km: 0, elevation: 0, count: 0 },
        strength: { hours: 0, count: 0 },
    };
    bilanStravaSessions.value.forEach(function (s) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        var hours = s.duration_min / 60;
        stats.totalHours += hours;
        if (s.sport === 'cycling') {
            stats.cycling.hours += hours;
            stats.cycling.km += (_a = s.actual_km) !== null && _a !== void 0 ? _a : 0;
            stats.cycling.elevation += (_b = s.actual_elevation) !== null && _b !== void 0 ? _b : 0;
            stats.cycling.count++;
        }
        else if (s.sport === 'mtb') {
            stats.mtb.hours += hours;
            stats.mtb.km += (_c = s.actual_km) !== null && _c !== void 0 ? _c : 0;
            stats.mtb.elevation += (_d = s.actual_elevation) !== null && _d !== void 0 ? _d : 0;
            stats.mtb.count++;
        }
        else if (s.sport === 'running') {
            stats.running.hours += hours;
            stats.running.km += (_e = s.actual_km) !== null && _e !== void 0 ? _e : 0;
            stats.running.elevation += (_f = s.actual_elevation) !== null && _f !== void 0 ? _f : 0;
            stats.running.count++;
        }
        else if (s.sport === 'strength') {
            stats.strength.hours += hours;
            stats.strength.count++;
        }
        stats.totalKm += (_g = s.actual_km) !== null && _g !== void 0 ? _g : 0;
        stats.totalElevation += (_h = s.actual_elevation) !== null && _h !== void 0 ? _h : 0;
    });
    return stats;
});
var formatHours = function (hours) {
    var h = Math.floor(hours);
    var m = Math.round((hours - h) * 60);
    if (h === 0)
        return "".concat(m, "min");
    if (m === 0)
        return "".concat(h, "h");
    return "".concat(h, "h").concat(m.toString().padStart(2, '0'));
};
// Generate coach prompt with new structured format
var generateCoachPrompt = function () {
    var _a, _b, _c, _d, _e, _f, _g;
    var dates = planDatesRange.value;
    var datesListStr = dates.map(function (d) { return "- ".concat(getDayName(d), " : ").concat(d); }).join('\n');
    // Find phase for the plan period
    var planPhase = (_a = props.trainingPhases) === null || _a === void 0 ? void 0 : _a.find(function (p) { return p.start_date <= planStartDate.value && p.end_date >= planStartDate.value; });
    var prompt = "# [DEMANDE DE PLAN D'ENTRA\u00CENEMENT]\n\n---\n\n**1. PROFIL ATHL\u00C8TE**\n";
    // Athlete profile
    if ((_b = props.athleteProfile) === null || _b === void 0 ? void 0 : _b.ftp) {
        prompt += "- FTP : ".concat(props.athleteProfile.ftp, " W\n");
    }
    if (((_c = props.athleteProfile) === null || _c === void 0 ? void 0 : _c.max_hr) || ((_d = props.athleteProfile) === null || _d === void 0 ? void 0 : _d.resting_hr)) {
        prompt += "- FC Max : ".concat((_e = props.athleteProfile.max_hr) !== null && _e !== void 0 ? _e : '?', " bpm / Repos : ").concat((_f = props.athleteProfile.resting_hr) !== null && _f !== void 0 ? _f : '?', " bpm\n");
    }
    prompt += "- Fatigue actuelle (0-10) : ".concat(fatigue.value, "\n");
    if ((_g = props.athleteProfile) === null || _g === void 0 ? void 0 : _g.environment) {
        prompt += "- Contexte : ".concat(props.athleteProfile.environment, "\n");
    }
    // Objectives
    prompt += "\n**2. OBJECTIFS**\n";
    if (props.trainingObjectives && props.trainingObjectives.length > 0) {
        props.trainingObjectives.forEach(function (obj) {
            var daysLeft = Math.ceil((new Date(obj.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            var dateFormatted = new Date(obj.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
            prompt += "- [".concat(obj.priority, "] ").concat(obj.name, " (").concat(dateFormatted, ") : ").concat(obj.distance_km, "km / ").concat(obj.elevation_gain, " D+ - J-").concat(daysLeft, "\n");
        });
    }
    else {
        prompt += "- Aucun objectif d\u00E9fini\n";
    }
    // Current phase
    prompt += "\n**3. CYCLE ACTUEL**\n";
    if (planPhase) {
        prompt += "- Cycle : ".concat(planPhase.name);
        if (planPhase.description)
            prompt += " - ".concat(planPhase.description);
        prompt += "\n";
        if (phaseWeekNumber.value && phaseTotalWeeks.value) {
            prompt += "- Semaine : ".concat(phaseWeekNumber.value, "/").concat(phaseTotalWeeks.value, "\n");
        }
        if (planPhase.objectives) {
            prompt += "- Objectifs : ".concat(planPhase.objectives, "\n");
        }
        if (planPhase.keywords) {
            prompt += "- Mots-cl\u00E9s : ".concat(planPhase.keywords, "\n");
        }
        if (planPhase.challenge) {
            prompt += "- Challenge : ".concat(planPhase.challenge, "\n");
        }
    }
    else {
        prompt += "- Cycle : Non d\u00E9fini\n";
    }
    // Bilan last week
    prompt += "\n**4. BILAN SEMAINE PASS\u00C9E** (".concat(bilanWeekDates.value.start, " au ").concat(bilanWeekDates.value.end, ")\n\n");
    // Volume summary
    prompt += "Volume total : ".concat(formatHours(weekStats.value.totalHours), " (").concat(bilanStravaSessions.value.length, " s\u00E9ances)\n");
    if (weekStats.value.cycling.count > 0) {
        prompt += "- \uD83D\uDEB4 V\u00E9lo : ".concat(formatHours(weekStats.value.cycling.hours), " (").concat(weekStats.value.cycling.count, " s\u00E9ances, ").concat(weekStats.value.cycling.km.toFixed(0), "km, ").concat(Math.round(weekStats.value.cycling.elevation), " D+)\n");
    }
    if (weekStats.value.mtb.count > 0) {
        prompt += "- \uD83D\uDEB5 VTT : ".concat(formatHours(weekStats.value.mtb.hours), " (").concat(weekStats.value.mtb.count, " s\u00E9ances, ").concat(weekStats.value.mtb.km.toFixed(0), "km, ").concat(Math.round(weekStats.value.mtb.elevation), " D+)\n");
    }
    if (weekStats.value.running.count > 0) {
        prompt += "- \uD83C\uDFC3 Course : ".concat(formatHours(weekStats.value.running.hours), " (").concat(weekStats.value.running.count, " s\u00E9ances, ").concat(weekStats.value.running.km.toFixed(0), "km, ").concat(Math.round(weekStats.value.running.elevation), " D+)\n");
    }
    if (weekStats.value.strength.count > 0) {
        prompt += "- \uD83D\uDCAA Renfo : ".concat(formatHours(weekStats.value.strength.hours), " (").concat(weekStats.value.strength.count, " s\u00E9ances)\n");
    }
    // Session details
    if (bilanStravaSessions.value.length > 0) {
        prompt += "\nD\u00E9tail :\n";
        bilanStravaSessions.value.forEach(function (s) {
            var sportEmoji = s.sport === 'cycling' ? '🚴' : s.sport === 'mtb' ? '🚵' : s.sport === 'running' ? '🏃' : '💪';
            var dateShort = new Date(s.date).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit' });
            var line = "- ".concat(dateShort, " : ").concat(s.title, " ").concat(sportEmoji, " - ").concat(formatHours(s.duration_min / 60));
            if (s.actual_km)
                line += ", ".concat(s.actual_km.toFixed(0), "km");
            if (s.actual_elevation)
                line += ", ".concat(Math.round(s.actual_elevation), " D+");
            if (s.intensity_factor)
                line += ", IF ".concat(s.intensity_factor.toFixed(2));
            else if (s.average_heartrate)
                line += ", FC ".concat(Math.round(s.average_heartrate), "bpm");
            prompt += line + '\n';
        });
    }
    // Ressenti
    var toutRealiseLabel = toutRealise.value === 'oui' ? 'Oui' : toutRealise.value === 'partiel' ? 'Partiellement' : 'Non';
    var difficulteLabel = difficulte.value === 'facile' ? 'Facile' : difficulte.value === 'normal' ? 'Normal' : 'Difficile';
    prompt += "\nRessenti :\n";
    prompt += "- Tout r\u00E9alis\u00E9 : ".concat(toutRealiseLabel, "\n");
    prompt += "- Difficult\u00E9 : ".concat(difficulteLabel, "\n");
    // Request for next week
    prompt += "\n**5. DEMANDE POUR LA SEMAINE \u00C0 VENIR** (".concat(planStartDate.value, " au ").concat(planEndDate.value, ")\n\n");
    prompt += "Dates disponibles :\n".concat(datesListStr, "\n");
    prompt += "\n- Contraintes : ".concat(contraintes.value.trim() || 'Aucune', "\n");
    prompt += "- Envies : ".concat(envies.value.trim() || 'Aucune', "\n");
    // JSON instructions
    prompt += "\n---\n\nEn te basant sur le contexte ci-dessus, g\u00E9n\u00E8re-moi un plan d'entra\u00EEnement.\n\nR\u00E9ponds UNIQUEMENT avec le code JSON brut (pas de markdown, pas de ```). Je vais copier-coller directement.\n\nFormat attendu :\n{\n  \"phase\": {\n    \"name\": \"Base\",\n    \"week\": 2,\n    \"total_weeks\": 4,\n    \"description\": \"Construction de la base a\u00E9robie\"\n  },\n  \"sessions\": [\n    {\n      \"sport\": \"cycling\",\n      \"type\": \"sweet_spot\",\n      \"title\": \"Zwift: Sweet Torture 2x20 - Mes jambes n\u00E9gocient\",\n      \"duration_min\": 90,\n      \"intensity\": 7,\n      \"description\": \"\uD83D\uDD25 40 minutes \u00E0 90% FTP, qu'est-ce qui pourrait mal tourner?\\n\\n\u00C9chauffement 10min\\n2x20min Sweet Spot (5min r\u00E9cup)\\nRetour au calme 10min\\n\\nSpoiler: tout. Tout peut mal tourner.\",\n      \"date\": \"".concat(dates[0], "\",\n      \"zwift_workout\": \"<workout_file>...</workout_file>\"\n    }\n  ]\n}\n\n\u26A0\uFE0F SPORTS VALIDES : \"cycling\", \"mtb\", \"running\", \"strength\", \"hiking\"\n- Pour une journ\u00E9e de repos, ne pas cr\u00E9er de s\u00E9ance\n\n\u26A0\uFE0F INTENSIT\u00C9 (OBLIGATOIRE) :\n- Chaque s\u00E9ance DOIT avoir un champ \"intensity\" de 1 \u00E0 10\n- 1-2 : R\u00E9cup\u00E9ration active, tr\u00E8s facile\n- 3-4 : Endurance facile, Z2\n- 5-6 : Tempo, mod\u00E9r\u00E9\n- 7-8 : Seuil, Sweet Spot, dur\n- 9-10 : VO2max, intervalles intenses, tr\u00E8s dur\n\nTypes : \"sweet_spot\", \"threshold\", \"vo2max\", \"anaerobic\", \"long_run\", \"long_ride\", \"hills\", \"fartlek\", \"recovery\", \"strength\", \"core\"\n\n\u26A0\uFE0F S\u00C9ANCES V\u00C9LO - INDOOR vs OUTDOOR :\n- S\u00E9ances INDOOR (intervalles, sweet spot, threshold, VO2max, r\u00E9cup active) :\n  \u2192 Pr\u00E9fixer le titre avec \"Zwift:\"\n  \u2192 Exemples: \"Zwift: Sweet Spot 2x20\", \"Zwift: VO2max 5x4min\", \"Zwift: R\u00E9cup Active\"\n- S\u00E9ances OUTDOOR (sortie longue Z2, endurance > 2h) :\n  \u2192 PAS de pr\u00E9fixe Zwift\n  \u2192 Exemples: \"Sortie Longue Z2\", \"Endurance 3h\"\n- Crit\u00E8res : dur\u00E9e < 90min ET intervalles \u2192 Indoor/Zwift | dur\u00E9e > 2h ET Z2 \u2192 Outdoor\n\n\u26A0\uFE0F S\u00C9ANCES RENFO (sport: \"strength\") :\n- Adapter le contenu \u00E0 la phase actuelle :\n  - Base/Fondation : renfo g\u00E9n\u00E9ral, gainage, stabilit\u00E9\n  - Build/Construction : renfo sp\u00E9cifique v\u00E9lo/course, puissance\n  - Peak/Aff\u00FBtage : maintien l\u00E9ger, mobilit\u00E9\n  - Recovery : \u00E9tirements, mobilit\u00E9 douce\n- TOUJOURS inclure \"duration_min\" (dur\u00E9e estim\u00E9e en minutes)\n- Exemple :\n  {\n    \"sport\": \"strength\",\n    \"type\": \"strength\",\n    \"title\": \"Renfo gainage\",\n    \"duration_min\": 30,\n    \"description\": \"\uD83D\uDCAA S\u00E9ance gainage\\n\\n3 tours :\\n- Planche 45s\\n- Gainage lat\u00E9ral 30s/c\u00F4t\u00E9\\n- Superman 15 reps\\n- Bird dog 10 reps/c\u00F4t\u00E9\\n\\nRepos 1min entre tours\",\n    \"date\": \"2025-01-15\"\n  }\n\nIMPORTANT pour les descriptions :\n- Utilise \\n pour les retours \u00E0 la ligne\n- PAS de markdown\n- Emojis au d\u00E9but : \uD83D\uDD25 \uD83D\uDCAA \uD83E\uDDD8 \uD83D\uDEB4 \uD83C\uDFC3 \u26F0\uFE0F\n- Structure : \u00C9chauffement \u2192 Corps \u2192 Retour au calme\n\n\uD83C\uDFAD TITRES & DESCRIPTIONS STRAVA - SOIS CR\u00C9ATIF ET DR\u00D4LE !\nJe partage mes s\u00E9ances sur Strava avec beaucoup de followers. Les titres et descriptions doivent :\n- \u00CAtre DR\u00D4LES, d\u00E9cal\u00E9s, avec de l'autod\u00E9rision\n- Faire sourire/rire les gens qui lisent\n- Utiliser des r\u00E9f\u00E9rences pop culture, des jeux de mots, de l'humour cycliste/runner\n- Exemples de titres fun : \"La souffrance \u00E9tait au rendez-vous (et moi aussi, malheureusement)\", \"Sweet Spot ou Sweet Torture?\", \"Mes jambes ont d\u00E9pos\u00E9 une plainte\", \"Je p\u00E9dale donc je souffre\", \"VO2max: Violence Organis\u00E9e 2 fois max\"\n- Dans les descriptions : ajoute des commentaires sarcastiques, des observations dr\u00F4les sur la douleur, la m\u00E9t\u00E9o, les sensations\n\n\uD83D\uDEA8 R\u00C8GLE CRITIQUE - zwift_workout :\n- OBLIGATOIRE : Chaque s\u00E9ance \"Zwift:\" DOIT avoir un zwift_workout XML complet (NE JAMAIS OUBLIER)\n- INTERDIT : Les sorties outdoor (Sortie Longue, Endurance) ne doivent PAS avoir de zwift_workout\n- XML sur UNE SEULE LIGNE\n- APOSTROPHES (') pas guillemets (\")\n- Puissances en % FTP (0.75 = 75%)\n- Dur\u00E9es en SECONDES\n- AJOUTER des <textevent> pour guider l'athl\u00E8te pendant le workout :\n  - Format: <textevent timeoffset='X' message='...'/>\n  - timeoffset = secondes depuis le d\u00E9but du workout (pas du segment)\n  - Messages courts: cadence, position, respiration, motivation\n\n\uD83D\uDD04 LOGIQUE DE REMPLISSAGE (ANTI-VIDE) :\n1. D\u00C9FINIR LE TEMPS DE TRAVAIL : Soustraire l'\u00E9chauffement (Warmup) et le retour au calme (Cooldown) de la dur\u00E9e totale.\n   (Ex: 60min total - 10min Warmup - 10min Cool = 40min de \"Corps de S\u00E9ance\" \u00E0 remplir)\n2. AJUSTER LES R\u00C9P\u00C9TITIONS :\n   - Si tes blocs d'intervalles sont trop courts pour remplir ce temps, tu DOIS AJOUTER DES R\u00C9P\u00C9TITIONS ou DUPLIQUER LE BLOC ENTIER\n   - INTERDICTION formelle de combler le manque de temps par du Cooldown\n   - Le Cooldown ne doit JAMAIS d\u00E9passer 15% de la dur\u00E9e totale (sauf s\u00E9ance de r\u00E9cup pure)\n\n- Exemple : \"<workout_file><author>Coach</author><name>Sweet Spot</name><description>2x20min SS</description><sportType>bike</sportType><workout><Warmup Duration='600' PowerLow='0.50' PowerHigh='0.70'/><textevent timeoffset='0' message='Echauffement progressif'/><textevent timeoffset='300' message='Augmentez doucement'/><SteadyState Duration='1200' Power='0.90'/><textevent timeoffset='600' message='Sweet spot! Cadence 85-95'/><textevent timeoffset='1200' message='Tenez le rythme'/><Cooldown Duration='600' PowerLow='0.65' PowerHigh='0.50'/><textevent timeoffset='1800' message='Retour au calme'/></workout></workout_file>\"\n");
    return prompt;
};
var copyCoachPrompt = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, navigator.clipboard.writeText(generateCoachPrompt())];
            case 1:
                _a.sent();
                copied.value = true;
                setTimeout(function () {
                    copied.value = false;
                    step.value = 'paste';
                }, 1000);
                return [2 /*return*/];
        }
    });
}); };
// Parse and save coach response
var saveCoachResponse = function () {
    error.value = '';
    try {
        var cleanText = coachResponse.value.trim();
        // Remove markdown code blocks if present
        cleanText = cleanText.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '');
        // Handle duplicated JSON objects (Gemini sometimes returns the same response twice)
        var duplicateIndex = cleanText.search(/\}\s*\{/);
        if (duplicateIndex !== -1 && cleanText.startsWith('{')) {
            cleanText = cleanText.substring(0, duplicateIndex + 1);
        }
        else {
            // Try to extract JSON object or array from the text
            var jsonMatch = cleanText.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
            if (jsonMatch && jsonMatch[1]) {
                cleanText = jsonMatch[1];
            }
        }
        // Handle multiple arrays concatenated
        cleanText = cleanText.replace(/\]\s*\[/g, ',');
        var data = JSON.parse(cleanText);
        // New format with phase: { phase: {...}, sessions: [...] }
        if (data && typeof data === 'object' && !Array.isArray(data) && data.sessions) {
            var phase = data.phase;
            var sessions = Array.isArray(data.sessions) ? data.sessions : [data.sessions];
            emit('import', sessions, true, phase);
        }
        else {
            // Old format: array of sessions or single session
            var sessions = Array.isArray(data) ? data : [data];
            emit('import', sessions, true);
        }
        // Reset after successful import
        coachResponse.value = '';
        step.value = 'form';
    }
    catch (e) {
        error.value = e instanceof Error ? e.message : 'JSON invalide';
    }
};
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var ___VLS_components;
var ___VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-4" }));
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
var __VLS_0;
/** @ts-ignore @type {typeof ___VLS_components.Transition} */
Transition;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    name: "fade",
    mode: "out-in",
}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
        name: "fade",
        mode: "out-in",
    }], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = __VLS_3.slots.default;
if (__VLS_ctx.step === 'form') {
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ key: "form" }, { class: "space-y-4" }));
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "form-control" }));
    /** @type {__VLS_StyleScopedClasses['form-control']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.label, __VLS_intrinsics.label)(__assign({ class: "label pb-1" }));
    /** @type {__VLS_StyleScopedClasses['label']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-1']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "label-text text-xs text-base-content/60" }));
    /** @type {__VLS_StyleScopedClasses['label-text']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base-content/60']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex gap-2 items-center" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.input)(__assign({ type: "date" }, { class: "input input-bordered input-sm flex-1" }));
    (__VLS_ctx.planStartDate);
    /** @type {__VLS_StyleScopedClasses['input']} */ ;
    /** @type {__VLS_StyleScopedClasses['input-bordered']} */ ;
    /** @type {__VLS_StyleScopedClasses['input-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-base-content/60" }));
    /** @type {__VLS_StyleScopedClasses['text-base-content/60']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.input)(__assign({ type: "date" }, { class: "input input-bordered input-sm flex-1" }));
    (__VLS_ctx.planEndDate);
    /** @type {__VLS_StyleScopedClasses['input']} */ ;
    /** @type {__VLS_StyleScopedClasses['input-bordered']} */ ;
    /** @type {__VLS_StyleScopedClasses['input-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-xs text-base-content/50 mt-1" }));
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base-content/50']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
    (__VLS_ctx.planDatesRange.length);
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "form-control" }));
    /** @type {__VLS_StyleScopedClasses['form-control']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.label, __VLS_intrinsics.label)(__assign({ class: "label pb-0" }));
    /** @type {__VLS_StyleScopedClasses['label']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-0']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "label-text text-xs text-base-content/60" }));
    /** @type {__VLS_StyleScopedClasses['label-text']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base-content/60']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center gap-3 mt-1" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.input)(__assign(__assign({ type: "range", min: "0", max: "10" }, { class: "range range-sm flex-1" }), { class: ({
            'range-success': __VLS_ctx.fatigue <= 3,
            'range-warning': __VLS_ctx.fatigue > 3 && __VLS_ctx.fatigue <= 6,
            'range-error': __VLS_ctx.fatigue > 6
        }) }));
    (__VLS_ctx.fatigue);
    /** @type {__VLS_StyleScopedClasses['range']} */ ;
    /** @type {__VLS_StyleScopedClasses['range-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['range-success']} */ ;
    /** @type {__VLS_StyleScopedClasses['range-warning']} */ ;
    /** @type {__VLS_StyleScopedClasses['range-error']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "font-bold text-sm min-w-[40px] text-right" }));
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['min-w-[40px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-right']} */ ;
    (__VLS_ctx.fatigue);
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex justify-between text-xs text-base-content/40 px-1 mt-1" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base-content/40']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "form-control" }));
    /** @type {__VLS_StyleScopedClasses['form-control']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.label, __VLS_intrinsics.label)(__assign({ class: "label pb-1" }));
    /** @type {__VLS_StyleScopedClasses['label']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-1']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "label-text text-xs text-base-content/60" }));
    /** @type {__VLS_StyleScopedClasses['label-text']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base-content/60']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "grid grid-cols-2 gap-3" }));
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-xs text-base-content/50 mb-1" }));
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base-content/50']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex gap-1" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.label, __VLS_intrinsics.label)(__assign({ class: "btn btn-xs" }, { class: (__VLS_ctx.toutRealise === 'oui' ? 'btn-success' : 'btn-ghost') }));
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-xs']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.input)(__assign({ type: "radio", value: "oui" }, { class: "hidden" }));
    (__VLS_ctx.toutRealise);
    /** @type {__VLS_StyleScopedClasses['hidden']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.label, __VLS_intrinsics.label)(__assign({ class: "btn btn-xs" }, { class: (__VLS_ctx.toutRealise === 'partiel' ? 'btn-warning' : 'btn-ghost') }));
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-xs']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.input)(__assign({ type: "radio", value: "partiel" }, { class: "hidden" }));
    (__VLS_ctx.toutRealise);
    /** @type {__VLS_StyleScopedClasses['hidden']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.label, __VLS_intrinsics.label)(__assign({ class: "btn btn-xs" }, { class: (__VLS_ctx.toutRealise === 'non' ? 'btn-error' : 'btn-ghost') }));
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-xs']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.input)(__assign({ type: "radio", value: "non" }, { class: "hidden" }));
    (__VLS_ctx.toutRealise);
    /** @type {__VLS_StyleScopedClasses['hidden']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-xs text-base-content/50 mb-1" }));
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base-content/50']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex gap-1" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.label, __VLS_intrinsics.label)(__assign({ class: "btn btn-xs" }, { class: (__VLS_ctx.difficulte === 'facile' ? 'btn-success' : 'btn-ghost') }));
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-xs']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.input)(__assign({ type: "radio", value: "facile" }, { class: "hidden" }));
    (__VLS_ctx.difficulte);
    /** @type {__VLS_StyleScopedClasses['hidden']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.label, __VLS_intrinsics.label)(__assign({ class: "btn btn-xs" }, { class: (__VLS_ctx.difficulte === 'normal' ? 'btn-info' : 'btn-ghost') }));
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-xs']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.input)(__assign({ type: "radio", value: "normal" }, { class: "hidden" }));
    (__VLS_ctx.difficulte);
    /** @type {__VLS_StyleScopedClasses['hidden']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.label, __VLS_intrinsics.label)(__assign({ class: "btn btn-xs" }, { class: (__VLS_ctx.difficulte === 'difficile' ? 'btn-error' : 'btn-ghost') }));
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-xs']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.input)(__assign({ type: "radio", value: "difficile" }, { class: "hidden" }));
    (__VLS_ctx.difficulte);
    /** @type {__VLS_StyleScopedClasses['hidden']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "form-control" }));
    /** @type {__VLS_StyleScopedClasses['form-control']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.label, __VLS_intrinsics.label)(__assign({ class: "label pb-1" }));
    /** @type {__VLS_StyleScopedClasses['label']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-1']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "label-text text-xs text-base-content/60" }));
    /** @type {__VLS_StyleScopedClasses['label-text']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base-content/60']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.input)(__assign(__assign({ value: (__VLS_ctx.contraintes), type: "text" }, { class: "input input-bordered input-sm w-full" }), { placeholder: "Ex: Mardi seulement 45min, pas de vélo jeudi..." }));
    /** @type {__VLS_StyleScopedClasses['input']} */ ;
    /** @type {__VLS_StyleScopedClasses['input-bordered']} */ ;
    /** @type {__VLS_StyleScopedClasses['input-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "form-control" }));
    /** @type {__VLS_StyleScopedClasses['form-control']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.label, __VLS_intrinsics.label)(__assign({ class: "label pb-1" }));
    /** @type {__VLS_StyleScopedClasses['label']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-1']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "label-text text-xs text-base-content/60" }));
    /** @type {__VLS_StyleScopedClasses['label-text']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base-content/60']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.input)(__assign(__assign({ value: (__VLS_ctx.envies), type: "text" }, { class: "input input-bordered input-sm w-full" }), { placeholder: "Ex: Faire du D+ ce week-end, tester des intervalles..." }));
    /** @type {__VLS_StyleScopedClasses['input']} */ ;
    /** @type {__VLS_StyleScopedClasses['input-bordered']} */ ;
    /** @type {__VLS_StyleScopedClasses['input-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign({ onClick: (__VLS_ctx.copyCoachPrompt) }, { class: "btn w-full text-white font-semibold border-0 shadow-lg" }), { class: (__VLS_ctx.copied ? 'btn-success' : 'bg-pink-500 hover:bg-pink-600 shadow-pink-500/40') }));
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
    (__VLS_ctx.copied ? '✓ Copié !' : '🤖 Demander au coach (copier le prompt)');
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ key: "paste" }, { class: "space-y-4" }));
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-center" }));
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-3xl mb-2" }));
    /** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-sm text-base-content/70" }));
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base-content/70']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.textarea, __VLS_intrinsics.textarea)(__assign(__assign({ value: (__VLS_ctx.coachResponse) }, { class: "textarea textarea-bordered w-full h-64 font-mono text-sm" }), { placeholder: "Colle ici la réponse JSON du coach..." }));
    /** @type {__VLS_StyleScopedClasses['textarea']} */ ;
    /** @type {__VLS_StyleScopedClasses['textarea-bordered']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-64']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign({ onClick: (__VLS_ctx.saveCoachResponse) }, { class: "btn w-full text-white font-semibold border-0 shadow-lg bg-pink-500 hover:bg-pink-600 shadow-pink-500/40" }), { disabled: (!__VLS_ctx.coachResponse.trim()) }));
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-pink-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-pink-600']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-pink-500/40']} */ ;
}
// @ts-ignore
[step, planStartDate, planEndDate, planDatesRange, fatigue, fatigue, fatigue, fatigue, fatigue, fatigue, toutRealise, toutRealise, toutRealise, toutRealise, toutRealise, toutRealise, difficulte, difficulte, difficulte, difficulte, difficulte, difficulte, contraintes, envies, copyCoachPrompt, copied, copied, coachResponse, coachResponse, saveCoachResponse,];
var __VLS_3;
if (__VLS_ctx.error) {
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "alert alert-error text-sm" }));
    /** @type {__VLS_StyleScopedClasses['alert']} */ ;
    /** @type {__VLS_StyleScopedClasses['alert-error']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.error);
}
// @ts-ignore
[error, error,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    setup: function () { return (__VLS_exposed); },
    __typeEmits: {},
    __typeProps: {},
});
exports.default = {};
