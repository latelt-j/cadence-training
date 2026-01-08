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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var vue_1 = require("vue");
var useSessions_1 = require("./composables/useSessions");
var useStrava_1 = require("./composables/useStrava");
var useSupabase_1 = require("./composables/useSupabase");
var FileImport_vue_1 = require("./components/FileImport.vue");
var WeekCalendar_vue_1 = require("./components/WeekCalendar.vue");
var SessionDetailModal_vue_1 = require("./components/SessionDetailModal.vue");
var WeeklyStats_vue_1 = require("./components/WeeklyStats.vue");
var VolumeChart_vue_1 = require("./components/VolumeChart.vue");
var WellnessWidget_vue_1 = require("./components/WellnessWidget.vue");
var ObjectiveSettings_vue_1 = require("./components/ObjectiveSettings.vue");
var AthleteProfile_vue_1 = require("./components/AthleteProfile.vue");
var TrainingPhasesManager_vue_1 = require("./components/TrainingPhasesManager.vue");
var ShareWeekModal_vue_1 = require("./components/ShareWeekModal.vue");
var coach_1 = require("./utils/coach");
var _b = (0, useSessions_1.useSessions)(), sessions = _b.sessions, initSessions = _b.init, loadFromJson = _b.loadFromJson, addSession = _b.addSession, updateSessionDate = _b.updateSessionDate, updateSessionFeedback = _b.updateSessionFeedback, updateSession = _b.updateSession, removeSession = _b.removeSession, reset = _b.reset, weeklyStats = _b.weeklyStats, setCurrentWeek = _b.setCurrentWeek, currentWeekDate = _b.currentWeekDate;
// Import modal
var showImportModal = (0, vue_1.ref)(false);
var fileImportRef = (0, vue_1.ref)(null);
var closeImportModal = function () {
    var _a;
    showImportModal.value = false;
    (_a = fileImportRef.value) === null || _a === void 0 ? void 0 : _a.resetForm();
};
// Strava disconnect modal
var showStravaDisconnectModal = (0, vue_1.ref)(false);
// Share week modal
var showShareModal = (0, vue_1.ref)(false);
// Compute week start from currentWeekDate
var getMonday = function (d) {
    var date = new Date(d);
    var day = date.getDay();
    var diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setDate(diff);
    date.setHours(0, 0, 0, 0);
    return date;
};
var weekStart = (0, vue_1.computed)(function () { return getMonday(currentWeekDate.value); });
var _c = (0, useStrava_1.useStrava)(), stravaConnected = _c.isConnected, stravaLoading = _c.isLoading, stravaAuthorize = _c.authorize, stravaHandleCallback = _c.handleCallback, fetchActivities = _c.fetchActivities, fetchActivitiesWithMetrics = _c.fetchActivitiesWithMetrics, convertToSessions = _c.convertToSessions, resyncActivity = _c.resyncActivity, stravaDisconnect = _c.disconnect;
// Training phases & objectives & athlete profile
var _d = (0, useSupabase_1.useSupabase)(), fetchSettings = _d.fetchSettings, updateSettings = _d.updateSettings;
var trainingPhases = (0, vue_1.ref)([]);
var trainingObjectives = (0, vue_1.ref)([]);
var showObjectivesModal = (0, vue_1.ref)(false);
var showPhasesModal = (0, vue_1.ref)(false);
var athleteProfile = (0, vue_1.ref)({});
var showAthleteProfileModal = (0, vue_1.ref)(false);
// Track new sessions for animation
var newSessionIds = (0, vue_1.ref)(new Set());
var spotlightSession = (0, vue_1.ref)(null);
var toastMessage = (0, vue_1.ref)(null);
var toastType = (0, vue_1.ref)('success');
var spotlightCardRef = (0, vue_1.ref)(null);
// Spotlight comment modal
var showSpotlightComment = (0, vue_1.ref)(false);
var spotlightComment = (0, vue_1.ref)('');
// 3D mouse effect for spotlight card
var onSpotlightMouseMove = function (e) {
    if (!spotlightCardRef.value)
        return;
    var card = spotlightCardRef.value;
    var rect = card.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    var centerX = rect.width / 2;
    var centerY = rect.height / 2;
    var rotateX = (y - centerY) / 10;
    var rotateY = (centerX - x) / 10;
    card.style.transform = "perspective(1000px) rotateX(".concat(rotateX, "deg) rotateY(").concat(rotateY, "deg)");
};
var onSpotlightMouseLeave = function () {
    if (!spotlightCardRef.value)
        return;
    spotlightCardRef.value.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
};
// Show spotlight for new session
var showSpotlight = function (session) {
    spotlightSession.value = session;
    newSessionIds.value = new Set([session.id]);
};
var closeSpotlight = function () {
    // Afficher la modal de commentaire au lieu de copier directement
    showSpotlightComment.value = true;
};
var confirmSpotlightCopy = function (withComment) { return __awaiter(void 0, void 0, void 0, function () {
    var comment;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!spotlightSession.value) return [3 /*break*/, 2];
                comment = withComment ? spotlightComment.value : undefined;
                return [4 /*yield*/, (0, coach_1.copySessionForCoach)(spotlightSession.value, comment, athleteProfile.value)];
            case 1:
                _a.sent();
                showToast('Séance copiée ! Envoie-la à ton coach 🏋️');
                _a.label = 2;
            case 2:
                // Reset tout
                showSpotlightComment.value = false;
                spotlightComment.value = '';
                spotlightSession.value = null;
                // Keep the calendar glow for a bit longer
                setTimeout(function () {
                    newSessionIds.value = new Set();
                }, 3000);
                return [2 /*return*/];
        }
    });
}); };
var showToast = function (message, type) {
    if (type === void 0) { type = 'success'; }
    toastMessage.value = message;
    toastType.value = type;
    setTimeout(function () {
        toastMessage.value = null;
    }, 3000);
};
// Handle OAuth callbacks and init
(0, vue_1.onMounted)(function () { return __awaiter(void 0, void 0, void 0, function () {
    var settings, e_1, urlParams, code, state, success;
    var _a, _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0: 
            // Init sessions from Supabase
            return [4 /*yield*/, initSessions()
                // Load training phases & objectives & athlete profile from settings
            ];
            case 1:
                // Init sessions from Supabase
                _e.sent();
                _e.label = 2;
            case 2:
                _e.trys.push([2, 4, , 5]);
                return [4 /*yield*/, fetchSettings()];
            case 3:
                settings = _e.sent();
                if (settings === null || settings === void 0 ? void 0 : settings.training_phases) {
                    trainingPhases.value = settings.training_phases;
                }
                if (settings === null || settings === void 0 ? void 0 : settings.training_objectives) {
                    // Add default priority for old objectives without it
                    trainingObjectives.value = settings.training_objectives.map(function (obj) { return (__assign(__assign({}, obj), { priority: obj.priority || 'A' })); });
                }
                // Load athlete profile
                if ((settings === null || settings === void 0 ? void 0 : settings.ftp) || (settings === null || settings === void 0 ? void 0 : settings.max_hr) || (settings === null || settings === void 0 ? void 0 : settings.resting_hr) || (settings === null || settings === void 0 ? void 0 : settings.environment)) {
                    athleteProfile.value = {
                        ftp: (_a = settings.ftp) !== null && _a !== void 0 ? _a : undefined,
                        max_hr: (_b = settings.max_hr) !== null && _b !== void 0 ? _b : undefined,
                        resting_hr: (_c = settings.resting_hr) !== null && _c !== void 0 ? _c : undefined,
                        environment: (_d = settings.environment) !== null && _d !== void 0 ? _d : undefined,
                    };
                }
                return [3 /*break*/, 5];
            case 4:
                e_1 = _e.sent();
                console.error('Error loading settings:', e_1);
                return [3 /*break*/, 5];
            case 5:
                urlParams = new URLSearchParams(window.location.search);
                code = urlParams.get('code');
                state = urlParams.get('state');
                if (!(code && state !== 'google')) return [3 /*break*/, 9];
                return [4 /*yield*/, stravaHandleCallback(code)
                    // Auto-sync after successful Strava connection
                ];
            case 6:
                success = _e.sent();
                if (!success) return [3 /*break*/, 8];
                return [4 /*yield*/, syncStrava()];
            case 7:
                _e.sent();
                _e.label = 8;
            case 8:
                // Clean URL
                window.history.replaceState({}, document.title, window.location.pathname);
                _e.label = 9;
            case 9:
                // Global escape key handler for modals
                document.addEventListener('keydown', handleGlobalEscape);
                return [2 /*return*/];
        }
    });
}); });
// Close any open modal on Escape
var handleGlobalEscape = function (e) {
    if (e.key === 'Escape') {
        if (showImportModal.value)
            closeImportModal();
        else if (showStravaDisconnectModal.value)
            showStravaDisconnectModal.value = false;
        else if (showObjectivesModal.value)
            showObjectivesModal.value = false;
        else if (showPhasesModal.value)
            showPhasesModal.value = false;
        else if (showAthleteProfileModal.value)
            showAthleteProfileModal.value = false;
        else if (selectedSession.value)
            selectedSession.value = null;
    }
};
(0, vue_1.onUnmounted)(function () {
    document.removeEventListener('keydown', handleGlobalEscape);
});
// Strava sync - only fetch details for NEW activities
var syncStrava = function () { return __awaiter(void 0, void 0, void 0, function () {
    var basicActivities, existingStravaIds, newActivities, detailedActivities, sessionsToAdd, added, replacedPlanned, newIds, _loop_1, _i, sessionsToAdd_1, _a, session, date, lastNewSession, msg;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, fetchActivities(30)
                // Filter to only new activities (not already in sessions) - use strava_id for dedup
            ];
            case 1:
                basicActivities = _b.sent();
                existingStravaIds = new Set(sessions.value
                    .filter(function (s) { return s.type === 'strava' && s.strava_id; })
                    .map(function (s) { return s.strava_id; }));
                newActivities = basicActivities.filter(function (activity) {
                    return !existingStravaIds.has(activity.id);
                });
                // Only fetch detailed data for new activities (no unnecessary API calls)
                if (newActivities.length === 0) {
                    alert('Aucune nouvelle activité');
                    return [2 /*return*/];
                }
                return [4 /*yield*/, fetchActivitiesWithMetrics(30, newActivities, athleteProfile.value)];
            case 2:
                detailedActivities = _b.sent();
                sessionsToAdd = convertToSessions(detailedActivities);
                added = 0;
                replacedPlanned = 0;
                newIds = [];
                _loop_1 = function (session, date) {
                    var plannedSameSport, sessionToAdd, lastSession;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                plannedSameSport = sessions.value.find(function (s) { return s.date === date && s.sport === session.sport && s.type !== 'strava'; });
                                sessionToAdd = __assign({}, session);
                                if (!plannedSameSport) return [3 /*break*/, 2];
                                sessionToAdd.planned_title = plannedSameSport.title;
                                sessionToAdd.planned_description = plannedSameSport.description;
                                // Conserver l'intensité prévue
                                if (plannedSameSport.intensity) {
                                    sessionToAdd.intensity = plannedSameSport.intensity;
                                }
                                return [4 /*yield*/, removeSession(plannedSameSport.id)];
                            case 1:
                                _c.sent();
                                replacedPlanned++;
                                _c.label = 2;
                            case 2: return [4 /*yield*/, addSession(sessionToAdd, date)];
                            case 3:
                                _c.sent();
                                lastSession = sessions.value[sessions.value.length - 1];
                                if (lastSession) {
                                    newIds.push(lastSession.id);
                                }
                                added++;
                                return [2 /*return*/];
                        }
                    });
                };
                _i = 0, sessionsToAdd_1 = sessionsToAdd;
                _b.label = 3;
            case 3:
                if (!(_i < sessionsToAdd_1.length)) return [3 /*break*/, 6];
                _a = sessionsToAdd_1[_i], session = _a.session, date = _a.date;
                return [5 /*yield**/, _loop_1(session, date)];
            case 4:
                _b.sent();
                _b.label = 5;
            case 5:
                _i++;
                return [3 /*break*/, 3];
            case 6:
                // Trigger spotlight for new sessions
                if (newIds.length > 0) {
                    lastNewSession = sessions.value.find(function (s) { return s.id === newIds[newIds.length - 1]; });
                    if (lastNewSession) {
                        showSpotlight(lastNewSession);
                    }
                }
                if (added > 0) {
                    msg = ["".concat(added, " activit\u00E9(s) ajout\u00E9e(s)")];
                    if (replacedPlanned > 0) {
                        msg.push("".concat(replacedPlanned, " s\u00E9ance(s) pr\u00E9vue(s) remplac\u00E9e(s)"));
                    }
                    alert("Strava : ".concat(msg.join(', ')));
                }
                return [2 /*return*/];
        }
    });
}); };
// Modal states
var selectedSession = (0, vue_1.ref)(null);
var sessionDetailModalRef = (0, vue_1.ref)(null);
// Dark mode only
document.documentElement.setAttribute('data-theme', 'dracula');
// Handlers
var handleImport = function (data, replaceExisting, _phase) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, loadFromJson(data, replaceExisting)
                // Note: phases are now managed manually via TrainingPhasesManager, not auto-created from import
            ];
            case 1:
                _a.sent();
                // Note: phases are now managed manually via TrainingPhasesManager, not auto-created from import
                showImportModal.value = false;
                return [2 /*return*/];
        }
    });
}); };
var handleUpdateDate = function (sessionId, newDate) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, updateSessionDate(sessionId, newDate)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var handleSelectSession = function (session) {
    selectedSession.value = session;
};
var handleSaveObjectives = function (objectives) { return __awaiter(void 0, void 0, void 0, function () {
    var e_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                trainingObjectives.value = objectives;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, updateSettings({ training_objectives: objectives })];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                e_2 = _a.sent();
                console.error('Error saving objectives:', e_2);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
var handleSaveAthleteProfile = function (profile) { return __awaiter(void 0, void 0, void 0, function () {
    var e_3;
    var _a, _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                athleteProfile.value = profile;
                _e.label = 1;
            case 1:
                _e.trys.push([1, 3, , 4]);
                return [4 /*yield*/, updateSettings({
                        ftp: (_a = profile.ftp) !== null && _a !== void 0 ? _a : null,
                        max_hr: (_b = profile.max_hr) !== null && _b !== void 0 ? _b : null,
                        resting_hr: (_c = profile.resting_hr) !== null && _c !== void 0 ? _c : null,
                        environment: (_d = profile.environment) !== null && _d !== void 0 ? _d : null,
                    })];
            case 2:
                _e.sent();
                showToast('Profil sauvegarde');
                return [3 /*break*/, 4];
            case 3:
                e_3 = _e.sent();
                console.error('Error saving athlete profile:', e_3);
                showToast('Erreur de sauvegarde', 'error');
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
var handleSavePhases = function (phases) { return __awaiter(void 0, void 0, void 0, function () {
    var e_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                trainingPhases.value = phases;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, updateSettings({ training_phases: phases })];
            case 2:
                _a.sent();
                showToast('Cycles sauvegardés');
                return [3 /*break*/, 4];
            case 3:
                e_4 = _a.sent();
                console.error('Error saving phases:', e_4);
                showToast('Erreur de sauvegarde', 'error');
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
var handleDeleteSession = function (sessionId) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, removeSession(sessionId)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var handleUpdateFeedback = function (sessionId, feedback) { return __awaiter(void 0, void 0, void 0, function () {
    var success;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, updateSessionFeedback(sessionId, feedback)];
            case 1:
                success = _a.sent();
                if (!success) {
                    showToast('Erreur de sauvegarde, réessayez');
                }
                return [2 /*return*/, success];
        }
    });
}); };
var handleUpdateSession = function (sessionId, updates) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, updateSession(sessionId, updates)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var handleResyncSession = function (sessionId, stravaId) { return __awaiter(void 0, void 0, void 0, function () {
    var newData, existingSession;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, resyncActivity(stravaId, athleteProfile.value)];
            case 1:
                newData = _b.sent();
                if (!newData) return [3 /*break*/, 4];
                existingSession = sessions.value.find(function (s) { return s.id === sessionId; });
                if (!existingSession) return [3 /*break*/, 3];
                return [4 /*yield*/, updateSession(sessionId, __assign(__assign({}, newData), { 
                        // Preserve these fields
                        planned_title: existingSession.planned_title, planned_description: existingSession.planned_description, coach_feedback: existingSession.coach_feedback }))
                    // Update selectedSession to reflect changes
                ];
            case 2:
                _b.sent();
                // Update selectedSession to reflect changes
                selectedSession.value = sessions.value.find(function (s) { return s.id === sessionId; }) || null;
                showToast('Metriques mises a jour');
                _b.label = 3;
            case 3: return [3 /*break*/, 5];
            case 4:
                showToast('Erreur lors de la synchronisation', 'error');
                _b.label = 5;
            case 5:
                (_a = sessionDetailModalRef.value) === null || _a === void 0 ? void 0 : _a.onResyncComplete();
                return [2 /*return*/];
        }
    });
}); };
var handleReset = function () {
    if (confirm('Réinitialiser toutes les données ?')) {
        reset();
    }
};
var __VLS_ctx = __assign(__assign({}, {}), {});
var ___VLS_components;
var ___VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "min-h-screen app-bg pb-20 md:pb-0" }));
/** @type {__VLS_StyleScopedClasses['min-h-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['app-bg']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-20']} */ ;
/** @type {__VLS_StyleScopedClasses['md:pb-0']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.header, __VLS_intrinsics.header)(__assign({ class: "sticky top-0 z-50 border-b border-base-300/50 bg-base-100/80 backdrop-blur-lg hidden md:block" }));
/** @type {__VLS_StyleScopedClasses['sticky']} */ ;
/** @type {__VLS_StyleScopedClasses['top-0']} */ ;
/** @type {__VLS_StyleScopedClasses['z-50']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['border-base-300/50']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-base-100/80']} */ ;
/** @type {__VLS_StyleScopedClasses['backdrop-blur-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['md:block']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "container mx-auto max-w-6xl px-4" }));
/** @type {__VLS_StyleScopedClasses['container']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-6xl']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex h-16 items-center justify-between" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-16']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center gap-3" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center" }));
/** @type {__VLS_StyleScopedClasses['w-9']} */ ;
/** @type {__VLS_StyleScopedClasses['h-9']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-br']} */ ;
/** @type {__VLS_StyleScopedClasses['from-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['to-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-lg" }));
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-xl font-bold tracking-tight" }));
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-tight']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center gap-2" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
if (__VLS_ctx.stravaConnected) {
    __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign(__assign({ onClick: (__VLS_ctx.syncStrava) }, { class: "btn btn-sm btn-ghost gap-2 hover:bg-pink-500/20 hover:text-pink-400" }), { class: ({ 'loading': __VLS_ctx.stravaLoading }) }), { disabled: (__VLS_ctx.stravaLoading) }));
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-pink-500/20']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:text-pink-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['loading']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "w-2 h-2 rounded-full bg-[#fc4c02]" }));
    /** @type {__VLS_StyleScopedClasses['w-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-[#fc4c02]']} */ ;
    if (!__VLS_ctx.stravaLoading) {
        __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: (__VLS_ctx.stravaAuthorize) }, { class: "btn btn-sm btn-ghost gap-2 hover:bg-pink-500/20 hover:text-pink-400" }));
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-pink-500/20']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:text-pink-400']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "w-2 h-2 rounded-full bg-base-content/30" }));
    /** @type {__VLS_StyleScopedClasses['w-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-base-content/30']} */ ;
}
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "w-px h-6 bg-base-300" }));
/** @type {__VLS_StyleScopedClasses['w-px']} */ ;
/** @type {__VLS_StyleScopedClasses['h-6']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-base-300']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.showObjectivesModal = true;
        // @ts-ignore
        [stravaConnected, syncStrava, stravaLoading, stravaLoading, stravaLoading, stravaAuthorize, showObjectivesModal,];
    } }, { class: "btn btn-sm btn-ghost gap-1 hover:bg-pink-500/20 hover:text-pink-400" }));
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-pink-500/20']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-pink-400']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.showPhasesModal = true;
        // @ts-ignore
        [showPhasesModal,];
    } }, { class: "btn btn-sm btn-ghost gap-1 hover:bg-pink-500/20 hover:text-pink-400" }));
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-pink-500/20']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-pink-400']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.showAthleteProfileModal = true;
        // @ts-ignore
        [showAthleteProfileModal,];
    } }, { class: "btn btn-sm btn-ghost gap-1 hover:bg-pink-500/20 hover:text-pink-400" }));
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-pink-500/20']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-pink-400']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "w-px h-6 bg-base-300" }));
/** @type {__VLS_StyleScopedClasses['w-px']} */ ;
/** @type {__VLS_StyleScopedClasses['h-6']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-base-300']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "dropdown dropdown-end" }));
/** @type {__VLS_StyleScopedClasses['dropdown']} */ ;
/** @type {__VLS_StyleScopedClasses['dropdown-end']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ tabindex: "0" }, { class: "btn btn-sm btn-ghost btn-square hover:bg-pink-500/20 hover:text-pink-400" }));
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-square']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-pink-500/20']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-pink-400']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.svg, __VLS_intrinsics.svg)(__assign(__assign({ xmlns: "http://www.w3.org/2000/svg" }, { class: "h-5 w-5" }), { fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }));
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.path)({
    'stroke-linecap': "round",
    'stroke-linejoin': "round",
    'stroke-width': "2",
    d: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
});
__VLS_asFunctionalElement(__VLS_intrinsics.path)({
    'stroke-linecap': "round",
    'stroke-linejoin': "round",
    'stroke-width': "2",
    d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z",
});
__VLS_asFunctionalElement(__VLS_intrinsics.ul, __VLS_intrinsics.ul)(__assign({ tabindex: "0" }, { class: "dropdown-content menu bg-base-100 rounded-xl z-50 w-52 p-2 shadow-xl mt-2 border border-base-300" }));
/** @type {__VLS_StyleScopedClasses['dropdown-content']} */ ;
/** @type {__VLS_StyleScopedClasses['menu']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-base-100']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['z-50']} */ ;
/** @type {__VLS_StyleScopedClasses['w-52']} */ ;
/** @type {__VLS_StyleScopedClasses['p-2']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-base-300']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
__VLS_asFunctionalElement(__VLS_intrinsics.a, __VLS_intrinsics.a)(__assign({ onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.showImportModal = true;
        // @ts-ignore
        [showImportModal,];
    } }, { class: "rounded-lg" }));
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
if (__VLS_ctx.stravaConnected) {
    __VLS_asFunctionalElement(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
    __VLS_asFunctionalElement(__VLS_intrinsics.a, __VLS_intrinsics.a)(__assign({ onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!(__VLS_ctx.stravaConnected))
                return;
            __VLS_ctx.showStravaDisconnectModal = true;
            // @ts-ignore
            [stravaConnected, showStravaDisconnectModal,];
        } }, { class: "text-error rounded-lg" }));
    /** @type {__VLS_StyleScopedClasses['text-error']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
}
__VLS_asFunctionalElement(__VLS_intrinsics.li, __VLS_intrinsics.li)(__assign({ class: "border-t border-base-300 mt-1 pt-1" }));
/** @type {__VLS_StyleScopedClasses['border-t']} */ ;
/** @type {__VLS_StyleScopedClasses['border-base-300']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-1']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.a, __VLS_intrinsics.a)(__assign({ onClick: (__VLS_ctx.handleReset) }, { class: "text-error rounded-lg" }));
/** @type {__VLS_StyleScopedClasses['text-error']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.header, __VLS_intrinsics.header)(__assign({ class: "sticky top-0 z-50 border-b border-base-300/50 bg-base-100/80 backdrop-blur-lg md:hidden" }));
/** @type {__VLS_StyleScopedClasses['sticky']} */ ;
/** @type {__VLS_StyleScopedClasses['top-0']} */ ;
/** @type {__VLS_StyleScopedClasses['z-50']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['border-base-300/50']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-base-100/80']} */ ;
/** @type {__VLS_StyleScopedClasses['backdrop-blur-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['md:hidden']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex h-14 items-center justify-between px-4" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-14']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center gap-2" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center" }));
/** @type {__VLS_StyleScopedClasses['w-8']} */ ;
/** @type {__VLS_StyleScopedClasses['h-8']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-br']} */ ;
/** @type {__VLS_StyleScopedClasses['from-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['to-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-base" }));
/** @type {__VLS_StyleScopedClasses['text-base']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-lg font-bold tracking-tight" }));
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-tight']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.nav, __VLS_intrinsics.nav)(__assign({ class: "md:hidden fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-300 z-50 safe-area-bottom" }));
/** @type {__VLS_StyleScopedClasses['md:hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['fixed']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-0']} */ ;
/** @type {__VLS_StyleScopedClasses['left-0']} */ ;
/** @type {__VLS_StyleScopedClasses['right-0']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-base-100']} */ ;
/** @type {__VLS_StyleScopedClasses['border-t']} */ ;
/** @type {__VLS_StyleScopedClasses['border-base-300']} */ ;
/** @type {__VLS_StyleScopedClasses['z-50']} */ ;
/** @type {__VLS_StyleScopedClasses['safe-area-bottom']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex justify-around py-2" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-around']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign({ onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.stravaConnected ? __VLS_ctx.syncStrava() : __VLS_ctx.stravaAuthorize();
        // @ts-ignore
        [stravaConnected, syncStrava, stravaAuthorize, handleReset,];
    } }, { class: "flex flex-col items-center gap-0.5 px-3 py-1" }), { class: (__VLS_ctx.stravaLoading ? 'opacity-50' : '') }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-0.5']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-xl" }, { class: (__VLS_ctx.stravaConnected ? 'text-[#fc4c02]' : '') }));
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
(__VLS_ctx.stravaLoading ? '⏳' : '🔄');
__VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-[10px] text-base-content/70" }));
/** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-base-content/70']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.showObjectivesModal = true;
        // @ts-ignore
        [stravaConnected, stravaLoading, stravaLoading, showObjectivesModal,];
    } }, { class: "flex flex-col items-center gap-0.5 px-3 py-1" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-0.5']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-xl" }));
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-[10px] text-base-content/70" }));
/** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-base-content/70']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.showAthleteProfileModal = true;
        // @ts-ignore
        [showAthleteProfileModal,];
    } }, { class: "flex flex-col items-center gap-0.5 px-3 py-1" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-0.5']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-xl" }));
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-[10px] text-base-content/70" }));
/** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-base-content/70']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "dropdown dropdown-top dropdown-end" }));
/** @type {__VLS_StyleScopedClasses['dropdown']} */ ;
/** @type {__VLS_StyleScopedClasses['dropdown-top']} */ ;
/** @type {__VLS_StyleScopedClasses['dropdown-end']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ tabindex: "0" }, { class: "flex flex-col items-center gap-0.5 px-3 py-1" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-0.5']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-xl" }));
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-[10px] text-base-content/70" }));
/** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-base-content/70']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.ul, __VLS_intrinsics.ul)(__assign({ tabindex: "0" }, { class: "dropdown-content menu bg-base-100 rounded-box z-50 w-52 p-2 shadow-xl mb-2 border border-base-300" }));
/** @type {__VLS_StyleScopedClasses['dropdown-content']} */ ;
/** @type {__VLS_StyleScopedClasses['menu']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-base-100']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-box']} */ ;
/** @type {__VLS_StyleScopedClasses['z-50']} */ ;
/** @type {__VLS_StyleScopedClasses['w-52']} */ ;
/** @type {__VLS_StyleScopedClasses['p-2']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-base-300']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
__VLS_asFunctionalElement(__VLS_intrinsics.a, __VLS_intrinsics.a)(__assign({ onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.showPhasesModal = true;
        // @ts-ignore
        [showPhasesModal,];
    } }, { class: "rounded-lg" }));
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
__VLS_asFunctionalElement(__VLS_intrinsics.a, __VLS_intrinsics.a)(__assign({ onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.showImportModal = true;
        // @ts-ignore
        [showImportModal,];
    } }, { class: "rounded-lg" }));
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
if (__VLS_ctx.stravaConnected) {
    __VLS_asFunctionalElement(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
    __VLS_asFunctionalElement(__VLS_intrinsics.a, __VLS_intrinsics.a)(__assign({ onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!(__VLS_ctx.stravaConnected))
                return;
            __VLS_ctx.showStravaDisconnectModal = true;
            // @ts-ignore
            [stravaConnected, showStravaDisconnectModal,];
        } }, { class: "text-error rounded-lg" }));
    /** @type {__VLS_StyleScopedClasses['text-error']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
}
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "container mx-auto p-4 max-w-6xl" }));
/** @type {__VLS_StyleScopedClasses['container']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-6xl']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-6" }));
/** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
var __VLS_0 = WeekCalendar_vue_1.default;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0(__assign(__assign(__assign(__assign(__assign({ 'onUpdateDate': {} }, { 'onSelectSession': {} }), { 'onWeekChange': {} }), { 'onOpenShareModal': {} }), { 'onOpenImportModal': {} }), { sessions: (__VLS_ctx.sessions), newSessionIds: (__VLS_ctx.newSessionIds), trainingPhases: (__VLS_ctx.trainingPhases) })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign(__assign(__assign(__assign(__assign({ 'onUpdateDate': {} }, { 'onSelectSession': {} }), { 'onWeekChange': {} }), { 'onOpenShareModal': {} }), { 'onOpenImportModal': {} }), { sessions: (__VLS_ctx.sessions), newSessionIds: (__VLS_ctx.newSessionIds), trainingPhases: (__VLS_ctx.trainingPhases) })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5;
var __VLS_6 = ({ updateDate: {} },
    { onUpdateDate: (__VLS_ctx.handleUpdateDate) });
var __VLS_7 = ({ selectSession: {} },
    { onSelectSession: (__VLS_ctx.handleSelectSession) });
var __VLS_8 = ({ weekChange: {} },
    { onWeekChange: (__VLS_ctx.setCurrentWeek) });
var __VLS_9 = ({ openShareModal: {} },
    { onOpenShareModal: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.showShareModal = true;
            // @ts-ignore
            [sessions, newSessionIds, trainingPhases, handleUpdateDate, handleSelectSession, setCurrentWeek, showShareModal,];
        } });
var __VLS_10 = ({ openImportModal: {} },
    { onOpenImportModal: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.showImportModal = true;
            // @ts-ignore
            [showImportModal,];
        } });
var __VLS_3;
var __VLS_4;
var __VLS_11 = WeeklyStats_vue_1.default;
// @ts-ignore
var __VLS_12 = __VLS_asFunctionalComponent(__VLS_11, new __VLS_11({
    stats: (__VLS_ctx.weeklyStats),
}));
var __VLS_13 = __VLS_12.apply(void 0, __spreadArray([{
        stats: (__VLS_ctx.weeklyStats),
    }], __VLS_functionalComponentArgsRest(__VLS_12), false));
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "grid grid-cols-1 md:grid-cols-2 gap-6" }));
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
/** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-6']} */ ;
var __VLS_16 = VolumeChart_vue_1.default;
// @ts-ignore
var __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    sessions: (__VLS_ctx.sessions),
}));
var __VLS_18 = __VLS_17.apply(void 0, __spreadArray([{
        sessions: (__VLS_ctx.sessions),
    }], __VLS_functionalComponentArgsRest(__VLS_17), false));
