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
var session_1 = require("../types/session");
// Helper to get sport emoji with type safety
var getSportEmoji = function (sport) { var _a, _b; return (_b = (_a = session_1.SPORT_CONFIG[sport]) === null || _a === void 0 ? void 0 : _a.emoji) !== null && _b !== void 0 ? _b : '🏃'; };
var props = defineProps();
var emit = defineEmits();
var isDownloading = (0, vue_1.ref)(false);
var captureRef = (0, vue_1.ref)(null);
// Close on Escape key
var handleKeydown = function (e) {
    if (e.key === 'Escape' && props.isOpen) {
        emit('close');
    }
};
(0, vue_1.onMounted)(function () {
    document.addEventListener('keydown', handleKeydown);
});
(0, vue_1.onUnmounted)(function () {
    document.removeEventListener('keydown', handleKeydown);
});
// Week dates calculation
var weekDates = (0, vue_1.computed)(function () {
    var dates = [];
    var start = new Date(props.weekStart);
    for (var i = 0; i < 7; i++) {
        var date = new Date(start);
        date.setDate(start.getDate() + i);
        var year = date.getFullYear();
        var month = String(date.getMonth() + 1).padStart(2, '0');
        var day = String(date.getDate()).padStart(2, '0');
        dates.push({
            date: "".concat(year, "-").concat(month, "-").concat(day),
            dayName: date.toLocaleDateString('fr-FR', { weekday: 'short' }).toUpperCase().slice(0, 3),
            dayNumber: date.getDate(),
        });
    }
    return dates;
});
// Format week range for header
var weekRange = (0, vue_1.computed)(function () {
    var start = new Date(props.weekStart);
    var end = new Date(start);
    end.setDate(start.getDate() + 6);
    var startStr = start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
    var endStr = end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    return "".concat(startStr, " - ").concat(endStr);
});
// Current phase calculation
var currentPhase = (0, vue_1.computed)(function () {
    var _a, _b, _c, _d;
    if (!((_a = props.trainingPhases) === null || _a === void 0 ? void 0 : _a.length))
        return null;
    var weekStartStr = (_c = (_b = weekDates.value[0]) === null || _b === void 0 ? void 0 : _b.date) !== null && _c !== void 0 ? _c : '';
    return (_d = props.trainingPhases.find(function (phase) {
        return weekStartStr >= phase.start_date && weekStartStr <= phase.end_date;
    })) !== null && _d !== void 0 ? _d : null;
});
// Week number within phase (S1/4, S2/4, etc.)
var phaseWeekInfo = (0, vue_1.computed)(function () {
    if (!currentPhase.value)
        return null;
    var phaseStart = new Date(currentPhase.value.start_date);
    var phaseEnd = new Date(currentPhase.value.end_date);
    var weekStart = new Date(props.weekStart);
    // Calculate week number (1-based)
    var weeksDiff = Math.floor((weekStart.getTime() - phaseStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
    var totalWeeks = Math.ceil((phaseEnd.getTime() - phaseStart.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
    return {
        current: Math.max(1, weeksDiff + 1),
        total: totalWeeks
    };
});
// Get phase emoji
var getPhaseEmoji = function (phaseName) {
    var name = phaseName.toLowerCase();
    if (name.includes('récup') || name.includes('recup'))
        return '🧘';
    if (name.includes('base') || name.includes('fond'))
        return '🏔️';
    if (name.includes('spéci') || name.includes('speci'))
        return '🎯';
    if (name.includes('affût') || name.includes('affut') || name.includes('taper'))
        return '⚡';
    if (name.includes('prépa') || name.includes('prepa') || name.includes('général'))
        return '🏋️';
    if (name.includes('compét') || name.includes('compet') || name.includes('race'))
        return '🏆';
    return '📅';
};
// Sessions grouped by date
var sessionsByDate = (0, vue_1.computed)(function () {
    var map = {};
    props.sessions.forEach(function (session) {
        if (!map[session.date])
            map[session.date] = [];
        map[session.date].push(session);
    });
    return map;
});
// Helper to get sessions for a date (for template)
var getSessionsForDate = function (date) { var _a; return (_a = sessionsByDate.value[date]) !== null && _a !== void 0 ? _a : []; };
// Check if session is completed (strava or manual)
var isSessionDone = function (session) { return session.type === 'strava' || session.type === 'manual'; };
// Stats
var weekSessions = (0, vue_1.computed)(function () {
    var _a, _b, _c, _d;
    var start = (_b = (_a = weekDates.value[0]) === null || _a === void 0 ? void 0 : _a.date) !== null && _b !== void 0 ? _b : '';
    var end = (_d = (_c = weekDates.value[6]) === null || _c === void 0 ? void 0 : _c.date) !== null && _d !== void 0 ? _d : '';
    return props.sessions.filter(function (s) { return s.date >= start && s.date <= end; });
});
var doneSessions = (0, vue_1.computed)(function () { return weekSessions.value.filter(function (s) { return s.type === 'strava' || s.type === 'manual'; }); });
var plannedSessions = (0, vue_1.computed)(function () { return weekSessions.value.filter(function (s) { return s.type === 'planned'; }); });
var doneHours = (0, vue_1.computed)(function () { return doneSessions.value.reduce(function (sum, s) { return sum + s.duration_min / 60; }, 0); });
var plannedHours = (0, vue_1.computed)(function () { return plannedSessions.value.reduce(function (sum, s) { return sum + s.duration_min / 60; }, 0); });
var formatHours = function (hours) {
    var h = Math.floor(hours);
    var m = Math.round((hours - h) * 60);
    if (h === 0)
        return "".concat(m, "min");
    if (m === 0)
        return "".concat(h, "h");
    return "".concat(h, "h").concat(m.toString().padStart(2, '0'));
};
var formatDuration = function (min) {
    var h = Math.floor(min / 60);
    var m = min % 60;
    if (h === 0)
        return "".concat(m, "min");
    if (m === 0)
        return "".concat(h, "h");
    return "".concat(h, "h").concat(m.toString().padStart(2, '0'));
};
// Smart tagline
var pickRandom = function (arr) { var _a; return (_a = arr[Math.floor(Math.random() * arr.length)]) !== null && _a !== void 0 ? _a : arr[0]; };
var taglineKey = (0, vue_1.ref)(0); // Force re-compute on modal open
(0, vue_1.watch)(function () { return props.isOpen; }, function (open) {
    if (open)
        taglineKey.value++;
});
var smartTagline = (0, vue_1.computed)(function () {
    void taglineKey.value; // Dependency for re-computation
    var done = doneSessions.value.length;
    var planned = plannedSessions.value.length;
    var total = done + planned;
    var completionRate = total > 0 ? done / total : 0;
    // Semaine complète (100%)
    if (completionRate === 1 && done > 0) {
        return pickRandom([
            "Objectif atteint, mission accomplie 🏆",
            "Semaine parfaite, bravo champion 💪",
            "100% réalisé, tu gères 🔥",
        ]);
    }
    // Bonne progression (>70%)
    if (completionRate > 0.7) {
        return pickRandom([
            "La régularité paie toujours ⚡",
            "Sur la bonne voie 🎯",
            "Continue comme ça 💪",
        ]);
    }
    // Début de semaine / beaucoup prévu
    if (planned > done) {
        return pickRandom([
            "Les objectifs sont clairs 🎯",
            "Semaine chargée en vue 🔥",
            "Ready to crush it 💪",
        ]);
    }
    // Grosse semaine (>6h)
    if (doneHours.value > 6) {
        return pickRandom([
            "Grosse semaine d'entraînement 🔥",
            "Le travail paie toujours 💪",
            "Beast mode activé ⚡",
        ]);
    }
    // Default
    return pickRandom([
        "Chaque séance compte 🎯",
        "Train hard, recover harder 💪",
        "La constance fait la différence ⚡",
    ]);
});
// Download screenshot (lazy load modern-screenshot)
var downloadScreenshot = function () { return __awaiter(void 0, void 0, void 0, function () {
    var domToPng, dataUrl, a, dateStr, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!captureRef.value || isDownloading.value)
                    return [2 /*return*/];
                isDownloading.value = true;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 5, 6, 7]);
                // Add padding for screenshot
                captureRef.value.style.padding = '24px';
                // Wait for styles to apply
                return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 50); })
                    // Dynamic import - only load when needed
                ];
            case 2:
                // Wait for styles to apply
                _a.sent();
                return [4 /*yield*/, Promise.resolve().then(function () { return require('modern-screenshot'); })];
            case 3:
                domToPng = (_a.sent()).domToPng;
                return [4 /*yield*/, domToPng(captureRef.value, {
                        scale: 2,
                        backgroundColor: '#000000',
                        // Filter out elements with screenshot-hide class
                        filter: function (node) {
                            if (node instanceof Element && node.classList.contains('screenshot-hide')) {
                                return false;
                            }
                            return true;
                        },
                    })
                    // Remove padding after capture
                ];
            case 4:
                dataUrl = _a.sent();
                // Remove padding after capture
                captureRef.value.style.padding = '';
                a = document.createElement('a');
                a.href = dataUrl;
                dateStr = new Date().toISOString().split('T')[0];
                a.download = "cadence-semaine-".concat(dateStr, ".png");
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                return [3 /*break*/, 7];
            case 5:
                error_1 = _a.sent();
                console.error('Screenshot error:', error_1);
                alert('Erreur lors de la capture. Vérifiez la console.');
                // Remove padding on error too
                if (captureRef.value)
                    captureRef.value.style.padding = '';
                return [3 /*break*/, 7];
            case 6:
                isDownloading.value = false;
                return [7 /*endfinally*/];
            case 7: return [2 /*return*/];
        }
    });
}); };
// Get session class based on completion status
var getSessionClass = function (session) {
    var base = 'session-share';
    if (isSessionDone(session)) {
        // Completed = Orange Strava
        return "".concat(base, " session-done-share");
    }
    else {
        // Planned = Sport colors with dashed border
        return "".concat(base, " session-").concat(session.sport, "-share session-planned-share");
    }
};
// Get intensity color (1-10 scale) - dot style
var getIntensityColor = function (intensity) {
    if (!intensity)
        return 'bg-white/40';
    if (intensity <= 3)
        return 'bg-white/80'; // Récup - blanc
    if (intensity <= 6)
        return 'bg-yellow-300'; // Modéré - jaune
    if (intensity <= 8)
        return 'bg-orange-400'; // Dur - orange
    return 'bg-red-500'; // Intense - rouge
};
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var ___VLS_components;
var ___VLS_directives;
/** @type {__VLS_StyleScopedClasses['modal-enter-from']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-leave-to']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-border-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-border-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['capture-area']} */ ;
/** @type {__VLS_StyleScopedClasses['capture-area']} */ ;
/** @type {__VLS_StyleScopedClasses['capture-area']} */ ;
/** @type {__VLS_StyleScopedClasses['capture-area']} */ ;
/** @type {__VLS_StyleScopedClasses['capture-area']} */ ;
/** @type {__VLS_StyleScopedClasses['capture-area']} */ ;
/** @type {__VLS_StyleScopedClasses['capture-area']} */ ;
/** @type {__VLS_StyleScopedClasses['capture-area']} */ ;
/** @type {__VLS_StyleScopedClasses['capture-area']} */ ;
/** @type {__VLS_StyleScopedClasses['divider']} */ ;
/** @type {__VLS_StyleScopedClasses['capture-area']} */ ;
/** @type {__VLS_StyleScopedClasses['divider']} */ ;
var __VLS_0;
/** @ts-ignore @type {typeof ___VLS_components.Teleport} */
Teleport;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    to: "body",
}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
        to: "body",
    }], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_5 = __VLS_3.slots.default;
