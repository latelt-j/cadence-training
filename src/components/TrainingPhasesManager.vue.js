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
var uuid_1 = require("uuid");
var props = defineProps();
var emit = defineEmits();
// Coach prompt state
var showCoachImport = (0, vue_1.ref)(false);
var coachJsonInput = (0, vue_1.ref)('');
var coachCopied = (0, vue_1.ref)(false);
var importError = (0, vue_1.ref)('');
// Local copy of phases for editing
var localPhases = (0, vue_1.ref)([]);
// Sync with props
(0, vue_1.watch)(function () { return props.phases; }, function (newPhases) {
    localPhases.value = JSON.parse(JSON.stringify(newPhases || []));
}, { immediate: true });
// Sort phases by start_date and assign numbers
var sortedPhases = (0, vue_1.computed)(function () {
    return __spreadArray([], localPhases.value, true).sort(function (a, b) { return a.start_date.localeCompare(b.start_date); })
        .map(function (phase, index) { return (__assign(__assign({}, phase), { number: index + 1 })); });
});
// Editing state
var isEditing = (0, vue_1.ref)(false);
var editingPhase = (0, vue_1.ref)(null);
var formRef = (0, vue_1.ref)(null);
var currentPhaseRef = (0, vue_1.ref)(null);
// Get phase status (past, current, future)
var getPhaseStatus = function (phase) {
    var _a;
    var today = (_a = new Date().toISOString().split('T')[0]) !== null && _a !== void 0 ? _a : '';
    if (phase.end_date < today)
        return 'past';
    if (phase.start_date <= today && phase.end_date >= today)
        return 'current';
    return 'future';
};
// Auto-scroll to current phase on mount
(0, vue_1.onMounted)(function () {
    (0, vue_1.nextTick)(function () {
        setTimeout(function () {
            var _a;
            (_a = currentPhaseRef.value) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    });
});
// Form data
var formData = (0, vue_1.ref)({
    name: '',
    emoji: '📊',
    start_date: '',
    end_date: '',
    objectives: '',
    keywords: '',
    cycling_pct: 80,
    volume_note: '',
    challenge: '',
});
// Computed running percentage
var running_pct = (0, vue_1.computed)(function () { return 100 - formData.value.cycling_pct; });
// Generate volume distribution string
var formatVolumeDistribution = function (cyclingPct, note) {
    var runningPct = 100 - cyclingPct;
    var result = "".concat(cyclingPct, "% V\u00E9lo / ").concat(runningPct, "% Run");
    if (note)
        result += " (".concat(note, ")");
    return result;
};
// Parse volume distribution string
var parseVolumeDistribution = function (str) {
    var _a;
    var match = str.match(/(\d+)%\s*Vélo/);
    var noteMatch = str.match(/\(([^)]+)\)/);
    return {
        cycling_pct: (match === null || match === void 0 ? void 0 : match[1]) ? parseInt(match[1]) : 80,
        note: (_a = noteMatch === null || noteMatch === void 0 ? void 0 : noteMatch[1]) !== null && _a !== void 0 ? _a : ''
    };
};
// Hints based on cycling percentage
var volumeHint = (0, vue_1.computed)(function () {
    var pct = formData.value.cycling_pct;
    if (pct === 100)
        return '🚴 Vélo pur';
    if (pct >= 90)
        return '🚴 Focus vélo, run maintenance';
    if (pct >= 80)
        return '🚴 Priorité vélo, cross-training léger';
    if (pct >= 70)
        return '⚖️ Dominante vélo';
    if (pct >= 60)
        return '⚖️ Mixte vélo-dominant';
    if (pct === 50)
        return '⚖️ Équilibré 50/50';
    if (pct >= 40)
        return '⚖️ Mixte run-dominant';
    if (pct >= 30)
        return '🏃 Dominante course';
    if (pct >= 20)
        return '🏃 Priorité run, cross-training léger';
    if (pct >= 10)
        return '🏃 Focus run, vélo maintenance';
    return '🏃 Course pure';
});
// Available emojis for phases
var phaseEmojis = [
    { emoji: '🏗️', label: 'Base' },
    { emoji: '💪', label: 'Build' },
    { emoji: '⚡', label: 'Peak' },
    { emoji: '🎯', label: 'Taper' },
    { emoji: '🧘', label: 'Récup' },
    { emoji: '🏆', label: 'Compét' },
    { emoji: '🔥', label: 'Intensif' },
    { emoji: '🚴', label: 'Vélo' },
    { emoji: '🏃', label: 'Course' },
    { emoji: '⛰️', label: 'Montagne' },
    { emoji: '📊', label: 'Autre' },
];
// Calculate duration in weeks
var durationWeeks = (0, vue_1.computed)(function () {
    if (!formData.value.start_date || !formData.value.end_date)
        return 0;
    var start = new Date(formData.value.start_date);
    var end = new Date(formData.value.end_date);
    var diffTime = end.getTime() - start.getTime();
    var diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return Math.ceil(diffDays / 7);
});
// Calculate phase duration for display
var getPhaseDuration = function (phase) {
    var start = new Date(phase.start_date);
    var end = new Date(phase.end_date);
    var diffTime = end.getTime() - start.getTime();
    var diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return Math.ceil(diffDays / 7);
};
// Format date for display
var formatDate = function (dateStr) {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};
// Get current week within phase
var getCurrentWeek = function (phase) {
    var today = new Date();
    var start = new Date(phase.start_date);
    var diffTime = today.getTime() - start.getTime();
    var diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 7) + 1;
};
// Start adding new phase
var startAdd = function () {
    var _a, _b;
    editingPhase.value = null;
    // Default: start from tomorrow, 4 weeks duration
    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    var endDate = new Date(tomorrow);
    endDate.setDate(endDate.getDate() + 27); // 4 weeks
    formData.value = {
        name: '',
        emoji: '📊',
        start_date: (_a = tomorrow.toISOString().split('T')[0]) !== null && _a !== void 0 ? _a : '',
        end_date: (_b = endDate.toISOString().split('T')[0]) !== null && _b !== void 0 ? _b : '',
        objectives: '',
        keywords: '',
        cycling_pct: 80,
        volume_note: '',
        challenge: '',
    };
    isEditing.value = true;
};
// Scroll to form
var scrollToForm = function () {
    (0, vue_1.nextTick)(function () {
        var _a;
        (_a = formRef.value) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
};
// Start editing existing phase
var startEdit = function (phase) {
    editingPhase.value = phase;
    var volumeParsed = phase.volume_distribution ? parseVolumeDistribution(phase.volume_distribution) : { cycling_pct: 80, note: '' };
    formData.value = {
        name: phase.name,
        emoji: phase.emoji || '📊',
        start_date: phase.start_date,
        end_date: phase.end_date,
        objectives: phase.objectives || phase.goals || '',
        keywords: phase.keywords || '',
        cycling_pct: volumeParsed.cycling_pct,
        volume_note: volumeParsed.note,
        challenge: phase.challenge || '',
    };
    isEditing.value = true;
    scrollToForm();
};
// Cancel editing
var cancelEdit = function () {
    isEditing.value = false;
    editingPhase.value = null;
};
// Save phase
var savePhase = function () {
    if (!formData.value.name || !formData.value.start_date || !formData.value.end_date)
        return;
    var volumeDistribution = formatVolumeDistribution(formData.value.cycling_pct, formData.value.volume_note);
    if (editingPhase.value) {
        // Update existing
        var index = localPhases.value.findIndex(function (p) { return p.id === editingPhase.value.id; });
        if (index !== -1) {
            localPhases.value[index] = __assign(__assign({}, editingPhase.value), { name: formData.value.name, emoji: formData.value.emoji || undefined, start_date: formData.value.start_date, end_date: formData.value.end_date, objectives: formData.value.objectives || undefined, keywords: formData.value.keywords || undefined, volume_distribution: volumeDistribution, challenge: formData.value.challenge || undefined });
        }
    }
    else {
        // Add new
        localPhases.value.push({
            id: (0, uuid_1.v4)(),
            name: formData.value.name,
            emoji: formData.value.emoji || undefined,
            start_date: formData.value.start_date,
            end_date: formData.value.end_date,
            objectives: formData.value.objectives || undefined,
            keywords: formData.value.keywords || undefined,
            volume_distribution: volumeDistribution,
            challenge: formData.value.challenge || undefined,
        });
    }
    // Sort and emit
    localPhases.value.sort(function (a, b) { return a.start_date.localeCompare(b.start_date); });
    emit('save', localPhases.value);
    cancelEdit();
};
// Delete phase
var deletePhase = function (phase) {
    if (!confirm("Supprimer le cycle \"".concat(phase.name, "\" ?")))
        return;
    localPhases.value = localPhases.value.filter(function (p) { return p.id !== phase.id; });
    emit('save', localPhases.value);
};
// Phase emojis based on name
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
// Generate coach prompt for phases
var generateCoachPrompt = function () {
    var _a, _b, _c, _d;
    var today = new Date();
    var todayStr = today.toISOString().split('T')[0];
    var prompt = "Tu es un coach cycliste expert. Je veux que tu me g\u00E9n\u00E8res un plan de cycles d'entra\u00EEnement.\n\n## Date d'aujourd'hui\n".concat(todayStr, "\n\n## Mon profil");
    if ((_a = props.athleteProfile) === null || _a === void 0 ? void 0 : _a.ftp) {
        prompt += "\n- FTP: ".concat(props.athleteProfile.ftp, "W");
    }
    if ((_b = props.athleteProfile) === null || _b === void 0 ? void 0 : _b.max_hr) {
        prompt += "\n- FC Max: ".concat(props.athleteProfile.max_hr, " bpm");
    }
    if ((_c = props.athleteProfile) === null || _c === void 0 ? void 0 : _c.environment) {
        prompt += "\n- Environnement: ".concat(props.athleteProfile.environment);
    }
    if ((_d = props.objectives) === null || _d === void 0 ? void 0 : _d.length) {
        prompt += "\n\n## Mes objectifs";
        props.objectives.forEach(function (obj) {
            prompt += "\n- [".concat(obj.priority, "] ").concat(obj.name, " (").concat(obj.date, ") - ").concat(obj.type, ", ").concat(obj.distance_km, "km, D+").concat(obj.elevation_gain, "m");
        });
    }
    prompt += "\n\n## Ta mission\nG\u00E9n\u00E8re-moi un plan de cycles d'entra\u00EEnement qui m\u00E8ne \u00E0 mes objectifs. Chaque cycle doit avoir:\n- Un nom clair (Base, Build, Peak, Taper, etc.)\n- Des dates de d\u00E9but et fin\n- Un objectif principal\n- Des mots-cl\u00E9s pour guider les s\u00E9ances\n\n## Format de r\u00E9ponse OBLIGATOIRE\nR\u00E9ponds UNIQUEMENT avec un JSON valide (pas de texte avant/apr\u00E8s), au format:\n```json\n[\n  {\n    \"name\": \"Base\",\n    \"emoji\": \"\uD83C\uDFD7\uFE0F\",\n    \"start_date\": \"2024-01-08\",\n    \"end_date\": \"2024-02-04\",\n    \"objectives\": \"Construire l'endurance a\u00E9robie\",\n    \"keywords\": \"Z2, volume, r\u00E9gularit\u00E9, endurance\",\n    \"volume_distribution\": \"90% V\u00E9lo / 10% Run (Maintenance)\",\n    \"challenge\": \"\"\n  }\n]\n```\n\nEmojis disponibles: \uD83C\uDFD7\uFE0F (Base), \uD83D\uDCAA (Build), \u26A1 (Peak), \uD83C\uDFAF (Taper), \uD83E\uDDD8 (R\u00E9cup), \uD83C\uDFC6 (Comp\u00E9t), \uD83D\uDD25 (Intensif), \u26F0\uFE0F (Montagne)";
    return prompt;
};
// Copy coach prompt to clipboard
var copyCoachPrompt = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, navigator.clipboard.writeText(generateCoachPrompt())];
            case 1:
                _a.sent();
                coachCopied.value = true;
                setTimeout(function () {
                    coachCopied.value = false;
                }, 2000);
                return [2 /*return*/];
        }
    });
}); };
// Import phases from coach JSON
var importCoachPhases = function () {
    importError.value = '';
    try {
        var cleanText = coachJsonInput.value.trim();
        // Remove markdown code blocks if present
        if (cleanText.startsWith('```')) {
            cleanText = cleanText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
        }
        var parsed = JSON.parse(cleanText);
        var phasesArray = Array.isArray(parsed) ? parsed : [parsed];
        // Validate and transform phases
        var newPhases = phasesArray.map(function (p) { return ({
            id: (0, uuid_1.v4)(),
            name: p.name || 'Cycle',
            emoji: p.emoji,
            start_date: p.start_date,
            end_date: p.end_date,
            objectives: p.objectives || p.goals,
            keywords: p.keywords,
            volume_distribution: p.volume_distribution,
            challenge: p.challenge,
        }); });
        // Replace all phases
        localPhases.value = newPhases.sort(function (a, b) { return a.start_date.localeCompare(b.start_date); });
        emit('save', localPhases.value);
        // Reset
        showCoachImport.value = false;
        coachJsonInput.value = '';
    }
    catch (e) {
        importError.value = 'JSON invalide. Vérifie le format.';
    }
};
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var ___VLS_components;
var ___VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-4" }));
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex justify-between items-center pr-8" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['pr-8']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.h3, __VLS_intrinsics.h3)(__assign({ class: "font-bold text-lg" }));
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
if (!__VLS_ctx.isEditing && !__VLS_ctx.showCoachImport) {
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex gap-2" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!(!__VLS_ctx.isEditing && !__VLS_ctx.showCoachImport))
                return;
            __VLS_ctx.showCoachImport = true;
            // @ts-ignore
            [isEditing, showCoachImport, showCoachImport,];
        } }, { class: "btn btn-sm btn-ghost" }));
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: (__VLS_ctx.startAdd) }, { class: "btn btn-sm btn-primary" }));
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
}
if (__VLS_ctx.showCoachImport) {
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "bg-base-200 rounded-lg p-4 space-y-3" }));
    /** @type {__VLS_StyleScopedClasses['bg-base-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.h4, __VLS_intrinsics.h4)(__assign({ class: "font-medium" }));
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-sm text-base-content/70" }));
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base-content/70']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign({ onClick: (__VLS_ctx.copyCoachPrompt) }, { class: "btn btn-sm w-full" }), { class: (__VLS_ctx.coachCopied ? 'btn-success' : 'btn-primary') }));
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    (__VLS_ctx.coachCopied ? '✓ Prompt copié !' : '📋 Copier le prompt pour le coach');
    __VLS_asFunctionalElement(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-sm text-base-content/70" }));
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base-content/70']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.textarea, __VLS_intrinsics.textarea)(__assign(__assign({ value: (__VLS_ctx.coachJsonInput) }, { class: "textarea textarea-bordered w-full h-32 font-mono text-xs" }), { placeholder: "Colle le JSON généré par le coach ici..." }));
    /** @type {__VLS_StyleScopedClasses['textarea']} */ ;
    /** @type {__VLS_StyleScopedClasses['textarea-bordered']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-32']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    if (__VLS_ctx.importError) {
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-error text-sm" }));
        /** @type {__VLS_StyleScopedClasses['text-error']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        (__VLS_ctx.importError);
    }
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex justify-end gap-2" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!(__VLS_ctx.showCoachImport))
                return;
            __VLS_ctx.showCoachImport = false;
            __VLS_ctx.coachJsonInput = '';
            __VLS_ctx.importError = '';
            // @ts-ignore
            [showCoachImport, showCoachImport, startAdd, copyCoachPrompt, coachCopied, coachCopied, coachJsonInput, coachJsonInput, importError, importError, importError,];
        } }, { class: "btn btn-sm btn-ghost" }));
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign({ onClick: (__VLS_ctx.importCoachPhases) }, { class: "btn btn-sm btn-primary" }), { disabled: (!__VLS_ctx.coachJsonInput.trim()) }));
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
}
if (__VLS_ctx.isEditing) {
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ ref: "formRef" }, { class: "bg-base-200 rounded-lg p-4 space-y-3" }));
    /** @type {__VLS_StyleScopedClasses['bg-base-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.h4, __VLS_intrinsics.h4)(__assign({ class: "font-medium" }));
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    (__VLS_ctx.editingPhase ? '✏️ Modifier le cycle' : '➕ Nouveau cycle');
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "grid grid-cols-[1fr_auto] gap-3" }));
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-[1fr_auto]']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsics.label, __VLS_intrinsics.label)(__assign({ class: "text-sm text-base-content/70 mb-1 block" }));
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base-content/70']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.input)(__assign(__assign({ value: (__VLS_ctx.formData.name), type: "text" }, { class: "input input-bordered input-sm w-full" }), { placeholder: "Ex: Base, Build, Peak..." }));
    /** @type {__VLS_StyleScopedClasses['input']} */ ;
    /** @type {__VLS_StyleScopedClasses['input-bordered']} */ ;
    /** @type {__VLS_StyleScopedClasses['input-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsics.label, __VLS_intrinsics.label)(__assign({ class: "text-sm text-base-content/70 mb-1 block" }));
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base-content/70']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex flex-wrap gap-1" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
    var _loop_1 = function (item) {
        __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign(__assign(__assign({ onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.isEditing))
                    return;
                __VLS_ctx.formData.emoji = item.emoji;
                // @ts-ignore
                [isEditing, coachJsonInput, importCoachPhases, editingPhase, formData, formData, phaseEmojis,];
            } }, { key: (item.emoji), type: "button" }), { class: "btn btn-sm btn-square" }), { class: (__VLS_ctx.formData.emoji === item.emoji ? 'btn-primary' : 'btn-ghost') }), { title: (item.label) }));
        /** @type {__VLS_StyleScopedClasses['btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-square']} */ ;
        (item.emoji);
        // @ts-ignore
        [formData,];
    };
    for (var _i = 0, _a = __VLS_getVForSourceType((__VLS_ctx.phaseEmojis)); _i < _a.length; _i++) {
        var item = _a[_i][0];
        _loop_1(item);
    }
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "grid grid-cols-2 gap-2" }));
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsics.label, __VLS_intrinsics.label)(__assign({ class: "text-sm text-base-content/70 mb-1 block" }));
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base-content/70']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.input)(__assign({ type: "date" }, { class: "input input-bordered input-sm w-full" }));
    (__VLS_ctx.formData.start_date);
    /** @type {__VLS_StyleScopedClasses['input']} */ ;
    /** @type {__VLS_StyleScopedClasses['input-bordered']} */ ;
    /** @type {__VLS_StyleScopedClasses['input-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsics.label, __VLS_intrinsics.label)(__assign({ class: "text-sm text-base-content/70 mb-1 block" }));
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base-content/70']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.input)(__assign({ type: "date" }, { class: "input input-bordered input-sm w-full" }));
    (__VLS_ctx.formData.end_date);
    /** @type {__VLS_StyleScopedClasses['input']} */ ;
    /** @type {__VLS_StyleScopedClasses['input-bordered']} */ ;
    /** @type {__VLS_StyleScopedClasses['input-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    if (__VLS_ctx.durationWeeks > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-sm text-base-content/60" }));
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-base-content/60']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "font-bold" }));
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        (__VLS_ctx.durationWeeks);
        (__VLS_ctx.durationWeeks > 1 ? 's' : '');
    }
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsics.label, __VLS_intrinsics.label)(__assign({ class: "text-sm text-base-content/70 mb-1 block" }));
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base-content/70']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.input)(__assign(__assign({ value: (__VLS_ctx.formData.objectives), type: "text" }, { class: "input input-bordered input-sm w-full" }), { placeholder: "Ex: Construire l'endurance aérobie" }));
    /** @type {__VLS_StyleScopedClasses['input']} */ ;
    /** @type {__VLS_StyleScopedClasses['input-bordered']} */ ;
    /** @type {__VLS_StyleScopedClasses['input-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsics.label, __VLS_intrinsics.label)(__assign({ class: "text-sm text-base-content/70 mb-1 block" }));
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base-content/70']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.textarea, __VLS_intrinsics.textarea)(__assign(__assign({ value: (__VLS_ctx.formData.keywords) }, { class: "textarea textarea-bordered textarea-sm h-16 w-full" }), { placeholder: "Ex: Z2, volume, régularité, endurance, sorties longues..." }));
    /** @type {__VLS_StyleScopedClasses['textarea']} */ ;
    /** @type {__VLS_StyleScopedClasses['textarea-bordered']} */ ;
    /** @type {__VLS_StyleScopedClasses['textarea-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-16']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsics.label, __VLS_intrinsics.label)(__assign({ class: "text-sm text-base-content/70 mb-1 block" }));
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base-content/70']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center gap-3 mb-2" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-lg" }));
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.input)(__assign({ type: "range", min: "0", max: "100", step: "10" }, { class: "range range-sm range-primary flex-1" }));
    (__VLS_ctx.formData.cycling_pct);
    /** @type {__VLS_StyleScopedClasses['range']} */ ;
    /** @type {__VLS_StyleScopedClasses['range-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['range-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-lg" }));
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex justify-between text-sm mb-4" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "font-bold text-primary" }));
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-primary']} */ ;
    (__VLS_ctx.formData.cycling_pct);
    __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-base-content/60" }));
    /** @type {__VLS_StyleScopedClasses['text-base-content/60']} */ ;
    (__VLS_ctx.volumeHint);
    __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "font-bold text-secondary" }));
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-secondary']} */ ;
    (__VLS_ctx.running_pct);
    __VLS_asFunctionalElement(__VLS_intrinsics.input)(__assign(__assign({ value: (__VLS_ctx.formData.volume_note), type: "text" }, { class: "input input-bordered input-sm w-full" }), { placeholder: "Vigilance (ex: Maintenance cardio, Build run...)" }));
    /** @type {__VLS_StyleScopedClasses['input']} */ ;
    /** @type {__VLS_StyleScopedClasses['input-bordered']} */ ;
    /** @type {__VLS_StyleScopedClasses['input-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsics.label, __VLS_intrinsics.label)(__assign({ class: "text-sm text-base-content/70 mb-1 block" }));
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base-content/70']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.input)(__assign(__assign({ value: (__VLS_ctx.formData.challenge), type: "text" }, { class: "input input-bordered input-sm w-full" }), { placeholder: "Ex: Course 10km, Cyclosportive..." }));
    /** @type {__VLS_StyleScopedClasses['input']} */ ;
    /** @type {__VLS_StyleScopedClasses['input-bordered']} */ ;
    /** @type {__VLS_StyleScopedClasses['input-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex justify-end gap-2 pt-2" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['pt-2']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: (__VLS_ctx.cancelEdit) }, { class: "btn btn-sm btn-ghost" }));
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign({ onClick: (__VLS_ctx.savePhase) }, { class: "btn btn-sm btn-primary" }), { disabled: (!__VLS_ctx.formData.name || !__VLS_ctx.formData.start_date || !__VLS_ctx.formData.end_date) }));
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
}
if (__VLS_ctx.sortedPhases.length === 0 && !__VLS_ctx.isEditing) {
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-center py-8 text-base-content/50" }));
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base-content/50']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-sm" }));
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsics.ul, __VLS_intrinsics.ul)(__assign({ class: "timeline timeline-vertical timeline-compact" }));
    /** @type {__VLS_StyleScopedClasses['timeline']} */ ;
    /** @type {__VLS_StyleScopedClasses['timeline-vertical']} */ ;
    /** @type {__VLS_StyleScopedClasses['timeline-compact']} */ ;
    var _loop_2 = function (phase, index) {
        __VLS_asFunctionalElement(__VLS_intrinsics.li, __VLS_intrinsics.li)({
            key: (phase.id),
            ref: (function (el) { if (__VLS_ctx.getPhaseStatus(phase) === 'current')
                __VLS_ctx.currentPhaseRef = el; }),
        });
        if (index > 0) {
            __VLS_asFunctionalElement(__VLS_intrinsics.hr)(__assign({ class: (__VLS_ctx.getPhaseStatus(phase) !== 'future' ? 'bg-primary' : '') }));
        }
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "timeline-start text-xs text-base-content/50 text-right pr-2 whitespace-nowrap" }));
        /** @type {__VLS_StyleScopedClasses['timeline-start']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-base-content/50']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-right']} */ ;
        /** @type {__VLS_StyleScopedClasses['pr-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['whitespace-nowrap']} */ ;
        (__VLS_ctx.formatDate(phase.start_date).split('/').slice(0, 2).join('/'));
        (__VLS_ctx.formatDate(phase.end_date).split('/').slice(0, 2).join('/'));
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "timeline-middle" }));
        /** @type {__VLS_StyleScopedClasses['timeline-middle']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "w-8 h-8 rounded-full flex items-center justify-center text-lg" }, { class: ({
                'bg-primary text-primary-content': __VLS_ctx.getPhaseStatus(phase) === 'current',
                'bg-primary/30 text-primary': __VLS_ctx.getPhaseStatus(phase) === 'past',
                'bg-base-300 text-base-content/30': __VLS_ctx.getPhaseStatus(phase) === 'future'
            }) }));
        /** @type {__VLS_StyleScopedClasses['w-8']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-8']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-primary']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-primary-content']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-primary/30']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-primary']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-base-300']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-base-content/30']} */ ;
        (phase.emoji || __VLS_ctx.getPhaseEmoji(phase.name));
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "timeline-end timeline-box ml-2 flex-1" }, { class: ({
                'border-primary border-2 bg-primary/10': __VLS_ctx.getPhaseStatus(phase) === 'current',
                'bg-base-200': __VLS_ctx.getPhaseStatus(phase) !== 'current'
            }) }));
        /** @type {__VLS_StyleScopedClasses['timeline-end']} */ ;
        /** @type {__VLS_StyleScopedClasses['timeline-box']} */ ;
        /** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-primary']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-primary/10']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-base-200']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex justify-between items-start gap-2" }));
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex-1 min-w-0" }));
        /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center gap-2 flex-wrap" }));
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "font-bold" }));
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        (phase.name.toUpperCase());
        __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "badge badge-xs badge-neutral" }));
        /** @type {__VLS_StyleScopedClasses['badge']} */ ;
        /** @type {__VLS_StyleScopedClasses['badge-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['badge-neutral']} */ ;
        (__VLS_ctx.getPhaseDuration(phase));
        if (__VLS_ctx.getPhaseStatus(phase) === 'current') {
            __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "badge badge-xs badge-primary" }));
            /** @type {__VLS_StyleScopedClasses['badge']} */ ;
            /** @type {__VLS_StyleScopedClasses['badge-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['badge-primary']} */ ;
            (__VLS_ctx.getCurrentWeek(phase));
            (__VLS_ctx.getPhaseDuration(phase));
        }
        if (phase.objectives || phase.goals) {
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-sm mt-1 text-base-content/70" }));
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-base-content/70']} */ ;
            (phase.objectives || phase.goals);
        }
        if (phase.keywords) {
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-xs text-base-content/50 mt-1" }));
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-base-content/50']} */ ;
            /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
            (phase.keywords);
        }
        if (phase.volume_distribution) {
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-xs text-pink-400 mt-1" }));
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-pink-400']} */ ;
            /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
            (phase.volume_distribution.replace(/\s*\([^)]*\)/, ''));
        }
        if (phase.challenge) {
            __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-xs text-base-content/60 mt-1" }));
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-base-content/60']} */ ;
            /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
            (phase.challenge);
        }
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex gap-1 shrink-0" }));
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!!(__VLS_ctx.sortedPhases.length === 0 && !__VLS_ctx.isEditing))
                    return;
                __VLS_ctx.startEdit(phase);
                // @ts-ignore
                [isEditing, formData, formData, formData, formData, formData, formData, formData, formData, formData, formData, formData, durationWeeks, durationWeeks, durationWeeks, volumeHint, running_pct, cancelEdit, savePhase, sortedPhases, sortedPhases, getPhaseStatus, getPhaseStatus, getPhaseStatus, getPhaseStatus, getPhaseStatus, getPhaseStatus, getPhaseStatus, getPhaseStatus, currentPhaseRef, formatDate, formatDate, getPhaseEmoji, getPhaseDuration, getPhaseDuration, getCurrentWeek, startEdit,];
            } }, { class: "btn btn-xs btn-ghost" }));
        /** @type {__VLS_StyleScopedClasses['btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!!(__VLS_ctx.sortedPhases.length === 0 && !__VLS_ctx.isEditing))
                    return;
                __VLS_ctx.deletePhase(phase);
                // @ts-ignore
                [deletePhase,];
            } }, { class: "btn btn-xs btn-ghost text-error" }));
        /** @type {__VLS_StyleScopedClasses['btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-error']} */ ;
        if (index < __VLS_ctx.sortedPhases.length - 1) {
            __VLS_asFunctionalElement(__VLS_intrinsics.hr)(__assign({ class: (__VLS_ctx.getPhaseStatus(phase) !== 'future' ? 'bg-primary' : '') }));
        }
        // @ts-ignore
        [sortedPhases, getPhaseStatus,];
    };
    for (var _b = 0, _c = __VLS_getVForSourceType((__VLS_ctx.sortedPhases)); _b < _c.length; _b++) {
        var _d = _c[_b], phase = _d[0], index = _d[1];
        _loop_2(phase, index);
    }
}
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
exports.default = {};