var __VLS_21 = WellnessWidget_vue_1.default;
// @ts-ignore
var __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({}));
var __VLS_23 = __VLS_22.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_22), false));
var __VLS_26 = SessionDetailModal_vue_1.default;
// @ts-ignore
var __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26(__assign(__assign(__assign(__assign(__assign(__assign({ 'onClose': {} }, { 'onDelete': {} }), { 'onUpdateFeedback': {} }), { 'onUpdate': {} }), { 'onResync': {} }), { 'onToast': {} }), { ref: "sessionDetailModalRef", session: (__VLS_ctx.selectedSession), athleteProfile: (__VLS_ctx.athleteProfile) })));
var __VLS_28 = __VLS_27.apply(void 0, __spreadArray([__assign(__assign(__assign(__assign(__assign(__assign({ 'onClose': {} }, { 'onDelete': {} }), { 'onUpdateFeedback': {} }), { 'onUpdate': {} }), { 'onResync': {} }), { 'onToast': {} }), { ref: "sessionDetailModalRef", session: (__VLS_ctx.selectedSession), athleteProfile: (__VLS_ctx.athleteProfile) })], __VLS_functionalComponentArgsRest(__VLS_27), false));
var __VLS_31;
var __VLS_32 = ({ close: {} },
    { onClose: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.selectedSession = null;
            // @ts-ignore
            [sessions, weeklyStats, selectedSession, selectedSession, athleteProfile,];
        } });