var __VLS_6;
/** @ts-ignore @type {typeof ___VLS_components.Transition} */
Transition;
// @ts-ignore
var __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({
    name: "modal",
}));
var __VLS_8 = __VLS_7.apply(void 0, __spreadArray([{
        name: "modal",
    }], __VLS_functionalComponentArgsRest(__VLS_7), false));
var __VLS_11 = __VLS_9.slots.default;
if (__VLS_ctx.isOpen) {
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "fixed inset-0 z-[9999] flex items-center justify-center p-4" }));
    /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-[9999]']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!(__VLS_ctx.isOpen))
                return;
            __VLS_ctx.emit('close');
            // @ts-ignore
            [isOpen, emit,];
        } }, { class: "absolute inset-0 bg-black/95 backdrop-blur-xl" }));
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black/95']} */ ;
    /** @type {__VLS_StyleScopedClasses['backdrop-blur-xl']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "relative z-10 flex flex-col items-center max-w-3xl w-full" }));
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-3xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ ref: "captureRef" }, { class: "screenshot-wrapper rounded-[2rem] w-full" }));
    /** @type {__VLS_StyleScopedClasses['screenshot-wrapper']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-[2rem]']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "modal-border-wrapper" }));
    /** @type {__VLS_StyleScopedClasses['modal-border-wrapper']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "modal-card rounded-3xl w-full max-h-[80vh] overflow-auto shadow-2xl relative" }));
    /** @type {__VLS_StyleScopedClasses['modal-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-3xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-h-[80vh]']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!(__VLS_ctx.isOpen))
                return;
            __VLS_ctx.emit('close');
            // @ts-ignore
            [emit,];
        } }, { class: "btn btn-circle btn-sm btn-ghost absolute right-3 top-3 text-lg z-30 screenshot-hide" }));
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-circle']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['right-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-30']} */ ;
    /** @type {__VLS_StyleScopedClasses['screenshot-hide']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "capture-area p-6 md:p-8 rounded-3xl" }));
    /** @type {__VLS_StyleScopedClasses['capture-area']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:p-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-3xl']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-center mb-8" }));
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-8']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center justify-center gap-3 flex-wrap" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.h2, __VLS_intrinsics.h2)(__assign({ class: "text-2xl md:text-3xl font-bold break-words" }));
    /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:text-3xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['break-words']} */ ;
    (__VLS_ctx.currentPhase ? "".concat(__VLS_ctx.currentPhase.emoji || __VLS_ctx.getPhaseEmoji(__VLS_ctx.currentPhase.name), " ").concat(__VLS_ctx.currentPhase.name.toUpperCase()) : '📅 Ma semaine');
    if (__VLS_ctx.phaseWeekInfo) {
        __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "badge badge-primary badge-lg font-bold shrink-0" }));
        /** @type {__VLS_StyleScopedClasses['badge']} */ ;
        /** @type {__VLS_StyleScopedClasses['badge-primary']} */ ;
        /** @type {__VLS_StyleScopedClasses['badge-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
        (__VLS_ctx.phaseWeekInfo.current);
        (__VLS_ctx.phaseWeekInfo.total);
    }
    __VLS_asFunctionalElement(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-base-content/60 mt-2" }));
    /** @type {__VLS_StyleScopedClasses['text-base-content/60']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
    (__VLS_ctx.weekRange);
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "grid grid-cols-7 gap-2 mb-8" }));
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-7']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-8']} */ ;
    for (var _i = 0, _a = __VLS_getVForSourceType((__VLS_ctx.weekDates)); _i < _a.length; _i++) {
        var day = _a[_i][0];
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ key: (day.date) }, { class: "text-center" }));
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-xs text-base-content/50 font-medium mb-1" }));
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-base-content/50']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
        (day.dayName);
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-lg font-bold mb-3 text-base-content/80" }));
        /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-base-content/80']} */ ;
        (day.dayNumber);
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-2 min-h-[80px]" }));
        /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['min-h-[80px]']} */ ;
        for (var _b = 0, _c = __VLS_getVForSourceType((__VLS_ctx.getSessionsForDate(day.date))); _b < _c.length; _b++) {
            var session = _c[_b][0];
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign(__assign({ key: (session.id) }, { class: "rounded-xl p-2 text-center text-white relative" }), { class: (__VLS_ctx.getSessionClass(session)) }));
            /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
            /** @type {__VLS_StyleScopedClasses['relative']} */ ;
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-xl" }));
            /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
            (__VLS_ctx.getSportEmoji(session.sport));
            if (__VLS_ctx.isSessionDone(session)) {
                __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-sm" }));
                /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            }
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-xs font-semibold mt-0.5" }));
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
            /** @type {__VLS_StyleScopedClasses['mt-0.5']} */ ;
            (__VLS_ctx.formatDuration(session.duration_min));
            if (!__VLS_ctx.isSessionDone(session) && session.intensity) {
                __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center justify-center gap-1 mt-1" }));
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
                __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-[10px] text-white/80 font-bold" }));
                /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-white/80']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
                (session.intensity);
                __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "w-2 h-2 rounded-full" }, { class: (__VLS_ctx.getIntensityColor(session.intensity)) }));
                /** @type {__VLS_StyleScopedClasses['w-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['h-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
            }
            // @ts-ignore
            [currentPhase, currentPhase, currentPhase, currentPhase, getPhaseEmoji, phaseWeekInfo, phaseWeekInfo, phaseWeekInfo, weekRange, weekDates, getSessionsForDate, getSessionClass, getSportEmoji, isSessionDone, isSessionDone, formatDuration, getIntensityColor,];
        }
        if (__VLS_ctx.getSessionsForDate(day.date).length >= 2) {
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "combo-badge" }));
            /** @type {__VLS_StyleScopedClasses['combo-badge']} */ ;
            (__VLS_ctx.getSessionsForDate(day.date).length);
        }
        // @ts-ignore
        [getSessionsForDate, getSessionsForDate,];
    }
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex justify-center gap-8 text-sm mb-6 flex-wrap" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
    if (__VLS_ctx.doneSessions.length > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-[#fc4c02] font-semibold whitespace-nowrap" }));
        /** @type {__VLS_StyleScopedClasses['text-[#fc4c02]']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['whitespace-nowrap']} */ ;
        (__VLS_ctx.doneSessions.length);
        (__VLS_ctx.formatHours(__VLS_ctx.doneHours));
    }
    if (__VLS_ctx.plannedSessions.length > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-base-content/50 font-medium whitespace-nowrap" }));
        /** @type {__VLS_StyleScopedClasses['text-base-content/50']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        /** @type {__VLS_StyleScopedClasses['whitespace-nowrap']} */ ;
        (__VLS_ctx.plannedSessions.length);
        (__VLS_ctx.formatHours(__VLS_ctx.plannedHours));
    }
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "divider my-4" }));
    /** @type {__VLS_StyleScopedClasses['divider']} */ ;
    /** @type {__VLS_StyleScopedClasses['my-4']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "py-6 text-center px-2" }));
    /** @type {__VLS_StyleScopedClasses['py-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-xl md:text-2xl font-bold bg-gradient-to-r from-pink-400 via-pink-500 to-rose-500 bg-clip-text text-transparent drop-shadow-lg break-words" }));
    /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:text-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
    /** @type {__VLS_StyleScopedClasses['from-pink-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['via-pink-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['to-rose-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-clip-text']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-transparent']} */ ;
    /** @type {__VLS_StyleScopedClasses['drop-shadow-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['break-words']} */ ;
    (__VLS_ctx.smartTagline);
    __VLS_asFunctionalElement(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-xs text-base-content/30 text-center mt-4" }));
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base-content/30']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex justify-center pt-4 pb-2 screenshot-hide" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['pt-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['screenshot-hide']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign({ onClick: (__VLS_ctx.downloadScreenshot) }, { class: "btn btn-lg border-0 shadow-lg text-white px-8 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-pink-500/40" }), { disabled: (__VLS_ctx.isDownloading) }));
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
    /** @type {__VLS_StyleScopedClasses['from-pink-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['to-rose-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:from-pink-600']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:to-rose-600']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-pink-500/40']} */ ;
    if (__VLS_ctx.isDownloading) {
        __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "loading loading-spinner loading-xs ml-1" }));
        /** @type {__VLS_StyleScopedClasses['loading']} */ ;
        /** @type {__VLS_StyleScopedClasses['loading-spinner']} */ ;
        /** @type {__VLS_StyleScopedClasses['loading-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['ml-1']} */ ;
    }
    else {
    }
}
// @ts-ignore
[doneSessions, doneSessions, formatHours, formatHours, doneHours, plannedSessions, plannedSessions, plannedHours, smartTagline, downloadScreenshot, isDownloading, isDownloading,];
var __VLS_9;
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
exports.default = {};
