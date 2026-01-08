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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
var vue_1 = require("vue");
var session_1 = require("../types/session");
var useWeather_1 = require("../composables/useWeather");
var _d = (0, useWeather_1.useWeather)(), forecast = _d.forecast, fetchWithGeolocation = _d.fetchWithGeolocation, getWeatherForDate = _d.getWeatherForDate, getWeatherEmoji = _d.getWeatherEmoji, getWindArrow = _d.getWindArrow, locationName = _d.locationName;
var props = defineProps();
var emit = defineEmits();
// Mobile detection
var isMobile = (0, vue_1.ref)(false);
var currentDayIndex = (0, vue_1.ref)(0); // 0-6 for Mon-Sun
var checkMobile = function () {
    isMobile.value = window.innerWidth < 768;
};
// Swipe handling with animation
var touchStartX = 0;
var swipeOffset = (0, vue_1.ref)(0);
var isAnimating = (0, vue_1.ref)(false);
var slideDirection = (0, vue_1.ref)(null);
var onTouchStart = function (e) {
    var _a, _b;
    if (isAnimating.value)
        return;
    touchStartX = (_b = (_a = e.touches[0]) === null || _a === void 0 ? void 0 : _a.clientX) !== null && _b !== void 0 ? _b : 0;
    swipeOffset.value = 0;
};
var onTouchMove = function (e) {
    var _a, _b;
    if (isAnimating.value)
        return;
    var currentX = (_b = (_a = e.touches[0]) === null || _a === void 0 ? void 0 : _a.clientX) !== null && _b !== void 0 ? _b : 0;
    swipeOffset.value = currentX - touchStartX;
};
var onTouchEnd = function (e) {
    var _a, _b;
    if (isAnimating.value)
        return;
    var endX = (_b = (_a = e.changedTouches[0]) === null || _a === void 0 ? void 0 : _a.clientX) !== null && _b !== void 0 ? _b : 0;
    var diff = endX - touchStartX;
    if (diff > 50 && currentDayIndex.value > 0) {
        slideDirection.value = 'right';
        isAnimating.value = true;
        setTimeout(function () {
            currentDayIndex.value--;
            slideDirection.value = null;
            isAnimating.value = false;
        }, 200);
    }
    else if (diff < -50 && currentDayIndex.value < 6) {
        slideDirection.value = 'left';
        isAnimating.value = true;
        setTimeout(function () {
            currentDayIndex.value++;
            slideDirection.value = null;
            isAnimating.value = false;
        }, 200);
    }
    swipeOffset.value = 0;
};
// Current day getter with safety check
var currentDay = (0, vue_1.computed)(function () { return weekDays.value[currentDayIndex.value]; });
var currentDaySessions = (0, vue_1.computed)(function () {
    var day = currentDay.value;
    return day ? sessionsByDate.value[day.date] || [] : [];
});
// Current week start (Monday)
var currentWeekStart = (0, vue_1.ref)(getMonday(new Date()));
function getMonday(d) {
    var date = new Date(d);
    var day = date.getDay();
    var diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setDate(diff);
    date.setHours(0, 0, 0, 0);
    return date;
}
function formatDate(date) {
    var year = date.getFullYear();
    var month = String(date.getMonth() + 1).padStart(2, '0');
    var day = String(date.getDate()).padStart(2, '0');
    return "".concat(year, "-").concat(month, "-").concat(day);
}
function formatDateDisplay(date) {
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}
function getDayName(date) {
    return date.toLocaleDateString('fr-FR', { weekday: 'short' });
}
// Today's date for highlighting
var today = formatDate(new Date());
// Generate week days
var weekDays = (0, vue_1.computed)(function () {
    var days = [];
    for (var i = 0; i < 7; i++) {
        var date = new Date(currentWeekStart.value);
        date.setDate(date.getDate() + i);
        var dateStr = formatDate(date);
        var weather = getWeatherForDate(dateStr);
        days.push({
            date: dateStr,
            dayName: getDayName(date),
            dayNumber: date.getDate(),
            displayDate: formatDateDisplay(date),
            isToday: formatDate(new Date()) === dateStr,
            weather: weather ? {
                emoji: getWeatherEmoji(weather.weatherCode),
                temp: weather.tempMax,
                title: "\uD83D\uDCCD ".concat(locationName.value, " \u2022 ").concat(weather.tempMin, "\u00B0 / ").concat(weather.tempMax, "\u00B0"),
                wind: weather.windSpeed,
                windArrow: getWindArrow(weather.windDirection),
            } : null
        });
    }
    return days;
});
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
// Current phase for the displayed week
var currentPhase = (0, vue_1.computed)(function () {
    var _a;
    if (!((_a = props.trainingPhases) === null || _a === void 0 ? void 0 : _a.length))
        return null;
    // Use the middle of the displayed week to determine phase
    var midWeek = new Date(currentWeekStart.value);
    midWeek.setDate(midWeek.getDate() + 3);
    var midWeekStr = formatDate(midWeek);
    return props.trainingPhases.find(function (p) { return p.start_date <= midWeekStr && p.end_date >= midWeekStr; });
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
    var weekStart = new Date(currentWeekStart.value);
    weekStart.setHours(0, 0, 0, 0);
    var diffTime = weekStart.getTime() - phaseStart.getTime();
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
// Phase emoji based on name
var getPhaseEmoji = function (name) {
    var lower = name.toLowerCase();
    if (lower.includes('base') || lower.includes('fondation'))
        return '🏗️';
    if (lower.includes('build') || lower.includes('construction'))
        return '💪';
    if (lower.includes('peak') || lower.includes('pic') || lower.includes('affutage'))
        return '⚡';
    if (lower.includes('taper') || lower.includes('affinage'))
        return '🎯';
    if (lower.includes('recovery') || lower.includes('récup'))
        return '🧘';
    if (lower.includes('race') || lower.includes('compet'))
        return '🏆';
    return '📊';
};
// Navigation
var prevWeek = function () {
    var newDate = new Date(currentWeekStart.value);
    newDate.setDate(newDate.getDate() - 7);
    currentWeekStart.value = newDate;
    emit('weekChange', newDate);
};
var nextWeek = function () {
    var newDate = new Date(currentWeekStart.value);
    newDate.setDate(newDate.getDate() + 7);
    currentWeekStart.value = newDate;
    emit('weekChange', newDate);
};
var goToToday = function () {
    currentWeekStart.value = getMonday(new Date());
    emit('weekChange', currentWeekStart.value);
};
// Week export for coach
var weekExportCopied = (0, vue_1.ref)(false);
var copyWeekForCoach = function () { return __awaiter(void 0, void 0, void 0, function () {
    var weekSessions, formatSessionDate, text, done, planned;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                weekSessions = props.sessions.filter(function (s) {
                    var sessionDate = new Date(s.date);
                    var weekEnd = new Date(currentWeekStart.value);
                    weekEnd.setDate(weekEnd.getDate() + 6);
                    return sessionDate >= currentWeekStart.value && sessionDate <= weekEnd;
                }).sort(function (a, b) { return a.date.localeCompare(b.date); });
                formatSessionDate = function (dateStr) {
                    return new Date(dateStr).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
                };
                text = "\uD83D\uDCC5 BILAN SEMAINE\n";
                text += "".concat(headerTitle.value, "\n\n");
                done = weekSessions.filter(function (s) { return s.type === 'strava' || s.type === 'manual'; });
                planned = weekSessions.filter(function (s) { return s.type === 'planned'; });
                if (done.length > 0) {
                    text += "\u2705 R\u00C9ALIS\u00C9 (".concat(done.length, ")\n");
                    done.forEach(function (s) {
                        var duration = Math.floor(s.duration_min / 60) > 0
                            ? "".concat(Math.floor(s.duration_min / 60), "h").concat((s.duration_min % 60).toString().padStart(2, '0'))
                            : "".concat(s.duration_min, "min");
                        text += "\u2022 ".concat(formatSessionDate(s.date), " - ").concat(session_1.SPORT_CONFIG[s.sport].emoji, " ").concat(s.title, " (").concat(duration, ")\n");
                    });
                    text += "\n";
                }
                if (planned.length > 0) {
                    text += "\uD83D\uDCCB PR\u00C9VU (".concat(planned.length, ")\n");
                    planned.forEach(function (s) {
                        var duration = Math.floor(s.duration_min / 60) > 0
                            ? "".concat(Math.floor(s.duration_min / 60), "h").concat((s.duration_min % 60).toString().padStart(2, '0'))
                            : "".concat(s.duration_min, "min");
                        text += "\u2022 ".concat(formatSessionDate(s.date), " - ").concat(session_1.SPORT_CONFIG[s.sport].emoji, " ").concat(s.title, " (").concat(duration, ")\n");
                    });
                    text += "\n";
                }
                text += "\uD83D\uDCAC Qu'en penses-tu ? Je peux ajouter une s\u00E9ance ?";
                return [4 /*yield*/, navigator.clipboard.writeText(text)];
            case 1:
                _a.sent();
                weekExportCopied.value = true;
                setTimeout(function () {
                    weekExportCopied.value = false;
                }, 2000);
                return [2 /*return*/];
        }
    });
}); };
// Current month/year for header
var headerTitle = (0, vue_1.computed)(function () {
    var start = currentWeekStart.value;
    var end = new Date(start);
    end.setDate(end.getDate() + 6);
    var startMonth = start.toLocaleDateString('fr-FR', { month: 'long' });
    var endMonth = end.toLocaleDateString('fr-FR', { month: 'long' });
    var year = start.getFullYear();
    if (startMonth === endMonth) {
        return "".concat(startMonth, " ").concat(year);
    }
    return "".concat(startMonth, " - ").concat(endMonth, " ").concat(year);
});
// Drag & Drop
var draggedSession = (0, vue_1.ref)(null);
var dragOverDate = (0, vue_1.ref)(null);
var onDragStart = function (e, session) {
    // Can't drag completed sessions (strava or manual)
    if (session.type === 'strava' || session.type === 'manual') {
        e.preventDefault();
        return;
    }
    if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', session.id);
    }
    // Set after a tick so browser captures the original appearance for ghost
    setTimeout(function () {
        draggedSession.value = session;
    }, 0);
};
var onDragEnd = function () {
    draggedSession.value = null;
    dragOverDate.value = null;
};
var onDragOver = function (e, date) {
    e.preventDefault();
    if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move';
    }
    dragOverDate.value = date;
};
var onDragLeave = function () {
    dragOverDate.value = null;
};
var onDrop = function (e, date) {
    e.preventDefault();
    if (draggedSession.value && draggedSession.value.date !== date) {
        emit('updateDate', draggedSession.value.id, date);
    }
    draggedSession.value = null;
    dragOverDate.value = null;
};
// Format duration
var formatDuration = function (minutes) {
    var hours = Math.floor(minutes / 60);
    var mins = minutes % 60;
    if (hours === 0)
        return "".concat(mins, "min");
    if (mins === 0)
        return "".concat(hours, "h");
    return "".concat(hours, "h").concat(mins.toString().padStart(2, '0'));
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
// Init
(0, vue_1.onMounted)(function () {
    fetchWithGeolocation();
    emit('weekChange', currentWeekStart.value);
    // Mobile detection
    checkMobile();
    window.addEventListener('resize', checkMobile);
    // Set current day index to today
    var todayDayOfWeek = new Date().getDay();
    currentDayIndex.value = todayDayOfWeek === 0 ? 6 : todayDayOfWeek - 1; // Convert to Mon=0, Sun=6
});
(0, vue_1.onUnmounted)(function () {
    window.removeEventListener('resize', checkMobile);
});
// Refresh weather when forecast changes
(0, vue_1.watch)(forecast, function () { }, { deep: true });
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var ___VLS_components;
var ___VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "card bg-base-100 shadow-xl overflow-hidden" }));
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-base-100']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center justify-between p-4" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center gap-1" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: (__VLS_ctx.prevWeek) }, { class: "btn btn-sm btn-ghost btn-circle" }));
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-circle']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.svg, __VLS_intrinsics.svg)(__assign(__assign({ xmlns: "http://www.w3.org/2000/svg" }, { class: "h-5 w-5" }), { fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }));
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.path)({
    'stroke-linecap': "round",
    'stroke-linejoin': "round",
    'stroke-width': "2",
    d: "M15 19l-7-7 7-7",
});
__VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: (__VLS_ctx.nextWeek) }, { class: "btn btn-sm btn-ghost btn-circle" }));
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-circle']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.svg, __VLS_intrinsics.svg)(__assign(__assign({ xmlns: "http://www.w3.org/2000/svg" }, { class: "h-5 w-5" }), { fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }));
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.path)({
    'stroke-linecap': "round",
    'stroke-linejoin': "round",
    'stroke-width': "2",
    d: "M9 5l7 7-7 7",
});
__VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: (__VLS_ctx.goToToday) }, { class: "btn btn-sm btn-ghost text-primary font-medium ml-1" }));
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
/** @type {__VLS_StyleScopedClasses['text-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-1']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.h2, __VLS_intrinsics.h2)(__assign({ class: "text-xl font-bold text-primary capitalize leading-none" }));
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['capitalize']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-none']} */ ;
(__VLS_ctx.headerTitle);
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center gap-1" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign({ onClick: (__VLS_ctx.copyWeekForCoach) }, { class: "btn btn-sm btn-ghost" }), { class: (__VLS_ctx.weekExportCopied ? 'text-success' : '') }));
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
(__VLS_ctx.weekExportCopied ? '✓ Copié !' : '📋 Bilan');
__VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.emit('openShareModal');
        // @ts-ignore
        [prevWeek, nextWeek, goToToday, headerTitle, copyWeekForCoach, weekExportCopied, weekExportCopied, emit,];
    } }, { class: "btn btn-sm btn-ghost" }));
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.emit('openImportModal');
        // @ts-ignore
        [emit,];
    } }, { class: "btn btn-sm border-0 text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600" }));
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['border-0']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
/** @type {__VLS_StyleScopedClasses['from-pink-500']} */ ;
/** @type {__VLS_StyleScopedClasses['to-rose-500']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:from-pink-600']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:to-rose-600']} */ ;
if (__VLS_ctx.isMobile) {
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign(__assign(__assign({ onTouchstart: (__VLS_ctx.onTouchStart) }, { onTouchmove: (__VLS_ctx.onTouchMove) }), { onTouchend: (__VLS_ctx.onTouchEnd) }), { class: "min-h-[400px] p-3 overflow-hidden" }));
    /** @type {__VLS_StyleScopedClasses['min-h-[400px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
    if (__VLS_ctx.currentDay) {
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign(__assign({ class: "flex flex-col rounded-2xl min-h-[350px] transition-all duration-200 ease-out" }, { class: ({
                'bg-primary/10 ring-2 ring-primary/30': __VLS_ctx.currentDay.isToday,
                'bg-base-200/50': !__VLS_ctx.currentDay.isToday
            }) }), { style: ({
                transform: __VLS_ctx.slideDirection === 'left' ? 'translateX(-100%) scale(0.95)' :
                    __VLS_ctx.slideDirection === 'right' ? 'translateX(100%) scale(0.95)' :
                        "translateX(".concat(__VLS_ctx.swipeOffset * 0.3, "px)"),
                opacity: __VLS_ctx.slideDirection ? 0 : 1 - Math.abs(__VLS_ctx.swipeOffset) / 500
            }) }));
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['min-h-[350px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        /** @type {__VLS_StyleScopedClasses['duration-200']} */ ;
        /** @type {__VLS_StyleScopedClasses['ease-out']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-primary/10']} */ ;
        /** @type {__VLS_StyleScopedClasses['ring-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['ring-primary/30']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-base-200/50']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "p-4 text-center" }));
        /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center justify-center gap-4" }));
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-sm uppercase text-base-content/50 font-medium tracking-wide" }));
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-base-content/50']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-wide']} */ ;
        (__VLS_ctx.currentDay.dayName);
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-4xl font-bold mt-1" }, { class: (__VLS_ctx.currentDay.isToday ? 'text-primary' : 'text-base-content/80') }));
        /** @type {__VLS_StyleScopedClasses['text-4xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
        (__VLS_ctx.currentDay.dayNumber);
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-xs text-base-content/50 mt-1" }));
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-base-content/50']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
        (__VLS_ctx.currentDay.displayDate);
        if (__VLS_ctx.currentDay.weather) {
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-center pl-4 border-l border-base-300/50" }));
            /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['pl-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-l']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-base-300/50']} */ ;
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-3xl leading-none" }));
            /** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['leading-none']} */ ;
            (__VLS_ctx.currentDay.weather.emoji);
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-lg font-semibold text-base-content/70 mt-1" }));
            /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-base-content/70']} */ ;
            /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
            (__VLS_ctx.currentDay.weather.temp);
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-xs text-base-content/40" }));
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-base-content/40']} */ ;
            (__VLS_ctx.currentDay.weather.windArrow);
            (__VLS_ctx.currentDay.weather.wind);
        }
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex-1 px-4 pb-4 space-y-3 overflow-y-auto" }));
        /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['pb-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
        var _loop_1 = function (session) {
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign(__assign(__assign({ onClick: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(__VLS_ctx.isMobile))
                        return;
                    if (!(__VLS_ctx.currentDay))
                        return;
                    __VLS_ctx.emit('selectSession', session);
                    // @ts-ignore
                    [emit, isMobile, onTouchStart, onTouchMove, onTouchEnd, currentDay, currentDay, currentDay, currentDay, currentDay, currentDay, currentDay, currentDay, currentDay, currentDay, currentDay, currentDay, slideDirection, slideDirection, slideDirection, swipeOffset, swipeOffset, currentDaySessions,];
                } }, { key: (session.id) }), { class: "session-card p-4 rounded-2xl text-white cursor-pointer shadow-lg" }), { class: ([
                    "session-".concat(session.sport),
                    session.type === 'planned' ? 'session-planned' : '',
                    ((_a = __VLS_ctx.newSessionIds) === null || _a === void 0 ? void 0 : _a.has(session.id)) || ((session.type === 'strava' || session.type === 'manual') && session.date === __VLS_ctx.today) ? 'session-today' : ''
                ]) }));
            /** @type {__VLS_StyleScopedClasses['session-card']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
            /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
            /** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "font-semibold flex items-center gap-2 text-base" }));
            /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
            __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-2xl" }));
            /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
            (__VLS_ctx.SPORT_CONFIG[session.sport].emoji);
            __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "truncate flex-1" }));
            /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
            (session.title);
            if (session.type === 'strava' || session.type === 'manual') {
                __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "opacity-70 text-lg" }));
                /** @type {__VLS_StyleScopedClasses['opacity-70']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
            }
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center justify-between mt-1" }));
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
            /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-white/80 text-sm font-medium" }));
            /** @type {__VLS_StyleScopedClasses['text-white/80']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
            (__VLS_ctx.formatDuration(session.duration_min));
            if (session.intensity) {
                __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center gap-1.5" }));
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
                __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-[10px] text-white/70 font-bold" }));
                /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-white/70']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
                (session.intensity);
                __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "w-2.5 h-2.5 rounded-full" }, { class: (__VLS_ctx.getIntensityColor(session.intensity)) }));
                /** @type {__VLS_StyleScopedClasses['w-2.5']} */ ;
                /** @type {__VLS_StyleScopedClasses['h-2.5']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
            }
            // @ts-ignore
            [newSessionIds, today, session_1.SPORT_CONFIG, formatDuration, getIntensityColor,];
        };
        for (var _i = 0, _e = __VLS_getVForSourceType((__VLS_ctx.currentDaySessions)); _i < _e.length; _i++) {
            var session = _e[_i][0];
            _loop_1(session);
        }
        if (__VLS_ctx.currentDaySessions.length === 0) {
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-center py-8 text-base-content/40" }));
            /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-8']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-base-content/40']} */ ;
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-4xl mb-2" }));
            /** @type {__VLS_StyleScopedClasses['text-4xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-xs mt-1" }));
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
        }
    }
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex justify-center gap-2 py-3" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
    var _loop_2 = function (day, i) {
        __VLS_asFunctionalElement(__VLS_intrinsics.button)(__assign(__assign(__assign({ onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.isMobile))
                    return;
                __VLS_ctx.currentDayIndex = i;
                // @ts-ignore
                [currentDaySessions, weekDays, currentDayIndex,];
            } }, { key: (day.date) }), { class: "w-2.5 h-2.5 rounded-full transition-all" }), { class: (i === __VLS_ctx.currentDayIndex ? 'bg-primary scale-125' : 'bg-base-300') }));
        /** @type {__VLS_StyleScopedClasses['w-2.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-2.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        // @ts-ignore
        [currentDayIndex,];
    };
    for (var _f = 0, _g = __VLS_getVForSourceType((__VLS_ctx.weekDays)); _f < _g.length; _f++) {
        var _h = _g[_f], day = _h[0], i = _h[1];
        _loop_2(day, i);
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "grid grid-cols-7 min-h-[280px] p-3 gap-2" }));
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-7']} */ ;
    /** @type {__VLS_StyleScopedClasses['min-h-[280px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    var _loop_3 = function (day) {
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign(__assign(__assign(__assign(__assign({ onDragover: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!!(__VLS_ctx.isMobile))
                    return;
                __VLS_ctx.onDragOver($event, day.date);
                // @ts-ignore
                [weekDays, onDragOver,];
            } }, { onDragleave: (__VLS_ctx.onDragLeave) }), { onDrop: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!!(__VLS_ctx.isMobile))
                    return;
                __VLS_ctx.onDrop($event, day.date);
                // @ts-ignore
                [onDragLeave, onDrop,];
            } }), { key: (day.date) }), { class: "flex flex-col rounded-2xl transition-all duration-200 hover:shadow-md" }), { class: ({
                'bg-primary/10 ring-2 ring-primary/30': day.isToday,
                'bg-base-200/50 hover:bg-base-200/80': !day.isToday,
                'ring-2 ring-primary/50 bg-primary/5': __VLS_ctx.dragOverDate === day.date
            }) }));
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        /** @type {__VLS_StyleScopedClasses['duration-200']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:shadow-md']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-primary/10']} */ ;
        /** @type {__VLS_StyleScopedClasses['ring-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['ring-primary/30']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-base-200/50']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-base-200/80']} */ ;
        /** @type {__VLS_StyleScopedClasses['ring-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['ring-primary/50']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-primary/5']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "p-2 text-center h-[68px]" }));
        /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-[68px]']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center justify-center gap-2 h-full" }));
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-xs uppercase text-base-content/50 font-medium tracking-wide" }));
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-base-content/50']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-wide']} */ ;
        (day.dayName);
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-xl font-bold mt-0.5" }, { class: (day.isToday ? 'text-primary' : 'text-base-content/80') }));
        /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-0.5']} */ ;
        (day.dayNumber);
        if (day.weather) {
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "tooltip tooltip-bottom text-center pl-2 border-l border-base-300/50" }, { 'data-tip': (day.weather.title) }));
            /** @type {__VLS_StyleScopedClasses['tooltip']} */ ;
            /** @type {__VLS_StyleScopedClasses['tooltip-bottom']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['pl-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-l']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-base-300/50']} */ ;
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-lg leading-none" }));
            /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
            /** @type {__VLS_StyleScopedClasses['leading-none']} */ ;
            (day.weather.emoji);
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-xs font-semibold text-base-content/70" }));
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-base-content/70']} */ ;
            (day.weather.temp);
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-[10px] text-base-content/40" }));
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-base-content/40']} */ ;
            (day.weather.windArrow);
            (day.weather.wind);
        }
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex-1 px-2 pt-3 pb-2 space-y-1.5 overflow-y-auto" }));
        /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['pt-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['pb-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-y-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
        var _loop_4 = function (session) {
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign(__assign(__assign(__assign(__assign(__assign(__assign({ onDragstart: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!!(__VLS_ctx.isMobile))
                        return;
                    __VLS_ctx.onDragStart($event, session);
                    // @ts-ignore
                    [dragOverDate, sessionsByDate, onDragStart,];
                } }, { onDragend: (__VLS_ctx.onDragEnd) }), { onClick: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!!(__VLS_ctx.isMobile))
                        return;
                    __VLS_ctx.emit('selectSession', session);
                    // @ts-ignore
                    [emit, onDragEnd,];
                } }), { key: (session.id) }), { class: "session-card p-2.5 rounded-xl text-white text-xs cursor-pointer shadow-sm" }), { class: ([
                    "session-".concat(session.sport),
                    session.type === 'planned' ? 'session-planned' : '',
                    ((_b = __VLS_ctx.newSessionIds) === null || _b === void 0 ? void 0 : _b.has(session.id)) || ((session.type === 'strava' || session.type === 'manual') && session.date === __VLS_ctx.today) ? 'session-today' : '',
                    (session.type === 'strava' || session.type === 'manual') ? 'cursor-default' : 'cursor-grab'
                ]) }), { style: ({ opacity: ((_c = __VLS_ctx.draggedSession) === null || _c === void 0 ? void 0 : _c.id) === session.id ? 0.3 : 1 }) }), { draggable: (session.type === 'planned') }));
            /** @type {__VLS_StyleScopedClasses['session-card']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-2.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
            /** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "font-semibold flex items-center gap-1.5" }));
            /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
            __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-sm" }));
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            (__VLS_ctx.SPORT_CONFIG[session.sport].emoji);
            __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "truncate" }));
            /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
            (session.title);
            if (session.type === 'strava' || session.type === 'manual') {
                __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "ml-auto opacity-70" }));
                /** @type {__VLS_StyleScopedClasses['ml-auto']} */ ;
                /** @type {__VLS_StyleScopedClasses['opacity-70']} */ ;
            }
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center justify-between mt-1" }));
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
            /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-white/70 text-[11px]" }));
            /** @type {__VLS_StyleScopedClasses['text-white/70']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
            (__VLS_ctx.formatDuration(session.duration_min));
            if (session.intensity) {
                __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center gap-1" }));
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
                __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-[9px] text-white/70 font-bold" }));
                /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-white/70']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
                (session.intensity);
                __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "w-2 h-2 rounded-full" }, { class: (__VLS_ctx.getIntensityColor(session.intensity)) }));
                /** @type {__VLS_StyleScopedClasses['w-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['h-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
            }
            // @ts-ignore
            [newSessionIds, today, session_1.SPORT_CONFIG, formatDuration, getIntensityColor, draggedSession,];
        };
        for (var _l = 0, _m = __VLS_getVForSourceType((__VLS_ctx.sessionsByDate[day.date] || [])); _l < _m.length; _l++) {
            var session = _m[_l][0];
            _loop_4(session);
        }
        // @ts-ignore
        [];
    };
    for (var _j = 0, _k = __VLS_getVForSourceType((__VLS_ctx.weekDays)); _j < _k.length; _j++) {
        var day = _k[_j][0];
        _loop_3(day);
    }
}
if (__VLS_ctx.currentPhase) {
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "px-4 py-2 hidden md:flex items-center justify-center gap-2 text-xs text-base-content/50" }));
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base-content/50']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.currentPhase.emoji || __VLS_ctx.getPhaseEmoji(__VLS_ctx.currentPhase.name));
    __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "font-medium" }));
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    (__VLS_ctx.currentPhase.name);
    __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-base-content/30" }));
    /** @type {__VLS_StyleScopedClasses['text-base-content/30']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "badge badge-xs bg-pink-500 text-white border-0" }));
    /** @type {__VLS_StyleScopedClasses['badge']} */ ;
    /** @type {__VLS_StyleScopedClasses['badge-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-pink-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-0']} */ ;
    (__VLS_ctx.phaseWeekNumber);
    (__VLS_ctx.phaseTotalWeeks);
}
// @ts-ignore
[currentPhase, currentPhase, currentPhase, currentPhase, getPhaseEmoji, phaseWeekNumber, phaseTotalWeeks,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
exports.default = {};