var __VLS_33 = ({ delete: {} },
    { onDelete: (__VLS_ctx.handleDeleteSession) });
var __VLS_34 = ({ updateFeedback: {} },
    { onUpdateFeedback: (__VLS_ctx.handleUpdateFeedback) });
var __VLS_35 = ({ update: {} },
    { onUpdate: (__VLS_ctx.handleUpdateSession) });
var __VLS_36 = ({ resync: {} },
    { onResync: (__VLS_ctx.handleResyncSession) });
var __VLS_37 = ({ toast: {} },
    { onToast: (__VLS_ctx.showToast) });
var __VLS_38 = {};
var __VLS_29;
var __VLS_30;
__VLS_asFunctionalElement(__VLS_intrinsics.dialog, __VLS_intrinsics.dialog)(__assign({ class: "modal" }, { class: ({ 'modal-open': __VLS_ctx.showImportModal }) }));
/** @type {__VLS_StyleScopedClasses['modal']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-open']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "modal-box w-full h-full max-h-full md:max-w-2xl md:h-auto md:max-h-[90vh] rounded-none md:rounded-2xl" }));
/** @type {__VLS_StyleScopedClasses['modal-box']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['max-h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['md:max-w-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['md:h-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['md:max-h-[90vh]']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-none']} */ ;
/** @type {__VLS_StyleScopedClasses['md:rounded-2xl']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: (__VLS_ctx.closeImportModal) }, { class: "btn btn-circle btn-ghost absolute right-3 top-3 text-2xl" }));
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-circle']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['right-3']} */ ;
/** @type {__VLS_StyleScopedClasses['top-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.h3, __VLS_intrinsics.h3)(__assign({ class: "font-bold text-lg mb-4 pr-10" }));
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['pr-10']} */ ;
var __VLS_40 = FileImport_vue_1.default;
// @ts-ignore
var __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40(__assign({ 'onImport': {} }, { ref: "fileImportRef", sessions: (__VLS_ctx.sessions), trainingPhases: (__VLS_ctx.trainingPhases), trainingObjectives: (__VLS_ctx.trainingObjectives), athleteProfile: (__VLS_ctx.athleteProfile) })));
var __VLS_42 = __VLS_41.apply(void 0, __spreadArray([__assign({ 'onImport': {} }, { ref: "fileImportRef", sessions: (__VLS_ctx.sessions), trainingPhases: (__VLS_ctx.trainingPhases), trainingObjectives: (__VLS_ctx.trainingObjectives), athleteProfile: (__VLS_ctx.athleteProfile) })], __VLS_functionalComponentArgsRest(__VLS_41), false));
var __VLS_45;
var __VLS_46 = ({ import: {} },
    { onImport: (__VLS_ctx.handleImport) });
