"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTitleSuggestionPrompt = exports.copySessionForCoach = exports.generateAnalysisText = void 0;
var formatDate = function (dateStr) {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    });
};
var formatDuration = function (min) {
    var h = Math.floor(min / 60);
    var m = min % 60;
    if (h === 0)
        return "".concat(m, " min");
    if (m === 0)
        return "".concat(h, "h");
    return "".concat(h, "h").concat(m.toString().padStart(2, '0'));
};
var formatLapDuration = function (seconds) {
    var min = Math.floor(seconds / 60);
    var sec = seconds % 60;
    return "".concat(min, "'").concat(sec.toString().padStart(2, '0'), "\"");
};
var formatSpeed = function (metersPerSec, sport) {
    var kmh = metersPerSec * 3.6;
    if (sport === 'running') {
        var paceMinPerKm = 60 / kmh;
        var paceMin = Math.floor(paceMinPerKm);
        var paceSec = Math.round((paceMinPerKm - paceMin) * 60);
        return "".concat(paceMin, "'").concat(paceSec.toString().padStart(2, '0'), "\"/km");
    }
    return "".concat(kmh.toFixed(1), " km/h");
};
var generateAnalysisText = function (s, comment, athleteProfile) {
    var sportName = s.sport === 'cycling' ? 'Vélo' : s.sport === 'mtb' ? 'VTT' : s.sport === 'running' ? 'Course à pied' : 'Renforcement';
    var text = "## S\u00E9ance d'entra\u00EEnement \u00E0 analyser\n\n**Sport:** ".concat(sportName, "\n**Titre:** ").concat(s.title, "\n**Date:** ").concat(formatDate(s.date), "\n**Dur\u00E9e:** ").concat(formatDuration(s.duration_min));
    if (s.actual_km) {
        text += "\n**Distance:** ".concat(s.actual_km, " km");
    }
    if (s.actual_elevation) {
        text += "\n**D\u00E9nivel\u00E9:** ".concat(s.actual_elevation, " m D+");
    }
    if (s.actual_km && s.duration_min > 0) {
        var hours = s.duration_min / 60;
        var avgSpeed = (s.actual_km / hours).toFixed(1);
        if (s.sport === 'cycling') {
            text += "\n**Vitesse moyenne:** ".concat(avgSpeed, " km/h");
        }
        else if (s.sport === 'running') {
            var paceMin = Math.floor(60 / parseFloat(avgSpeed));
            var paceSec = Math.round((60 / parseFloat(avgSpeed) - paceMin) * 60);
            text += "\n**Allure moyenne:** ".concat(paceMin, "'").concat(paceSec.toString().padStart(2, '0'), "\" /km");
        }
    }
    if (s.average_heartrate || s.max_heartrate) {
        text += "\n\n**Fr\u00E9quence cardiaque:**";
        if (s.average_heartrate)
            text += "\n- Moyenne: ".concat(Math.round(s.average_heartrate), " bpm");
        if (s.max_heartrate)
            text += "\n- Max: ".concat(Math.round(s.max_heartrate), " bpm");
    }
    // Enhanced power section with cycling metrics
    if (s.average_watts || s.max_watts || s.normalized_power) {
        text += "\n\n**Puissance:**";
        if (s.average_watts)
            text += "\n- Moyenne: ".concat(Math.round(s.average_watts), " W");
        if (s.normalized_power)
            text += "\n- Puissance Normalis\u00E9e (NP): ".concat(Math.round(s.normalized_power), " W");
        if (s.max_watts)
            text += "\n- Max: ".concat(Math.round(s.max_watts), " W");
        if (s.device_watts !== undefined) {
            text += "\n- Source: ".concat(s.device_watts ? 'Capteur de puissance' : 'Estimation');
        }
    }
    // Cycling/MTB advanced metrics
    if ((s.sport === 'cycling' || s.sport === 'mtb') &&
        (s.intensity_factor || s.variability_index || s.aerobic_decoupling !== undefined || s.average_vam)) {
        text += "\n\n**M\u00E9triques avanc\u00E9es:**";
        if (s.intensity_factor) {
            text += "\n- Intensity Factor (IF): ".concat(s.intensity_factor.toFixed(2));
            if (athleteProfile === null || athleteProfile === void 0 ? void 0 : athleteProfile.ftp) {
                text += " (bas\u00E9 sur FTP ".concat(athleteProfile.ftp, "W)");
            }
        }
        if (s.variability_index) {
            var viComment = s.variability_index > 1.05 ? ' (effort variable)' : ' (effort régulier)';
            text += "\n- Variability Index (VI): ".concat(s.variability_index.toFixed(2)).concat(viComment);
        }
        if (s.aerobic_decoupling !== undefined) {
            var decouplingComment = s.aerobic_decoupling > 5 ? ' (dérive cardiaque élevée)' : ' (bonne endurance aérobie)';
            text += "\n- D\u00E9couplage a\u00E9robie: ".concat(s.aerobic_decoupling.toFixed(1), "%").concat(decouplingComment);
        }
        if (s.average_vam) {
            text += "\n- VAM moyen: ".concat(s.average_vam, " m/h");
        }
    }
    // Effort/Energy metrics
    if (s.suffer_score || s.kilojoules || s.calories) {
        text += "\n\n**Effort/\u00C9nergie:**";
        if (s.suffer_score)
            text += "\n- Effort relatif (Strava): ".concat(s.suffer_score);
        if (s.kilojoules)
            text += "\n- Travail: ".concat(Math.round(s.kilojoules), " kJ");
        if (s.calories)
            text += "\n- Calories: ".concat(s.calories, " kcal");
    }
    if (s.average_cadence) {
        text += "\n**Cadence moyenne:** ".concat(Math.round(s.average_cadence), " ").concat(s.sport === 'running' ? 'ppm' : 'rpm');
    }
    if (s.description) {
        text += "\n\n**Description:**\n".concat(s.description);
    }
    if (s.laps && s.laps.length > 0) {
        text += "\n\n**Intervalles/Tours (".concat(s.laps.length, "):**");
        s.laps.forEach(function (lap, i) {
            var distKm = (lap.distance / 1000).toFixed(2);
            var lapText = "\n".concat(i + 1, ". ").concat(lap.name, " - ").concat(formatLapDuration(lap.moving_time), ", ").concat(distKm, " km");
            lapText += ", ".concat(formatSpeed(lap.average_speed, s.sport));
            if (lap.average_heartrate)
                lapText += ", ".concat(Math.round(lap.average_heartrate), " bpm");
            if (lap.average_watts)
                lapText += ", ".concat(Math.round(lap.average_watts), " W");
            if (lap.total_elevation_gain)
                lapText += ", ".concat(Math.round(lap.total_elevation_gain), "m D+");
            text += lapText;
        });
    }
    if (s.structure && s.structure.length > 0) {
        text += "\n\n**Structure de la s\u00E9ance:**";
        s.structure.forEach(function (phase, i) {
            var phaseText = "\n".concat(i + 1, ". ").concat(phase.phase, " - ").concat(phase.min, " min");
            if (phase.reps && phase.reps > 1) {
                phaseText += " (x".concat(phase.reps, ")");
            }
            if (phase.ftp_pct) {
                phaseText += " @ ".concat(phase.ftp_pct[0], "-").concat(phase.ftp_pct[1], "% FTP");
            }
            else if (phase.hr_max_pct) {
                phaseText += " @ ".concat(phase.hr_max_pct[0], "-").concat(phase.hr_max_pct[1], "% FCmax");
            }
            text += phaseText;
        });
    }
    // Athlete profile context (if available)
    if (athleteProfile && (athleteProfile.ftp || athleteProfile.max_hr || athleteProfile.resting_hr)) {
        text += "\n\n**Profil athl\u00E8te:**";
        if (athleteProfile.ftp)
            text += "\n- FTP: ".concat(athleteProfile.ftp, " W");
        if (athleteProfile.max_hr)
            text += "\n- FC Max: ".concat(athleteProfile.max_hr, " bpm");
        if (athleteProfile.resting_hr)
            text += "\n- FC Repos: ".concat(athleteProfile.resting_hr, " bpm");
    }
    // Ajouter le commentaire de l'utilisateur s'il existe
    if (comment === null || comment === void 0 ? void 0 : comment.trim()) {
        text += "\n\n**\uD83D\uDCAC Ressenti :** ".concat(comment.trim());
    }
    text += "\n\n---\n**Format de r\u00E9ponse demand\u00E9 :**\n\n**PARTIE 1 - Bilan (Markdown brut, commence par ## sans rien avant) :**\n\n## Bilan de la s\u00E9ance\n\n### \u26A1 Charge\n[L\u00E9g\u00E8re/Mod\u00E9r\u00E9e/Intense] - [commentaire bref]\n\n### \u2705 Points positifs\n- [point 1]\n- [point 2]\n\n### \u26A0\uFE0F \u00C0 am\u00E9liorer\n- [point 1]\n- [point 2]\n\n### \uD83D\uDCA1 Conseil\n[1 conseil actionnable pour la prochaine s\u00E9ance]\n\n---\n\n**PARTIE 2 - Suggestions pour Strava (texte simple, PAS de markdown) :**\n\n\uD83C\uDFAD IMPORTANT : Sois DR\u00D4LE et CR\u00C9ATIF ! Je partage sur Strava avec beaucoup de followers.\nLes titres/descriptions doivent faire sourire : autod\u00E9rision, jeux de mots, r\u00E9f\u00E9rences pop culture, humour sur la souffrance...\n\nPropose 3 variantes de titre + description :\n\n1. **Sobre mais malin** (sans emoji, humour subtil)\nTitre:\nDescription:\n\n2. **Fun et d\u00E9cal\u00E9** (1-2 emojis, ton l\u00E9ger)\nTitre:\nDescription:\n\n3. **Full entertainment** (plusieurs emojis, assum\u00E9 dr\u00F4le)\nTitre:\nDescription:";
    return text;
};
exports.generateAnalysisText = generateAnalysisText;
var copySessionForCoach = function (session, comment, athleteProfile) { return __awaiter(void 0, void 0, void 0, function () {
    var text;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                text = (0, exports.generateAnalysisText)(session, comment, athleteProfile);
                return [4 /*yield*/, navigator.clipboard.writeText(text)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.copySessionForCoach = copySessionForCoach;
var generateTitleSuggestionPrompt = function (s) {
    // Réutilise le texte d'analyse mais avec une instruction différente
    var baseText = (0, exports.generateAnalysisText)(s);
    // Remplace l'instruction finale
    var withoutInstruction = baseText.split('\n\n---')[0];
    return withoutInstruction + "\n\n---\n**Propose-moi un titre et une description pour cette s\u00E9ance.**\n\nFormat :\n**Titre:** [court, ex: \"Intervalles 5x1km\" ou \"Sortie longue Z2\"]\n**Description:** [2-3 lignes d\u00E9crivant le type de s\u00E9ance et l'intensit\u00E9]";
};
exports.generateTitleSuggestionPrompt = generateTitleSuggestionPrompt;
