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
var marked_1 = require("marked");
var session_1 = require("../types/session");
var coach_1 = require("../utils/coach");
var useStrava_1 = require("../composables/useStrava");
var updateActivity = (0, useStrava_1.useStrava)().updateActivity;
// Configure marked for inline rendering (no <p> tags)
marked_1.marked.setOptions({
    breaks: true,
    gfm: true,
});
var props = defineProps();
var emit = defineEmits();
// Close on Escape key
var handleKeydown = function (e) {
    if (e.key === 'Escape' && props.session) {
        emit('close');
    }
};
(0, vue_1.onMounted)(function () {
    document.addEventListener('keydown', handleKeydown);
});
(0, vue_1.onUnmounted)(function () {
    document.removeEventListener('keydown', handleKeydown);
});
var copied = (0, vue_1.ref)(false);
var feedbackText = (0, vue_1.ref)('');
var feedbackSaved = (0, vue_1.ref)(false);
var feedbackError = (0, vue_1.ref)(false);
var isSavingFeedback = (0, vue_1.ref)(false);
var isEditingFeedback = (0, vue_1.ref)(false);
var currentPage = (0, vue_1.ref)('details');
// Coach comment dropdown
var coachComment = (0, vue_1.ref)('');
var dropdownRef = (0, vue_1.ref)(null);
// Strava session editing
var isEditingStrava = (0, vue_1.ref)(false);
var editTitle = (0, vue_1.ref)('');
var editDescription = (0, vue_1.ref)('');
var suggestionCopied = (0, vue_1.ref)(false);
var isSaving = (0, vue_1.ref)(false);
var isResyncing = (0, vue_1.ref)(false);
// Mark as done (manual completion)
var showMarkAsDone = (0, vue_1.ref)(false);
var actualDuration = (0, vue_1.ref)(0);
var completionNote = (0, vue_1.ref)('');
var selectedFeeling = (0, vue_1.ref)(null);
var feelings = [
    { value: 'great', emoji: '💪', label: 'Super' },
    { value: 'ok', emoji: '👍', label: 'OK' },
    { value: 'hard', emoji: '😓', label: 'Dur' },
];
var selectFeeling = function (value) {
    selectedFeeling.value = selectedFeeling.value === value ? null : value;
};
var handleResync = function () {
    var _a;
    if (!((_a = props.session) === null || _a === void 0 ? void 0 : _a.strava_id))
        return;
    isResyncing.value = true;
    emit('resync', props.session.id, props.session.strava_id);
};
// Called by parent when resync is done
var onResyncComplete = function () {
    isResyncing.value = false;
};
var __VLS_exposed = { onResyncComplete: onResyncComplete };
defineExpose(__VLS_exposed);
var copyTitleSuggestion = function () { return __awaiter(void 0, void 0, void 0, function () {
    var text;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!props.session)
                    return [2 /*return*/];
                text = (0, coach_1.generateTitleSuggestionPrompt)(props.session);
                return [4 /*yield*/, navigator.clipboard.writeText(text)];
            case 1:
                _a.sent();
                suggestionCopied.value = true;
                setTimeout(function () {
                    suggestionCopied.value = false;
                }, 2000);
                return [2 /*return*/];
        }
    });
}); };
// Sync state when session changes
(0, vue_1.watch)(function () { return props.session; }, function (newSession, oldSession) {
    // Ne pas reset si on édite et que c'est la même session (juste une mise à jour)
    var isSameSession = oldSession && newSession && oldSession.id === newSession.id;
    if (!isSameSession || !isEditingFeedback.value) {
        feedbackText.value = (newSession === null || newSession === void 0 ? void 0 : newSession.coach_feedback) || '';
        isEditingFeedback.value = false;
    }
    if (!isSameSession) {
        feedbackSaved.value = false;
        currentPage.value = 'details';
        // Reset Strava editing
        isEditingStrava.value = false;
        suggestionCopied.value = false;
        // Reset mark as done / edit duration
        showMarkAsDone.value = false;
        showEditDuration.value = false;
        selectedFeeling.value = null;
    }
    editTitle.value = (newSession === null || newSession === void 0 ? void 0 : newSession.title) || '';
    editDescription.value = (newSession === null || newSession === void 0 ? void 0 : newSession.description) || '';
}, { immediate: true });
// Check if SAVED feedback exists (not local textarea content)
var hasSavedFeedback = (0, vue_1.computed)(function () { var _a, _b; return !!((_b = (_a = props.session) === null || _a === void 0 ? void 0 : _a.coach_feedback) === null || _b === void 0 ? void 0 : _b.trim()); });
// Check if planned session info exists (for Strava sessions that replaced a planned one)
var hasPlannedInfo = (0, vue_1.computed)(function () {
    var _a;
    return ((_a = props.session) === null || _a === void 0 ? void 0 : _a.type) === 'strava' &&
        (props.session.planned_title || props.session.planned_description);
});
// Render markdown feedback
var renderedFeedback = (0, vue_1.computed)(function () {
    if (!feedbackText.value.trim())
        return '';
    return (0, marked_1.marked)(feedbackText.value);
});
var saveFeedback = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        if (!props.session)
            return [2 /*return*/];
        isSavingFeedback.value = true;
        feedbackError.value = false;
        try {
            emit('updateFeedback', props.session.id, feedbackText.value);
            feedbackSaved.value = true;
            isEditingFeedback.value = false;
            setTimeout(function () {
                feedbackSaved.value = false;
            }, 2000);
        }
        catch (_b) {
            feedbackError.value = true;
            emit('toast', 'Erreur de sauvegarde', 'error');
        }
        finally {
            isSavingFeedback.value = false;
        }
        return [2 /*return*/];
    });
}); };
var startEditFeedback = function () {
    isEditingFeedback.value = true;
};
var cancelEditFeedback = function () {
    var _a;
    feedbackText.value = ((_a = props.session) === null || _a === void 0 ? void 0 : _a.coach_feedback) || '';
    isEditingFeedback.value = false;
};
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
        // Convert to pace min/km
        var paceMinPerKm = 60 / kmh;
        var paceMin = Math.floor(paceMinPerKm);
        var paceSec = Math.round((paceMinPerKm - paceMin) * 60);
        return "".concat(paceMin, "'").concat(paceSec.toString().padStart(2, '0'), "\"/km");
    }
    return "".concat(kmh.toFixed(1), " km/h");
};
var copyForAnalysis = function () {
    var args_1 = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args_1[_i] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([], args_1, true), void 0, function (withComment) {
        var comment, text;
        if (withComment === void 0) { withComment = false; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!props.session)
                        return [2 /*return*/];
                    comment = withComment ? coachComment.value : undefined;
                    text = (0, coach_1.generateAnalysisText)(props.session, comment, props.athleteProfile);
                    return [4 /*yield*/, navigator.clipboard.writeText(text)];
                case 1:
                    _a.sent();
                    copied.value = true;
                    coachComment.value = '';
                    // Fermer le dropdown
                    if (dropdownRef.value) {
                        dropdownRef.value.open = false;
                    }
                    setTimeout(function () {
                        copied.value = false;
                    }, 2000);
                    return [2 /*return*/];
            }
        });
    });
};
var handleDelete = function () {
    if (props.session) {
        emit('delete', props.session.id);
        emit('close');
    }
};
// Strava editing functions
var startEditStrava = function () {
    var _a, _b;
    editTitle.value = ((_a = props.session) === null || _a === void 0 ? void 0 : _a.title) || '';
    editDescription.value = ((_b = props.session) === null || _b === void 0 ? void 0 : _b.description) || '';
    isEditingStrava.value = true;
};
var applyPlannedInfo = function () {
    var _a, _b, _c, _d;
    // Pre-fill with planned session info and start editing
    editTitle.value = ((_a = props.session) === null || _a === void 0 ? void 0 : _a.planned_title) || ((_b = props.session) === null || _b === void 0 ? void 0 : _b.title) || '';
    editDescription.value = ((_c = props.session) === null || _c === void 0 ? void 0 : _c.planned_description) || ((_d = props.session) === null || _d === void 0 ? void 0 : _d.description) || '';
    isEditingStrava.value = true;
    currentPage.value = 'details';
};
var cancelEditStrava = function () {
    var _a, _b;
    editTitle.value = ((_a = props.session) === null || _a === void 0 ? void 0 : _a.title) || '';
    editDescription.value = ((_b = props.session) === null || _b === void 0 ? void 0 : _b.description) || '';
    isEditingStrava.value = false;
};
var saveStrava = function () { return __awaiter(void 0, void 0, void 0, function () {
    var success, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!props.session || !editTitle.value.trim())
                    return [2 /*return*/];
                isSaving.value = true;
                _b.label = 1;
            case 1:
                _b.trys.push([1, 4, 5, 6]);
                if (!props.session.strava_id) return [3 /*break*/, 3];
                return [4 /*yield*/, updateActivity(props.session.strava_id, {
                        name: editTitle.value.trim(),
                        description: editDescription.value.trim(),
                    })];
            case 2:
                success = _b.sent();
                if (!success) {
                    emit('toast', 'Erreur lors de la mise à jour sur Strava', 'error');
                    isSaving.value = false;
                    return [2 /*return*/];
                }
                _b.label = 3;
            case 3:
                // Update locally
                emit('update', props.session.id, {
                    title: editTitle.value.trim(),
                    description: editDescription.value.trim(),
                });
                isEditingStrava.value = false;
                emit('toast', 'Activité mise à jour sur Strava ✓', 'success');
                return [3 /*break*/, 6];
            case 4:
                _a = _b.sent();
                emit('toast', 'Erreur lors de la mise à jour', 'error');
                return [3 /*break*/, 6];
            case 5:
                isSaving.value = false;
                return [7 /*endfinally*/];
            case 6: return [2 /*return*/];
        }
    });
}); };
// Download Zwift .zwo workout file (XML provided by Gemini)
var downloadZwoFile = function () {
    var _a;
    if (!((_a = props.session) === null || _a === void 0 ? void 0 : _a.zwift_workout))
        return;
    var blob = new Blob([props.session.zwift_workout], { type: 'application/xml' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    // Clean filename
    var filename = props.session.title
        .replace(/[^a-zA-Z0-9àâäéèêëïîôùûüç\s-]/g, '')
        .replace(/\s+/g, '_');
    a.download = "".concat(filename, ".zwo");
    a.click();
    URL.revokeObjectURL(url);
};
// Mark as done functions
var openMarkAsDone = function () {
    var _a;
    actualDuration.value = ((_a = props.session) === null || _a === void 0 ? void 0 : _a.duration_min) || 0;
    completionNote.value = '';
    selectedFeeling.value = null;
    showMarkAsDone.value = true;
};
var confirmMarkAsDone = function () {
    var _a;
    if (!props.session)
        return;
    // Build feedback with feeling + note
    var feelingEmoji = (_a = feelings.find(function (f) { return f.value === selectedFeeling.value; })) === null || _a === void 0 ? void 0 : _a.emoji;
    var feedback = '';
    if (feelingEmoji) {
        feedback = "Ressenti: ".concat(feelingEmoji);
    }
    if (completionNote.value) {
        feedback += feedback ? "\n".concat(completionNote.value) : completionNote.value;
    }
    emit('update', props.session.id, {
        type: 'manual',
        duration_min: actualDuration.value,
        coach_feedback: feedback || undefined,
    });
    showMarkAsDone.value = false;
    emit('toast', 'Séance validée ✅');
};
// Mark as NOT done (revert to planned)
var markAsNotDone = function () {
    if (!props.session)
        return;
    emit('update', props.session.id, {
        type: 'planned',
    });
    emit('toast', 'Séance remise en prévu');
};
// Edit duration for manual sessions
var showEditDuration = (0, vue_1.ref)(false);
var editDurationValue = (0, vue_1.ref)(0);
var openEditDuration = function () {
    var _a;
    editDurationValue.value = ((_a = props.session) === null || _a === void 0 ? void 0 : _a.duration_min) || 0;
    showEditDuration.value = true;
};
var confirmEditDuration = function () {
    if (!props.session)
        return;
    emit('update', props.session.id, {
        duration_min: editDurationValue.value,
    });
    showEditDuration.value = false;
    emit('toast', 'Durée modifiée');
};
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var ___VLS_components;
var ___VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsics.dialog, __VLS_intrinsics.dialog)(__assign({ class: "modal" }, { class: ({ 'modal-open': !!__VLS_ctx.session }) }));
/** @type {__VLS_StyleScopedClasses['modal']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-open']} */ ;
if (__VLS_ctx.session) {
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "modal-box w-full h-full max-h-full md:max-w-2xl md:h-[40rem] md:max-h-[90vh] rounded-none md:rounded-2xl flex flex-col" }));
    /** @type {__VLS_StyleScopedClasses['modal-box']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-h-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:max-w-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:h-[40rem]']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:max-h-[90vh]']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-none']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!(__VLS_ctx.session))
                return;
            __VLS_ctx.emit('close');
            // @ts-ignore
            [session, session, emit,];
        } }, { class: "btn btn-circle btn-ghost absolute right-3 top-3 text-2xl z-10" }));
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-circle']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['right-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-10']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center gap-3 mb-4 flex-shrink-0" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-4xl" }));
    /** @type {__VLS_StyleScopedClasses['text-4xl']} */ ;
    (__VLS_ctx.SPORT_CONFIG[__VLS_ctx.session.sport].emoji);
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex-1" }));
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    if (__VLS_ctx.isEditingStrava) {
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-2" }));
        /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.input)(__assign(__assign({ value: (__VLS_ctx.editTitle), type: "text" }, { class: "input input-sm input-bordered w-full font-bold" }), { placeholder: "Titre de la séance" }));
        /** @type {__VLS_StyleScopedClasses['input']} */ ;
        /** @type {__VLS_StyleScopedClasses['input-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['input-bordered']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center gap-2" }));
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.h3, __VLS_intrinsics.h3)(__assign({ class: "font-bold text-lg" }));
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
        (__VLS_ctx.session.title);
        if (__VLS_ctx.session.type === 'strava') {
            __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: (__VLS_ctx.startEditStrava) }, { class: "btn btn-xs btn-ghost" }));
            /** @type {__VLS_StyleScopedClasses['btn']} */ ;
            /** @type {__VLS_StyleScopedClasses['btn-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
        }
    }
    __VLS_asFunctionalElement(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-sm text-base-content/70" }));
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base-content/70']} */ ;
    (__VLS_ctx.formatDate(__VLS_ctx.session.date));
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "tabs tabs-boxed mb-4 flex-shrink-0" }));
    /** @type {__VLS_StyleScopedClasses['tabs']} */ ;
    /** @type {__VLS_StyleScopedClasses['tabs-boxed']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign({ onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!(__VLS_ctx.session))
                return;
            __VLS_ctx.currentPage = 'details';
            // @ts-ignore
            [session, session, session, session, session_1.SPORT_CONFIG, isEditingStrava, editTitle, startEditStrava, formatDate, currentPage,];
        } }, { class: "tab" }), { class: ({ 'tab-active': __VLS_ctx.currentPage === 'details' }) }));
    /** @type {__VLS_StyleScopedClasses['tab']} */ ;
    /** @type {__VLS_StyleScopedClasses['tab-active']} */ ;
    if (__VLS_ctx.hasPlannedInfo) {
        __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign({ onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.session))
                    return;
                if (!(__VLS_ctx.hasPlannedInfo))
                    return;
                __VLS_ctx.currentPage = 'planned';
                // @ts-ignore
                [currentPage, currentPage, hasPlannedInfo,];
            } }, { class: "tab" }), { class: ({ 'tab-active': __VLS_ctx.currentPage === 'planned' }) }));
        /** @type {__VLS_StyleScopedClasses['tab']} */ ;
        /** @type {__VLS_StyleScopedClasses['tab-active']} */ ;
    }
    __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign({ onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!(__VLS_ctx.session))
                return;
            __VLS_ctx.currentPage = 'coach';
            // @ts-ignore
            [currentPage, currentPage,];
        } }, { class: "tab" }), { class: ({ 'tab-active': __VLS_ctx.currentPage === 'coach' }) }));
    /** @type {__VLS_StyleScopedClasses['tab']} */ ;
    /** @type {__VLS_StyleScopedClasses['tab-active']} */ ;
    if (__VLS_ctx.hasSavedFeedback) {
        __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "ml-1 badge badge-xs badge-success" }));
        /** @type {__VLS_StyleScopedClasses['ml-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['badge']} */ ;
        /** @type {__VLS_StyleScopedClasses['badge-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['badge-success']} */ ;
    }
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-4 flex-1 overflow-y-auto" }));
    __VLS_asFunctionalDirective(___VLS_directives.vShow)(null, __assign(__assign({}, __VLS_directiveBindingRestFields), { value: (__VLS_ctx.currentPage === 'details') }), null, null);
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex gap-2" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "badge" }, { class: ({
            'badge-outline': __VLS_ctx.session.type === 'planned',
            'bg-[#fc4c02] text-white border-0': __VLS_ctx.session.type === 'strava',
            'badge-success': __VLS_ctx.session.type === 'manual'
        }) }));
    /** @type {__VLS_StyleScopedClasses['badge']} */ ;
    /** @type {__VLS_StyleScopedClasses['badge-outline']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-[#fc4c02]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['badge-success']} */ ;
    (__VLS_ctx.session.type === 'manual' ? '✅ Fait' : __VLS_ctx.session.type);
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "badge badge-primary" }));
    /** @type {__VLS_StyleScopedClasses['badge']} */ ;
    /** @type {__VLS_StyleScopedClasses['badge-primary']} */ ;
    (__VLS_ctx.formatDuration(__VLS_ctx.session.duration_min));
    if (__VLS_ctx.session.type === 'planned' && __VLS_ctx.session.intensity) {
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "badge" }, { class: ({
                'badge-success': __VLS_ctx.session.intensity <= 3,
                'badge-warning': __VLS_ctx.session.intensity > 3 && __VLS_ctx.session.intensity <= 5,
                'badge-error': __VLS_ctx.session.intensity > 7,
                'bg-orange-500 border-orange-500 text-white': __VLS_ctx.session.intensity > 5 && __VLS_ctx.session.intensity <= 7
            }) }));
        /** @type {__VLS_StyleScopedClasses['badge']} */ ;
        /** @type {__VLS_StyleScopedClasses['badge-success']} */ ;
        /** @type {__VLS_StyleScopedClasses['badge-warning']} */ ;
        /** @type {__VLS_StyleScopedClasses['badge-error']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-orange-500']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-orange-500']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
        (__VLS_ctx.session.intensity);
    }
    if (__VLS_ctx.session.type === 'planned' && __VLS_ctx.session.intensity) {
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mt-3" }));
        /** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center justify-between text-xs text-base-content/60 mb-1" }));
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-base-content/60']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "font-semibold" }));
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        (__VLS_ctx.session.intensity);
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "h-2 bg-base-300 rounded-full overflow-hidden" }));
        /** @type {__VLS_StyleScopedClasses['h-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-base-300']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign(__assign({ class: "h-full rounded-full transition-all" }, { class: ({
                'bg-success': __VLS_ctx.session.intensity <= 3,
                'bg-warning': __VLS_ctx.session.intensity > 3 && __VLS_ctx.session.intensity <= 5,
                'bg-orange-500': __VLS_ctx.session.intensity > 5 && __VLS_ctx.session.intensity <= 7,
                'bg-error': __VLS_ctx.session.intensity > 7
            }) }), { style: ({ width: "".concat(__VLS_ctx.session.intensity * 10, "%") }) }));
        /** @type {__VLS_StyleScopedClasses['h-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-success']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-warning']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-orange-500']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-error']} */ ;
    }
    if (__VLS_ctx.isEditingStrava) {
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-3" }));
        /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.textarea, __VLS_intrinsics.textarea)(__assign(__assign({ value: (__VLS_ctx.editDescription) }, { class: "textarea textarea-bordered w-full h-24" }), { placeholder: "Description de la séance..." }));
        /** @type {__VLS_StyleScopedClasses['textarea']} */ ;
        /** @type {__VLS_StyleScopedClasses['textarea-bordered']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-24']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex justify-between items-center" }));
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign({ onClick: (__VLS_ctx.copyTitleSuggestion) }, { class: "btn btn-sm btn-outline" }), { class: (__VLS_ctx.suggestionCopied ? 'btn-success' : '') }));
        /** @type {__VLS_StyleScopedClasses['btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-outline']} */ ;
        (__VLS_ctx.suggestionCopied ? '✓ Copié !' : '🤖 Suggérer titre');
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex gap-2" }));
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign({ onClick: (__VLS_ctx.cancelEditStrava) }, { class: "btn btn-sm btn-ghost" }), { disabled: (__VLS_ctx.isSaving) }));
        /** @type {__VLS_StyleScopedClasses['btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign({ onClick: (__VLS_ctx.saveStrava) }, { class: "btn btn-sm btn-primary" }), { disabled: (!__VLS_ctx.editTitle.trim() || __VLS_ctx.isSaving) }));
        /** @type {__VLS_StyleScopedClasses['btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
        if (__VLS_ctx.isSaving) {
            __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "loading loading-spinner loading-xs" }));
            /** @type {__VLS_StyleScopedClasses['loading']} */ ;
            /** @type {__VLS_StyleScopedClasses['loading-spinner']} */ ;
            /** @type {__VLS_StyleScopedClasses['loading-xs']} */ ;
        }
        (__VLS_ctx.isSaving ? 'Envoi...' : '💾 Enregistrer');
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-base-content/80 whitespace-pre-line" }));
        /** @type {__VLS_StyleScopedClasses['text-base-content/80']} */ ;
        /** @type {__VLS_StyleScopedClasses['whitespace-pre-line']} */ ;
        (__VLS_ctx.session.description);
    }
    if (__VLS_ctx.session.average_heartrate || __VLS_ctx.session.average_watts) {
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex flex-wrap gap-2" }));
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        if (__VLS_ctx.session.average_heartrate) {
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "badge badge-error gap-1" }));
            /** @type {__VLS_StyleScopedClasses['badge']} */ ;
            /** @type {__VLS_StyleScopedClasses['badge-error']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
            __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            (Math.round(__VLS_ctx.session.average_heartrate));
        }
        if (__VLS_ctx.session.max_heartrate) {
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "badge badge-error badge-outline gap-1" }));
            /** @type {__VLS_StyleScopedClasses['badge']} */ ;
            /** @type {__VLS_StyleScopedClasses['badge-error']} */ ;
            /** @type {__VLS_StyleScopedClasses['badge-outline']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
            (__VLS_ctx.session.max_heartrate);
        }
        if (__VLS_ctx.session.average_watts) {
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "badge badge-warning gap-1" }));
            /** @type {__VLS_StyleScopedClasses['badge']} */ ;
            /** @type {__VLS_StyleScopedClasses['badge-warning']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
            __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            (Math.round(__VLS_ctx.session.average_watts));
        }
        if (__VLS_ctx.session.average_cadence) {
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "badge badge-info gap-1" }));
            /** @type {__VLS_StyleScopedClasses['badge']} */ ;
            /** @type {__VLS_StyleScopedClasses['badge-info']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
            (Math.round(__VLS_ctx.session.average_cadence));
            (__VLS_ctx.session.sport === 'running' ? 'ppm' : 'rpm');
        }
    }
    if ((__VLS_ctx.session.sport === 'cycling' || __VLS_ctx.session.sport === 'mtb') &&
        (__VLS_ctx.session.normalized_power ||
            __VLS_ctx.session.intensity_factor ||
            __VLS_ctx.session.variability_index ||
            __VLS_ctx.session.aerobic_decoupling !== undefined ||
            __VLS_ctx.session.average_vam ||
            __VLS_ctx.session.suffer_score ||
            __VLS_ctx.session.kilojoules)) {
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "bg-base-200 rounded-lg p-3" }));
        /** @type {__VLS_StyleScopedClasses['bg-base-200']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-sm font-medium mb-2" }));
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
        (__VLS_ctx.session.sport === 'mtb' ? 'Metriques VTT' : 'Metriques velo');
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "grid grid-cols-2 sm:grid-cols-3 gap-2 text-center" }));
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:grid-cols-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        if (__VLS_ctx.session.normalized_power) {
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "bg-base-100 rounded p-2" }));
            /** @type {__VLS_StyleScopedClasses['bg-base-100']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-xs text-base-content/60" }));
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-base-content/60']} */ ;
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "font-bold text-warning" }));
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-warning']} */ ;
            (Math.round(__VLS_ctx.session.normalized_power));
        }
        if (__VLS_ctx.session.intensity_factor) {
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "bg-base-100 rounded p-2" }));
            /** @type {__VLS_StyleScopedClasses['bg-base-100']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-xs text-base-content/60" }));
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-base-content/60']} */ ;
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "font-bold" }, { class: (__VLS_ctx.session.intensity_factor > 1 ? 'text-error' : 'text-success') }));
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            (__VLS_ctx.session.intensity_factor.toFixed(2));
        }
        if (__VLS_ctx.session.variability_index) {
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "bg-base-100 rounded p-2" }));
            /** @type {__VLS_StyleScopedClasses['bg-base-100']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-xs text-base-content/60" }));
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-base-content/60']} */ ;
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "font-bold" }));
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            (__VLS_ctx.session.variability_index.toFixed(2));
        }
        if (__VLS_ctx.session.aerobic_decoupling !== undefined) {
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "bg-base-100 rounded p-2" }));
            /** @type {__VLS_StyleScopedClasses['bg-base-100']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-xs text-base-content/60" }));
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-base-content/60']} */ ;
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "font-bold" }, { class: (__VLS_ctx.session.aerobic_decoupling > 5 ? 'text-warning' : 'text-success') }));
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            (__VLS_ctx.session.aerobic_decoupling.toFixed(1));
        }
        if (__VLS_ctx.session.average_vam) {
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "bg-base-100 rounded p-2" }));
            /** @type {__VLS_StyleScopedClasses['bg-base-100']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-xs text-base-content/60" }));
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-base-content/60']} */ ;
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "font-bold" }));
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            (__VLS_ctx.session.average_vam);
        }
        if (__VLS_ctx.session.suffer_score) {
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "bg-base-100 rounded p-2" }));
            /** @type {__VLS_StyleScopedClasses['bg-base-100']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-xs text-base-content/60" }));
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-base-content/60']} */ ;
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "font-bold text-error" }));
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-error']} */ ;
            (__VLS_ctx.session.suffer_score);
        }
        if (__VLS_ctx.session.kilojoules) {
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "bg-base-100 rounded p-2" }));
            /** @type {__VLS_StyleScopedClasses['bg-base-100']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-xs text-base-content/60" }));
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-base-content/60']} */ ;
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "font-bold" }));
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            (Math.round(__VLS_ctx.session.kilojoules));
        }
        if (__VLS_ctx.session.calories) {
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "bg-base-100 rounded p-2" }));
            /** @type {__VLS_StyleScopedClasses['bg-base-100']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-xs text-base-content/60" }));
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-base-content/60']} */ ;
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "font-bold" }));
            /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
            (__VLS_ctx.session.calories);
        }
        if (__VLS_ctx.session.device_watts === false) {
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-xs text-warning mt-2 text-center" }));
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-warning']} */ ;
            /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        }
    }
    if (__VLS_ctx.session.laps && __VLS_ctx.session.laps.length > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "collapse collapse-arrow bg-base-200" }));
        /** @type {__VLS_StyleScopedClasses['collapse']} */ ;
        /** @type {__VLS_StyleScopedClasses['collapse-arrow']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-base-200']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.input)({
            type: "checkbox",
            checked: true,
        });
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "collapse-title font-medium" }));
        /** @type {__VLS_StyleScopedClasses['collapse-title']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        (__VLS_ctx.session.laps.length);
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "collapse-content" }));
        /** @type {__VLS_StyleScopedClasses['collapse-content']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "overflow-x-auto" }));
        /** @type {__VLS_StyleScopedClasses['overflow-x-auto']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.table, __VLS_intrinsics.table)(__assign({ class: "table table-xs" }));
        /** @type {__VLS_StyleScopedClasses['table']} */ ;
        /** @type {__VLS_StyleScopedClasses['table-xs']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.thead, __VLS_intrinsics.thead)({});
        __VLS_asFunctionalElement(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({});
        __VLS_asFunctionalElement(__VLS_intrinsics.th, __VLS_intrinsics.th)({});
        __VLS_asFunctionalElement(__VLS_intrinsics.th, __VLS_intrinsics.th)({});
        __VLS_asFunctionalElement(__VLS_intrinsics.th, __VLS_intrinsics.th)({});
        __VLS_asFunctionalElement(__VLS_intrinsics.th, __VLS_intrinsics.th)({});
        __VLS_asFunctionalElement(__VLS_intrinsics.th, __VLS_intrinsics.th)({});
        if (__VLS_ctx.session.laps.some(function (l) { return l.average_heartrate; })) {
            __VLS_asFunctionalElement(__VLS_intrinsics.th, __VLS_intrinsics.th)({});
        }
        if (__VLS_ctx.session.laps.some(function (l) { return l.average_watts; })) {
            __VLS_asFunctionalElement(__VLS_intrinsics.th, __VLS_intrinsics.th)({});
        }
        __VLS_asFunctionalElement(__VLS_intrinsics.tbody, __VLS_intrinsics.tbody)({});
        for (var _i = 0, _a = __VLS_getVForSourceType((__VLS_ctx.session.laps)); _i < _a.length; _i++) {
            var _b = _a[_i], lap = _b[0], i = _b[1];
            __VLS_asFunctionalElement(__VLS_intrinsics.tr, __VLS_intrinsics.tr)(__assign({ key: (i) }, { class: "hover" }));
            /** @type {__VLS_StyleScopedClasses['hover']} */ ;
            __VLS_asFunctionalElement(__VLS_intrinsics.td, __VLS_intrinsics.td)(__assign({ class: "font-mono" }));
            /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
            (i + 1);
            __VLS_asFunctionalElement(__VLS_intrinsics.td, __VLS_intrinsics.td)(__assign({ class: "truncate max-w-24" }));
            /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
            /** @type {__VLS_StyleScopedClasses['max-w-24']} */ ;
            (lap.name);
            __VLS_asFunctionalElement(__VLS_intrinsics.td, __VLS_intrinsics.td)(__assign({ class: "font-mono" }));
            /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
            (__VLS_ctx.formatLapDuration(lap.moving_time));
            __VLS_asFunctionalElement(__VLS_intrinsics.td, __VLS_intrinsics.td)(__assign({ class: "font-mono" }));
            /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
            ((lap.distance / 1000).toFixed(2));
            __VLS_asFunctionalElement(__VLS_intrinsics.td, __VLS_intrinsics.td)(__assign({ class: "font-mono" }));
            /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
            (__VLS_ctx.formatSpeed(lap.average_speed, __VLS_ctx.session.sport));
            if (__VLS_ctx.session.laps.some(function (l) { return l.average_heartrate; })) {
                __VLS_asFunctionalElement(__VLS_intrinsics.td, __VLS_intrinsics.td)(__assign({ class: "font-mono text-error" }));
                /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-error']} */ ;
                (lap.average_heartrate ? Math.round(lap.average_heartrate) : '-');
            }
            if (__VLS_ctx.session.laps.some(function (l) { return l.average_watts; })) {
                __VLS_asFunctionalElement(__VLS_intrinsics.td, __VLS_intrinsics.td)(__assign({ class: "font-mono text-warning" }));
                /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-warning']} */ ;
                (lap.average_watts ? Math.round(lap.average_watts) : '-');
            }
            // @ts-ignore
            [session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, session, isEditingStrava, editTitle, currentPage, currentPage, hasSavedFeedback, formatDuration, editDescription, copyTitleSuggestion, suggestionCopied, suggestionCopied, cancelEditStrava, isSaving, isSaving, isSaving, isSaving, saveStrava, formatLapDuration, formatSpeed,];
        }
    }
    if (__VLS_ctx.session.structure && __VLS_ctx.session.structure.length > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "collapse collapse-arrow bg-base-200" }));
        /** @type {__VLS_StyleScopedClasses['collapse']} */ ;
        /** @type {__VLS_StyleScopedClasses['collapse-arrow']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-base-200']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.input)({
            type: "checkbox",
        });
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "collapse-title font-medium" }));
        /** @type {__VLS_StyleScopedClasses['collapse-title']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "collapse-content" }));
        /** @type {__VLS_StyleScopedClasses['collapse-content']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "overflow-x-auto" }));
        /** @type {__VLS_StyleScopedClasses['overflow-x-auto']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.table, __VLS_intrinsics.table)(__assign({ class: "table table-sm" }));
        /** @type {__VLS_StyleScopedClasses['table']} */ ;
        /** @type {__VLS_StyleScopedClasses['table-sm']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.thead, __VLS_intrinsics.thead)({});
        __VLS_asFunctionalElement(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({});
        __VLS_asFunctionalElement(__VLS_intrinsics.th, __VLS_intrinsics.th)({});
        __VLS_asFunctionalElement(__VLS_intrinsics.th, __VLS_intrinsics.th)({});
        __VLS_asFunctionalElement(__VLS_intrinsics.th, __VLS_intrinsics.th)({});
        __VLS_asFunctionalElement(__VLS_intrinsics.tbody, __VLS_intrinsics.tbody)({});
        for (var _c = 0, _d = __VLS_getVForSourceType((__VLS_ctx.session.structure)); _c < _d.length; _c++) {
            var _e = _d[_c], phase = _e[0], i = _e[1];
            __VLS_asFunctionalElement(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({
                key: (i),
            });
            __VLS_asFunctionalElement(__VLS_intrinsics.td, __VLS_intrinsics.td)(__assign({ class: "capitalize" }));
            /** @type {__VLS_StyleScopedClasses['capitalize']} */ ;
            (phase.phase);
            if (phase.reps && phase.reps > 1) {
                __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "badge badge-xs" }));
                /** @type {__VLS_StyleScopedClasses['badge']} */ ;
                /** @type {__VLS_StyleScopedClasses['badge-xs']} */ ;
                (phase.reps);
            }
            __VLS_asFunctionalElement(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
            (phase.min);
            __VLS_asFunctionalElement(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
            if (phase.ftp_pct) {
                __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
                (phase.ftp_pct[0]);
                (phase.ftp_pct[1]);
            }
            else if (phase.hr_max_pct) {
                __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
                (phase.hr_max_pct[0]);
                (phase.hr_max_pct[1]);
            }
            // @ts-ignore
            [session, session, session,];
        }
    }
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-4 flex-1 overflow-y-auto" }));
    __VLS_asFunctionalDirective(___VLS_directives.vShow)(null, __assign(__assign({}, __VLS_directiveBindingRestFields), { value: (__VLS_ctx.currentPage === 'planned') }), null, null);
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "bg-base-200 rounded-lg p-4 space-y-3" }));
    /** @type {__VLS_StyleScopedClasses['bg-base-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-sm text-base-content/60" }));
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base-content/60']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-xs text-base-content/50 mb-1" }));
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base-content/50']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "font-semibold" }));
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    (__VLS_ctx.session.planned_title);
    if (__VLS_ctx.session.planned_description) {
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-xs text-base-content/50 mb-1" }));
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-base-content/50']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-sm text-base-content/80 whitespace-pre-wrap" }));
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-base-content/80']} */ ;
        /** @type {__VLS_StyleScopedClasses['whitespace-pre-wrap']} */ ;
        (__VLS_ctx.session.planned_description);
    }
    __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: (__VLS_ctx.applyPlannedInfo) }, { class: "btn btn-primary w-full" }));
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-xs text-center text-base-content/50" }));
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base-content/50']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-4 flex-1 overflow-y-auto" }));
    __VLS_asFunctionalDirective(___VLS_directives.vShow)(null, __assign(__assign({}, __VLS_directiveBindingRestFields), { value: (__VLS_ctx.currentPage === 'coach') }), null, null);
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
    if (__VLS_ctx.hasSavedFeedback && !__VLS_ctx.isEditingFeedback) {
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-3" }));
        /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "bg-base-200 rounded-lg p-4 text-sm feedback-markdown" }));
        __VLS_asFunctionalDirective(___VLS_directives.vHtml)(null, __assign(__assign({}, __VLS_directiveBindingRestFields), { value: (__VLS_ctx.renderedFeedback) }), null, null);
        /** @type {__VLS_StyleScopedClasses['bg-base-200']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['feedback-markdown']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex justify-end" }));
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: (__VLS_ctx.startEditFeedback) }, { class: "btn btn-sm btn-ghost" }));
        /** @type {__VLS_StyleScopedClasses['btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-3" }));
        /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.textarea, __VLS_intrinsics.textarea)(__assign(__assign({ value: (__VLS_ctx.feedbackText) }, { class: "textarea textarea-bordered w-full h-32" }), { placeholder: "\u0043\u006f\u006c\u006c\u0065\u0020\u0069\u0063\u0069\u0020\u006c\u0065\u0020\u0072\u0065\u0074\u006f\u0075\u0072\u0020\u0064\u0065\u0020\u0074\u006f\u006e\u0020\u0063\u006f\u0061\u0063\u0068\u002e\u002e\u002e\u000a\u000a\u0045\u0078\u0065\u006d\u0070\u006c\u0065\u003a\u000a\u26a1\u0020\u0043\u0068\u0061\u0072\u0067\u0065\u003a\u0020\u004d\u006f\u0064\u00e9\u0072\u00e9\u0065\u0020\u002d\u0020\u0062\u006f\u006e\u006e\u0065\u0020\u0073\u00e9\u0061\u006e\u0063\u0065\u0020\u0064\u0027\u0065\u006e\u0064\u0075\u0072\u0061\u006e\u0063\u0065\u000a\u2705\u0020\u0050\u006f\u0069\u006e\u0074\u0073\u0020\u0070\u006f\u0073\u0069\u0074\u0069\u0066\u0073\u003a\u0020\u0052\u00e9\u0067\u0075\u006c\u0061\u0072\u0069\u0074\u00e9\u002c\u0020\u0062\u006f\u006e\u006e\u0065\u0020\u0067\u0065\u0073\u0074\u0069\u006f\u006e\u0020\u0064\u0065\u0020\u006c\u0027\u0065\u0066\u0066\u006f\u0072\u0074\u000a\u26a0\ufe0f\u0020\u00c0\u0020\u0061\u006d\u00e9\u006c\u0069\u006f\u0072\u0065\u0072\u003a\u0020\u0043\u0061\u0064\u0065\u006e\u0063\u0065\u0020\u0075\u006e\u0020\u0070\u0065\u0075\u0020\u0062\u0061\u0073\u0073\u0065\u000a\ud83d\udca1\u0020\u0043\u006f\u006e\u0073\u0065\u0069\u006c\u003a\u0020\u0054\u0072\u0061\u0076\u0061\u0069\u006c\u006c\u0065\u0020\u006c\u0061\u0020\u0076\u00e9\u006c\u006f\u0063\u0069\u0074\u00e9\u0020\u0073\u0075\u0072\u0020\u006c\u0065\u0020\u0070\u0072\u006f\u0063\u0068\u0061\u0069\u006e\u0020\u0065\u006e\u0074\u0072\u0061\u00ee\u006e\u0065\u006d\u0065\u006e\u0074" }));
        /** @type {__VLS_StyleScopedClasses['textarea']} */ ;
        /** @type {__VLS_StyleScopedClasses['textarea-bordered']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-32']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex justify-end gap-2" }));
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        if (__VLS_ctx.hasSavedFeedback) {
            __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign({ onClick: (__VLS_ctx.cancelEditFeedback) }, { class: "btn btn-sm btn-ghost" }), { disabled: (__VLS_ctx.isSavingFeedback) }));
            /** @type {__VLS_StyleScopedClasses['btn']} */ ;
            /** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
        }
        __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign(__assign({ onClick: (__VLS_ctx.saveFeedback) }, { class: "btn btn-sm" }), { class: ({
                'btn-success': __VLS_ctx.feedbackSaved,
                'btn-error': __VLS_ctx.feedbackError,
                'btn-primary': !__VLS_ctx.feedbackSaved && !__VLS_ctx.feedbackError
            }) }), { disabled: (__VLS_ctx.isSavingFeedback) }));
        /** @type {__VLS_StyleScopedClasses['btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-success']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-error']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
        if (__VLS_ctx.isSavingFeedback) {
            __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "loading loading-spinner loading-xs" }));
            /** @type {__VLS_StyleScopedClasses['loading']} */ ;
            /** @type {__VLS_StyleScopedClasses['loading-spinner']} */ ;
            /** @type {__VLS_StyleScopedClasses['loading-xs']} */ ;
        }
        (__VLS_ctx.isSavingFeedback ? 'Sauvegarde...' : __VLS_ctx.feedbackSaved ? '✓ Sauvegardé !' : __VLS_ctx.feedbackError ? '✗ Erreur' : '💾 Sauvegarder');
    }
    if (__VLS_ctx.showMarkAsDone && __VLS_ctx.session.type === 'planned') {
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mt-4 p-4 bg-success/10 border border-success/30 rounded-lg flex-shrink-0" }));
        /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-success/10']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-success/30']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.h4, __VLS_intrinsics.h4)(__assign({ class: "font-semibold mb-3 text-success" }));
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-success']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "form-control mb-3" }));
        /** @type {__VLS_StyleScopedClasses['form-control']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.label, __VLS_intrinsics.label)(__assign({ class: "label py-1" }));
        /** @type {__VLS_StyleScopedClasses['label']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "label-text" }));
        /** @type {__VLS_StyleScopedClasses['label-text']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.input)(__assign(__assign({ type: "number" }, { class: "input input-bordered input-sm w-full" }), { min: "1" }));
        (__VLS_ctx.actualDuration);
        /** @type {__VLS_StyleScopedClasses['input']} */ ;
        /** @type {__VLS_StyleScopedClasses['input-bordered']} */ ;
        /** @type {__VLS_StyleScopedClasses['input-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "form-control mb-3" }));
        /** @type {__VLS_StyleScopedClasses['form-control']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.label, __VLS_intrinsics.label)(__assign({ class: "label py-1" }));
        /** @type {__VLS_StyleScopedClasses['label']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "label-text" }));
        /** @type {__VLS_StyleScopedClasses['label-text']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex gap-2 mb-2" }));
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
        var _loop_1 = function (feeling) {
            __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign(__assign({ onClick: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(__VLS_ctx.session))
                        return;
                    if (!(__VLS_ctx.showMarkAsDone && __VLS_ctx.session.type === 'planned'))
                        return;
                    __VLS_ctx.selectFeeling(feeling.value);
                    // @ts-ignore
                    [session, session, session, session, currentPage, currentPage, hasSavedFeedback, hasSavedFeedback, applyPlannedInfo, isEditingFeedback, renderedFeedback, startEditFeedback, feedbackText, cancelEditFeedback, isSavingFeedback, isSavingFeedback, isSavingFeedback, isSavingFeedback, saveFeedback, feedbackSaved, feedbackSaved, feedbackSaved, feedbackError, feedbackError, feedbackError, showMarkAsDone, actualDuration, feelings, selectFeeling,];
                } }, { key: (feeling.value), type: "button" }), { class: "btn btn-sm flex-1" }), { class: (__VLS_ctx.selectedFeeling === feeling.value ? 'btn-primary' : 'btn-ghost') }));
            /** @type {__VLS_StyleScopedClasses['btn']} */ ;
            /** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
            (feeling.emoji);
            (feeling.label);
            // @ts-ignore
            [selectedFeeling,];
        };
        for (var _f = 0, _g = __VLS_getVForSourceType((__VLS_ctx.feelings)); _f < _g.length; _f++) {
            var feeling = _g[_f][0];
            _loop_1(feeling);
        }
        __VLS_asFunctionalElement(__VLS_intrinsics.textarea, __VLS_intrinsics.textarea)(__assign(__assign({ value: (__VLS_ctx.completionNote) }, { class: "textarea textarea-bordered textarea-sm w-full h-16" }), { placeholder: "Détails sur la séance..." }));
        /** @type {__VLS_StyleScopedClasses['textarea']} */ ;
        /** @type {__VLS_StyleScopedClasses['textarea-bordered']} */ ;
        /** @type {__VLS_StyleScopedClasses['textarea-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-16']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex gap-2 justify-end" }));
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.session))
                    return;
                if (!(__VLS_ctx.showMarkAsDone && __VLS_ctx.session.type === 'planned'))
                    return;
                __VLS_ctx.showMarkAsDone = false;
                // @ts-ignore
                [showMarkAsDone, completionNote,];
            } }, { class: "btn btn-sm btn-ghost" }));
        /** @type {__VLS_StyleScopedClasses['btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: (__VLS_ctx.confirmMarkAsDone) }, { class: "btn btn-sm btn-success" }));
        /** @type {__VLS_StyleScopedClasses['btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-success']} */ ;
    }
    if (__VLS_ctx.showEditDuration && __VLS_ctx.session.type === 'manual') {
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mt-4 p-4 bg-info/10 border border-info/30 rounded-lg flex-shrink-0" }));
        /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-info/10']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-info/30']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.h4, __VLS_intrinsics.h4)(__assign({ class: "font-semibold mb-3 text-info" }));
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-info']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "form-control mb-3" }));
        /** @type {__VLS_StyleScopedClasses['form-control']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.label, __VLS_intrinsics.label)(__assign({ class: "label py-1" }));
        /** @type {__VLS_StyleScopedClasses['label']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "label-text" }));
        /** @type {__VLS_StyleScopedClasses['label-text']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.input)(__assign(__assign({ type: "number" }, { class: "input input-bordered input-sm w-full" }), { min: "1" }));
        (__VLS_ctx.editDurationValue);
        /** @type {__VLS_StyleScopedClasses['input']} */ ;
        /** @type {__VLS_StyleScopedClasses['input-bordered']} */ ;
        /** @type {__VLS_StyleScopedClasses['input-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex gap-2 justify-end" }));
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.session))
                    return;
                if (!(__VLS_ctx.showEditDuration && __VLS_ctx.session.type === 'manual'))
                    return;
                __VLS_ctx.showEditDuration = false;
                // @ts-ignore
                [session, confirmMarkAsDone, showEditDuration, showEditDuration, editDurationValue,];
            } }, { class: "btn btn-sm btn-ghost" }));
        /** @type {__VLS_StyleScopedClasses['btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: (__VLS_ctx.confirmEditDuration) }, { class: "btn btn-sm btn-info" }));
        /** @type {__VLS_StyleScopedClasses['btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-info']} */ ;
    }
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex flex-wrap gap-2 pt-4 border-t border-base-300 flex-shrink-0" }));
    __VLS_asFunctionalDirective(___VLS_directives.vShow)(null, __assign(__assign({}, __VLS_directiveBindingRestFields), { value: (__VLS_ctx.currentPage === 'details') }), null, null);
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['pt-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-base-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
    if (__VLS_ctx.session.type === 'planned' && !__VLS_ctx.showMarkAsDone) {
        __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: (__VLS_ctx.openMarkAsDone) }, { class: "btn btn-sm btn-success" }));
        /** @type {__VLS_StyleScopedClasses['btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-success']} */ ;
    }
    if (__VLS_ctx.session.type === 'manual' && !__VLS_ctx.showEditDuration) {
        __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: (__VLS_ctx.markAsNotDone) }, { class: "btn btn-sm btn-ghost" }));
        /** @type {__VLS_StyleScopedClasses['btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
    }
    if (__VLS_ctx.session.type === 'manual' && !__VLS_ctx.showEditDuration) {
        __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: (__VLS_ctx.openEditDuration) }, { class: "btn btn-sm btn-info btn-outline" }));
        /** @type {__VLS_StyleScopedClasses['btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-info']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-outline']} */ ;
    }
    if (__VLS_ctx.session.strava_id || __VLS_ctx.session.actual_km) {
        __VLS_asFunctionalElement(__VLS_intrinsics.details, __VLS_intrinsics.details)(__assign({ ref: "dropdownRef" }, { class: "dropdown dropdown-top" }));
        /** @type {__VLS_StyleScopedClasses['dropdown']} */ ;
        /** @type {__VLS_StyleScopedClasses['dropdown-top']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.summary, __VLS_intrinsics.summary)(__assign({ class: "btn btn-sm btn-outline" }, { class: (__VLS_ctx.copied ? 'btn-success' : 'btn-primary') }));
        /** @type {__VLS_StyleScopedClasses['btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-outline']} */ ;
        (__VLS_ctx.copied ? '✓ Copié !' : '📋 Copier pour coach');
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "dropdown-content bg-base-200 rounded-box p-4 shadow-xl w-72 mb-2 right-1" }));
        /** @type {__VLS_StyleScopedClasses['dropdown-content']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-base-200']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-box']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-72']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['right-1']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-sm font-medium mb-2" }));
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.textarea, __VLS_intrinsics.textarea)(__assign(__assign({ value: (__VLS_ctx.coachComment) }, { class: "textarea textarea-bordered w-full h-20 text-sm" }), { placeholder: "Jambes lourdes, super sensations, objectif atteint..." }));
        /** @type {__VLS_StyleScopedClasses['textarea']} */ ;
        /** @type {__VLS_StyleScopedClasses['textarea-bordered']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-20']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex justify-end gap-2 mt-2" }));
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.session))
                    return;
                if (!(__VLS_ctx.session.strava_id || __VLS_ctx.session.actual_km))
                    return;
                __VLS_ctx.copyForAnalysis(false);
                // @ts-ignore
                [session, session, session, session, session, currentPage, showMarkAsDone, showEditDuration, showEditDuration, confirmEditDuration, openMarkAsDone, markAsNotDone, openEditDuration, copied, copied, coachComment, copyForAnalysis,];
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
                if (!(__VLS_ctx.session))
                    return;
                if (!(__VLS_ctx.session.strava_id || __VLS_ctx.session.actual_km))
                    return;
                __VLS_ctx.copyForAnalysis(true);
                // @ts-ignore
                [copyForAnalysis,];
            } }, { class: "btn btn-sm btn-primary" }));
        /** @type {__VLS_StyleScopedClasses['btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
    }
    if (__VLS_ctx.session.type === 'strava' && __VLS_ctx.session.strava_id) {
        __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign({ onClick: (__VLS_ctx.handleResync) }, { class: "btn btn-sm btn-outline btn-info" }), { disabled: (__VLS_ctx.isResyncing) }));
        /** @type {__VLS_StyleScopedClasses['btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-outline']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-info']} */ ;
        if (__VLS_ctx.isResyncing) {
            __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "loading loading-spinner loading-xs" }));
            /** @type {__VLS_StyleScopedClasses['loading']} */ ;
            /** @type {__VLS_StyleScopedClasses['loading-spinner']} */ ;
            /** @type {__VLS_StyleScopedClasses['loading-xs']} */ ;
        }
        (__VLS_ctx.isResyncing ? 'Sync...' : '🔄 Re-sync');
    }
    if (__VLS_ctx.session.zwift_workout) {
        __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: (__VLS_ctx.downloadZwoFile) }, { class: "btn btn-sm btn-outline btn-warning" }));
        /** @type {__VLS_StyleScopedClasses['btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-outline']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-warning']} */ ;
    }
    __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: (__VLS_ctx.handleDelete) }, { class: "btn btn-sm btn-error btn-outline" }));
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-error']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-outline']} */ ;
}
__VLS_asFunctionalElement(__VLS_intrinsics.form, __VLS_intrinsics.form)(__assign(__assign({ onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.emit('close');
        // @ts-ignore
        [session, session, session, emit, handleResync, isResyncing, isResyncing, isResyncing, downloadZwoFile, handleDelete,];
    } }, { method: "dialog" }), { class: "modal-backdrop" }));
/** @type {__VLS_StyleScopedClasses['modal-backdrop']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)({});
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    setup: function () { return (__VLS_exposed); },
    __typeEmits: {},
    __typeProps: {},
});
exports.default = {};