var __VLS_47 = {};
var __VLS_43;
var __VLS_44;
if (((_a = __VLS_ctx.fileImportRef) === null || _a === void 0 ? void 0 : _a.step) !== 'paste') {
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "modal-action" }));
    /** @type {__VLS_StyleScopedClasses['modal-action']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: (__VLS_ctx.closeImportModal) }, { class: "btn btn-ghost" }));
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
}
__VLS_asFunctionalElement(__VLS_intrinsics.form, __VLS_intrinsics.form)(__assign(__assign({ onClick: (__VLS_ctx.closeImportModal) }, { method: "dialog" }), { class: "modal-backdrop" }));
/** @type {__VLS_StyleScopedClasses['modal-backdrop']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)({});
__VLS_asFunctionalElement(__VLS_intrinsics.dialog, __VLS_intrinsics.dialog)(__assign({ class: "modal" }, { class: ({ 'modal-open': __VLS_ctx.showStravaDisconnectModal }) }));
/** @type {__VLS_StyleScopedClasses['modal']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-open']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "modal-box w-full h-full max-h-full md:max-w-sm md:h-auto md:max-h-[90vh] rounded-none md:rounded-2xl" }));
/** @type {__VLS_StyleScopedClasses['modal-box']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['max-h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['md:max-w-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['md:h-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['md:max-h-[90vh]']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-none']} */ ;
/** @type {__VLS_StyleScopedClasses['md:rounded-2xl']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.showStravaDisconnectModal = false;
        // @ts-ignore
        [showImportModal, showStravaDisconnectModal, showStravaDisconnectModal, sessions, trainingPhases, athleteProfile, handleDeleteSession, handleUpdateFeedback, handleUpdateSession, handleResyncSession, showToast, closeImportModal, closeImportModal, closeImportModal, trainingObjectives, handleImport, fileImportRef,];
    } }, { class: "btn btn-circle btn-ghost absolute right-3 top-3 text-2xl" }));
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-circle']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['right-3']} */ ;
/** @type {__VLS_StyleScopedClasses['top-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.h3, __VLS_intrinsics.h3)(__assign({ class: "font-bold text-lg pr-10" }));
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['pr-10']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "py-4 text-base-content/70" }));
/** @type {__VLS_StyleScopedClasses['py-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-base-content/70']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "modal-action" }));
/** @type {__VLS_StyleScopedClasses['modal-action']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.showStravaDisconnectModal = false;
        // @ts-ignore
        [showStravaDisconnectModal,];
    } }, { class: "btn btn-ghost" }));
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.stravaDisconnect();
        __VLS_ctx.showStravaDisconnectModal = false;
        // @ts-ignore
        [showStravaDisconnectModal, stravaDisconnect,];
    } }, { class: "btn btn-error" }));
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-error']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.form, __VLS_intrinsics.form)(__assign(__assign({ onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.showStravaDisconnectModal = false;
        // @ts-ignore
        [showStravaDisconnectModal,];
    } }, { method: "dialog" }), { class: "modal-backdrop" }));
/** @type {__VLS_StyleScopedClasses['modal-backdrop']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)({});
__VLS_asFunctionalElement(__VLS_intrinsics.dialog, __VLS_intrinsics.dialog)(__assign({ class: "modal" }, { class: ({ 'modal-open': __VLS_ctx.showObjectivesModal }) }));
/** @type {__VLS_StyleScopedClasses['modal']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-open']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "modal-box w-full h-full max-h-full md:max-w-lg md:h-auto md:max-h-[90vh] rounded-none md:rounded-2xl" }));
/** @type {__VLS_StyleScopedClasses['modal-box']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['max-h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['md:max-w-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['md:h-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['md:max-h-[90vh]']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-none']} */ ;
/** @type {__VLS_StyleScopedClasses['md:rounded-2xl']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.showObjectivesModal = false;
        // @ts-ignore
        [showObjectivesModal, showObjectivesModal,];
    } }, { class: "btn btn-circle btn-ghost absolute right-3 top-3 text-2xl z-10" }));
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-circle']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['right-3']} */ ;
/** @type {__VLS_StyleScopedClasses['top-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['z-10']} */ ;
var __VLS_49 = ObjectiveSettings_vue_1.default;
// @ts-ignore
var __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49(__assign(__assign({ 'onSave': {} }, { 'onClose': {} }), { objectives: (__VLS_ctx.trainingObjectives) })));
var __VLS_51 = __VLS_50.apply(void 0, __spreadArray([__assign(__assign({ 'onSave': {} }, { 'onClose': {} }), { objectives: (__VLS_ctx.trainingObjectives) })], __VLS_functionalComponentArgsRest(__VLS_50), false));
var __VLS_54;
var __VLS_55 = ({ save: {} },
    { onSave: (__VLS_ctx.handleSaveObjectives) });
var __VLS_56 = ({ close: {} },
    { onClose: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.showObjectivesModal = false;
            // @ts-ignore
            [showObjectivesModal, trainingObjectives, handleSaveObjectives,];
        } });
var __VLS_52;
var __VLS_53;
__VLS_asFunctionalElement(__VLS_intrinsics.form, __VLS_intrinsics.form)(__assign(__assign({ onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.showObjectivesModal = false;
        // @ts-ignore
        [showObjectivesModal,];
    } }, { method: "dialog" }), { class: "modal-backdrop" }));
/** @type {__VLS_StyleScopedClasses['modal-backdrop']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)({});
__VLS_asFunctionalElement(__VLS_intrinsics.dialog, __VLS_intrinsics.dialog)(__assign({ class: "modal" }, { class: ({ 'modal-open': __VLS_ctx.showAthleteProfileModal }) }));
/** @type {__VLS_StyleScopedClasses['modal']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-open']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "modal-box w-full h-full max-h-full md:max-w-md md:h-auto md:max-h-[90vh] rounded-none md:rounded-2xl" }));
/** @type {__VLS_StyleScopedClasses['modal-box']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['max-h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['md:max-w-md']} */ ;
/** @type {__VLS_StyleScopedClasses['md:h-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['md:max-h-[90vh]']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-none']} */ ;
/** @type {__VLS_StyleScopedClasses['md:rounded-2xl']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.showAthleteProfileModal = false;
        // @ts-ignore
        [showAthleteProfileModal, showAthleteProfileModal,];
    } }, { class: "btn btn-circle btn-ghost absolute right-3 top-3 text-2xl z-10" }));
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-circle']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['right-3']} */ ;
/** @type {__VLS_StyleScopedClasses['top-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['z-10']} */ ;
var __VLS_57 = AthleteProfile_vue_1.default;
// @ts-ignore
var __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57(__assign(__assign({ 'onSave': {} }, { 'onClose': {} }), { profile: (__VLS_ctx.athleteProfile) })));
var __VLS_59 = __VLS_58.apply(void 0, __spreadArray([__assign(__assign({ 'onSave': {} }, { 'onClose': {} }), { profile: (__VLS_ctx.athleteProfile) })], __VLS_functionalComponentArgsRest(__VLS_58), false));
var __VLS_62;
var __VLS_63 = ({ save: {} },
    { onSave: (__VLS_ctx.handleSaveAthleteProfile) });
var __VLS_64 = ({ close: {} },
    { onClose: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.showAthleteProfileModal = false;
            // @ts-ignore
            [showAthleteProfileModal, athleteProfile, handleSaveAthleteProfile,];
        } });
var __VLS_60;
var __VLS_61;
__VLS_asFunctionalElement(__VLS_intrinsics.form, __VLS_intrinsics.form)(__assign(__assign({ onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.showAthleteProfileModal = false;
        // @ts-ignore
        [showAthleteProfileModal,];
    } }, { method: "dialog" }), { class: "modal-backdrop" }));
/** @type {__VLS_StyleScopedClasses['modal-backdrop']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)({});
__VLS_asFunctionalElement(__VLS_intrinsics.dialog, __VLS_intrinsics.dialog)(__assign({ class: "modal" }, { class: ({ 'modal-open': __VLS_ctx.showPhasesModal }) }));
/** @type {__VLS_StyleScopedClasses['modal']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-open']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "modal-box w-full h-full max-h-full md:max-w-2xl md:h-auto md:max-h-[90vh] rounded-none md:rounded-2xl" }));
/** @type {__VLS_StyleScopedClasses['modal-box']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['max-h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['md:max-w-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['md:h-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['md:max-h-[90vh]']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-none']} */ ;
/** @type {__VLS_StyleScopedClasses['md:rounded-2xl']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.showPhasesModal = false;
        // @ts-ignore
        [showPhasesModal, showPhasesModal,];
    } }, { class: "btn btn-circle btn-ghost absolute right-3 top-3 text-2xl z-10" }));
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-circle']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['right-3']} */ ;
/** @type {__VLS_StyleScopedClasses['top-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['z-10']} */ ;
var __VLS_65 = TrainingPhasesManager_vue_1.default;
// @ts-ignore
var __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65(__assign({ 'onSave': {} }, { phases: (__VLS_ctx.trainingPhases), objectives: (__VLS_ctx.trainingObjectives), athleteProfile: (__VLS_ctx.athleteProfile) })));
var __VLS_67 = __VLS_66.apply(void 0, __spreadArray([__assign({ 'onSave': {} }, { phases: (__VLS_ctx.trainingPhases), objectives: (__VLS_ctx.trainingObjectives), athleteProfile: (__VLS_ctx.athleteProfile) })], __VLS_functionalComponentArgsRest(__VLS_66), false));
var __VLS_70;
var __VLS_71 = ({ save: {} },
    { onSave: (__VLS_ctx.handleSavePhases) });
var __VLS_68;
var __VLS_69;
__VLS_asFunctionalElement(__VLS_intrinsics.form, __VLS_intrinsics.form)(__assign(__assign({ onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.showPhasesModal = false;
        // @ts-ignore
        [showPhasesModal, trainingPhases, athleteProfile, trainingObjectives, handleSavePhases,];
    } }, { method: "dialog" }), { class: "modal-backdrop" }));
/** @type {__VLS_StyleScopedClasses['modal-backdrop']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)({});
var __VLS_72 = ShareWeekModal_vue_1.default;
// @ts-ignore
var __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72(__assign({ 'onClose': {} }, { isOpen: (__VLS_ctx.showShareModal), sessions: (__VLS_ctx.sessions), weekStart: (__VLS_ctx.weekStart), trainingPhases: (__VLS_ctx.trainingPhases) })));
var __VLS_74 = __VLS_73.apply(void 0, __spreadArray([__assign({ 'onClose': {} }, { isOpen: (__VLS_ctx.showShareModal), sessions: (__VLS_ctx.sessions), weekStart: (__VLS_ctx.weekStart), trainingPhases: (__VLS_ctx.trainingPhases) })], __VLS_functionalComponentArgsRest(__VLS_73), false));
var __VLS_77;
var __VLS_78 = ({ close: {} },
    { onClose: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.showShareModal = false;
            // @ts-ignore
            [sessions, trainingPhases, showShareModal, showShareModal, weekStart,];
        } });
var __VLS_75;
var __VLS_76;
var __VLS_79;
/** @ts-ignore @type {typeof ___VLS_components.Teleport} */
Teleport;
// @ts-ignore
var __VLS_80 = __VLS_asFunctionalComponent(__VLS_79, new __VLS_79({
    to: "body",
}));
var __VLS_81 = __VLS_80.apply(void 0, __spreadArray([{
        to: "body",
    }], __VLS_functionalComponentArgsRest(__VLS_80), false));
var __VLS_84 = __VLS_82.slots.default;
var __VLS_85;
/** @ts-ignore @type {typeof ___VLS_components.Transition} */
Transition;
// @ts-ignore
var __VLS_86 = __VLS_asFunctionalComponent(__VLS_85, new __VLS_85({
    name: "spotlight",
}));
var __VLS_87 = __VLS_86.apply(void 0, __spreadArray([{
        name: "spotlight",
    }], __VLS_functionalComponentArgsRest(__VLS_86), false));
var __VLS_90 = __VLS_88.slots.default;
if (__VLS_ctx.spotlightSession) {
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!(__VLS_ctx.spotlightSession))
                return;
            !__VLS_ctx.showSpotlightComment && __VLS_ctx.closeSpotlight();
            // @ts-ignore
            [spotlightSession, showSpotlightComment, closeSpotlight,];
        } }, { class: "spotlight-overlay" }));
    /** @type {__VLS_StyleScopedClasses['spotlight-overlay']} */ ;
    if (!__VLS_ctx.showSpotlightComment) {
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign(__assign(__assign(__assign({ onClick: (__VLS_ctx.closeSpotlight) }, { onMousemove: (__VLS_ctx.onSpotlightMouseMove) }), { onMouseleave: (__VLS_ctx.onSpotlightMouseLeave) }), { ref: "spotlightCardRef" }), { class: "spotlight-card" }));
        /** @type {__VLS_StyleScopedClasses['spotlight-card']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "spotlight-bg" }));
        /** @type {__VLS_StyleScopedClasses['spotlight-bg']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "spotlight-content" }));
        /** @type {__VLS_StyleScopedClasses['spotlight-content']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "spotlight-emoji" }));
        /** @type {__VLS_StyleScopedClasses['spotlight-emoji']} */ ;
        (__VLS_ctx.spotlightSession.sport === 'cycling' ? '🚴' : __VLS_ctx.spotlightSession.sport === 'running' ? '🏃' : '💪');
        __VLS_asFunctionalElement(__VLS_intrinsics.h2, __VLS_intrinsics.h2)(__assign({ class: "spotlight-title" }));
        /** @type {__VLS_StyleScopedClasses['spotlight-title']} */ ;
        (__VLS_ctx.spotlightSession.title);
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "spotlight-stats" }));
        /** @type {__VLS_StyleScopedClasses['spotlight-stats']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (Math.floor(__VLS_ctx.spotlightSession.duration_min / 60));
        ((__VLS_ctx.spotlightSession.duration_min % 60).toString().padStart(2, '0'));
        if (__VLS_ctx.spotlightSession.actual_km) {
            __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            (__VLS_ctx.spotlightSession.actual_km);
        }
        if (__VLS_ctx.spotlightSession.actual_elevation) {
            __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            (__VLS_ctx.spotlightSession.actual_elevation);
        }
        if (__VLS_ctx.spotlightSession.average_heartrate || __VLS_ctx.spotlightSession.average_watts) {
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "spotlight-stats mt-1" }));
            /** @type {__VLS_StyleScopedClasses['spotlight-stats']} */ ;
            /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
            if (__VLS_ctx.spotlightSession.average_heartrate) {
                __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
                (Math.round(__VLS_ctx.spotlightSession.average_heartrate));
            }
            if (__VLS_ctx.spotlightSession.average_watts) {
                __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
                (Math.round(__VLS_ctx.spotlightSession.average_watts));
            }
        }
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "spotlight-badge" }));
        /** @type {__VLS_StyleScopedClasses['spotlight-badge']} */ ;
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ onClick: function () { } }, { class: "spotlight-card" }));
        /** @type {__VLS_StyleScopedClasses['spotlight-card']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "spotlight-bg" }));
        /** @type {__VLS_StyleScopedClasses['spotlight-bg']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "spotlight-content text-center" }));
        /** @type {__VLS_StyleScopedClasses['spotlight-content']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-6xl mb-4" }));
        /** @type {__VLS_StyleScopedClasses['text-6xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.h2, __VLS_intrinsics.h2)(__assign({ class: "text-2xl font-bold mb-2" }));
        /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-base-content/70 mb-4" }));
        /** @type {__VLS_StyleScopedClasses['text-base-content/70']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.textarea, __VLS_intrinsics.textarea)(__assign(__assign({ value: (__VLS_ctx.spotlightComment) }, { class: "textarea textarea-bordered w-full h-20 mb-4 bg-base-100/50" }), { placeholder: "Super sensations, jambes en feu, objectif atteint..." }));
        /** @type {__VLS_StyleScopedClasses['textarea']} */ ;
        /** @type {__VLS_StyleScopedClasses['textarea-bordered']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-20']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-base-100/50']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex gap-3 justify-center" }));
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.spotlightSession))
                    return;
                if (!!(!__VLS_ctx.showSpotlightComment))
                    return;
                __VLS_ctx.confirmSpotlightCopy(false);
                // @ts-ignore
                [spotlightSession, spotlightSession, spotlightSession, spotlightSession, spotlightSession, spotlightSession, spotlightSession, spotlightSession, spotlightSession, spotlightSession, spotlightSession, spotlightSession, spotlightSession, spotlightSession, spotlightSession, showSpotlightComment, closeSpotlight, onSpotlightMouseMove, onSpotlightMouseLeave, spotlightComment, confirmSpotlightCopy,];
            } }, { class: "btn btn-ghost" }));
        /** @type {__VLS_StyleScopedClasses['btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.spotlightSession))
                    return;
                if (!!(!__VLS_ctx.showSpotlightComment))
                    return;
                __VLS_ctx.confirmSpotlightCopy(true);
                // @ts-ignore
                [confirmSpotlightCopy,];
            } }, { class: "btn bg-pink-500 hover:bg-pink-600 text-white border-0 shadow-lg shadow-pink-500/30" }));
        /** @type {__VLS_StyleScopedClasses['btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-pink-500']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-pink-600']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-pink-500/30']} */ ;
    }
}
// @ts-ignore
[];
var __VLS_88;
// @ts-ignore
[];
var __VLS_82;
var __VLS_91;
/** @ts-ignore @type {typeof ___VLS_components.Teleport} */
Teleport;
// @ts-ignore
var __VLS_92 = __VLS_asFunctionalComponent(__VLS_91, new __VLS_91({
    to: "body",
}));
var __VLS_93 = __VLS_92.apply(void 0, __spreadArray([{
        to: "body",
    }], __VLS_functionalComponentArgsRest(__VLS_92), false));
var __VLS_96 = __VLS_94.slots.default;
var __VLS_97;
/** @ts-ignore @type {typeof ___VLS_components.Transition} */
Transition;
// @ts-ignore
var __VLS_98 = __VLS_asFunctionalComponent(__VLS_97, new __VLS_97({
    name: "toast",
}));
var __VLS_99 = __VLS_98.apply(void 0, __spreadArray([{
        name: "toast",
    }], __VLS_functionalComponentArgsRest(__VLS_98), false));
var __VLS_102 = __VLS_100.slots.default;
if (__VLS_ctx.toastMessage) {
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "fixed bottom-6 right-6 z-[10000] px-4 py-3 rounded-xl shadow-lg flex items-center gap-2" }, { class: (__VLS_ctx.toastType === 'success' ? 'bg-success text-success-content' : 'bg-error text-error-content') }));
    /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
    /** @type {__VLS_StyleScopedClasses['bottom-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['right-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-[10000]']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-lg" }));
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    (__VLS_ctx.toastType === 'success' ? '✓' : '✕');
    __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.toastMessage);
}
// @ts-ignore
[toastMessage, toastMessage, toastType, toastType,];
var __VLS_100;
// @ts-ignore
[];
var __VLS_94;
// @ts-ignore
var __VLS_39 = __VLS_38, __VLS_48 = __VLS_47;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({});
exports.default = {};
