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
var localObjectives = (0, vue_1.ref)(__spreadArray([], props.objectives, true));
var editingObjective = (0, vue_1.ref)(null);
(0, vue_1.watch)(function () { return props.objectives; }, function (newObjectives) {
    localObjectives.value = __spreadArray([], newObjectives, true);
}, { deep: true });
var priorityOptions = [
    { value: 'A', label: 'A - Principal' },
    { value: 'B', label: 'B - Secondaire' },
    { value: 'C', label: 'C - Préparation' },
];
var addObjective = function () {
    var _a;
    var nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    editingObjective.value = {
        id: (0, uuid_1.v4)(),
        type: 'trail',
        priority: 'A',
        name: '',
        date: (_a = nextMonth.toISOString().split('T')[0]) !== null && _a !== void 0 ? _a : '',
        distance_km: 0,
        elevation_gain: 0,
        elevation_loss: 0,
    };
};
var editObjective = function (obj) {
    editingObjective.value = __assign({}, obj);
};
var saveObjective = function () {
    if (!editingObjective.value || !editingObjective.value.name)
        return;
    var index = localObjectives.value.findIndex(function (o) { return o.id === editingObjective.value.id; });
    if (index !== -1) {
        localObjectives.value[index] = editingObjective.value;
    }
    else {
        localObjectives.value.push(editingObjective.value);
    }
    // Sort by date
    localObjectives.value.sort(function (a, b) { return a.date.localeCompare(b.date); });
    editingObjective.value = null;
};
var deleteObjective = function (id) {
    localObjectives.value = localObjectives.value.filter(function (o) { return o.id !== id; });
};
var cancelEdit = function () {
    editingObjective.value = null;
};
var saveAll = function () {
    emit('save', localObjectives.value);
    emit('close');
};
var formatDate = function (dateStr) {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};
var daysUntil = function (dateStr) {
    var target = new Date(dateStr);
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    var diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0)
        return 'Passé';
    if (diff === 0)
        return "Aujourd'hui";
    if (diff === 1)
        return 'Demain';
    return "J-".concat(diff);
};
var isTrail = (0, vue_1.computed)(function () { var _a; return ((_a = editingObjective.value) === null || _a === void 0 ? void 0 : _a.type) === 'trail'; });
var switchType = function (type) {
    var _a;
    if (!editingObjective.value || editingObjective.value.type === type)
        return;
    var nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    editingObjective.value = {
        id: editingObjective.value.id,
        type: type,
        priority: 'A',
        name: '',
        date: (_a = nextMonth.toISOString().split('T')[0]) !== null && _a !== void 0 ? _a : '',
        distance_km: 0,
        elevation_gain: 0,
        elevation_loss: 0,
    };
};
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var ___VLS_components;
var ___VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-4" }));
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center justify-between" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.h3, __VLS_intrinsics.h3)(__assign({ class: "font-bold text-lg" }));
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: (__VLS_ctx.addObjective) }, { class: "btn btn-sm btn-primary" }));
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
if (__VLS_ctx.editingObjective) {
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "bg-base-200 rounded-lg p-4 space-y-3" }));
    /** @type {__VLS_StyleScopedClasses['bg-base-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-sm font-medium mb-2" }));
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
    (__VLS_ctx.localObjectives.find(function (o) { var _a; return o.id === ((_a = __VLS_ctx.editingObjective) === null || _a === void 0 ? void 0 : _a.id); }) ? 'Modifier' : 'Nouvel');
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex gap-2" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign({ onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!(__VLS_ctx.editingObjective))
                return;
            __VLS_ctx.switchType('trail');
            // @ts-ignore
            [addObjective, editingObjective, editingObjective, localObjectives, switchType,];
        } }, { class: "btn btn-sm flex-1" }), { class: (__VLS_ctx.editingObjective.type === 'trail' ? 'btn-primary' : 'btn-ghost') }));
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign({ onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!(__VLS_ctx.editingObjective))
                return;
            __VLS_ctx.switchType('road_cycling');
            // @ts-ignore
            [editingObjective, switchType,];
        } }, { class: "btn btn-sm flex-1" }), { class: (__VLS_ctx.editingObjective.type === 'road_cycling' ? 'btn-primary' : 'btn-ghost') }));
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "grid grid-cols-2 gap-3" }));
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "col-span-2" }));
    /** @type {__VLS_StyleScopedClasses['col-span-2']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.label, __VLS_intrinsics.label)(__assign({ class: "text-xs text-base-content/70 mb-1 block" }));
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base-content/70']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.input)(__assign(__assign({ value: (__VLS_ctx.editingObjective.name), type: "text" }, { class: "input input-sm input-bordered w-full" }), { placeholder: "Ex: UTMB, Étape du Tour..." }));
    /** @type {__VLS_StyleScopedClasses['input']} */ ;
    /** @type {__VLS_StyleScopedClasses['input-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['input-bordered']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsics.label, __VLS_intrinsics.label)(__assign({ class: "text-xs text-base-content/70 mb-1 block" }));
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base-content/70']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.select, __VLS_intrinsics.select)(__assign({ value: (__VLS_ctx.editingObjective.priority) }, { class: "select select-sm select-bordered w-full" }));
    /** @type {__VLS_StyleScopedClasses['select']} */ ;
    /** @type {__VLS_StyleScopedClasses['select-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['select-bordered']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    for (var _i = 0, _a = __VLS_getVForSourceType((__VLS_ctx.priorityOptions)); _i < _a.length; _i++) {
        var opt = _a[_i][0];
        __VLS_asFunctionalElement(__VLS_intrinsics.option, __VLS_intrinsics.option)({
            key: (opt.value),
            value: (opt.value),
        });
        (opt.label);
        // @ts-ignore
        [editingObjective, editingObjective, editingObjective, priorityOptions,];
    }
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsics.label, __VLS_intrinsics.label)(__assign({ class: "text-xs text-base-content/70 mb-1 block" }));
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base-content/70']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.input)(__assign({ type: "date" }, { class: "input input-sm input-bordered w-full" }));
    (__VLS_ctx.editingObjective.date);
    /** @type {__VLS_StyleScopedClasses['input']} */ ;
    /** @type {__VLS_StyleScopedClasses['input-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['input-bordered']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsics.label, __VLS_intrinsics.label)(__assign({ class: "text-xs text-base-content/70 mb-1 block" }));
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base-content/70']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.input)(__assign(__assign({ type: "number" }, { class: "input input-sm input-bordered w-full" }), { min: "0", step: "0.1" }));
    (__VLS_ctx.editingObjective.distance_km);
    /** @type {__VLS_StyleScopedClasses['input']} */ ;
    /** @type {__VLS_StyleScopedClasses['input-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['input-bordered']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsics.label, __VLS_intrinsics.label)(__assign({ class: "text-xs text-base-content/70 mb-1 block" }));
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base-content/70']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.input)(__assign(__assign({ type: "number" }, { class: "input input-sm input-bordered w-full" }), { min: "0" }));
    (__VLS_ctx.editingObjective.elevation_gain);
    /** @type {__VLS_StyleScopedClasses['input']} */ ;
    /** @type {__VLS_StyleScopedClasses['input-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['input-bordered']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    if (__VLS_ctx.isTrail) {
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsics.label, __VLS_intrinsics.label)(__assign({ class: "text-xs text-base-content/70 mb-1 block" }));
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-base-content/70']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['block']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.input)(__assign(__assign({ type: "number" }, { class: "input input-sm input-bordered w-full" }), { min: "0" }));
        (__VLS_ctx.editingObjective.elevation_loss);
        /** @type {__VLS_StyleScopedClasses['input']} */ ;
        /** @type {__VLS_StyleScopedClasses['input-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['input-bordered']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    }
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex justify-end gap-2" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: (__VLS_ctx.cancelEdit) }, { class: "btn btn-sm btn-ghost" }));
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign({ onClick: (__VLS_ctx.saveObjective) }, { class: "btn btn-sm btn-primary" }), { disabled: (!__VLS_ctx.editingObjective.name) }));
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
}
if (__VLS_ctx.localObjectives.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-2" }));
    /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
    var _loop_1 = function (obj) {
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ key: (obj.id) }, { class: "flex items-center justify-between p-3 bg-base-200 rounded-lg" }));
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-base-200']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex-1" }));
        /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center gap-2" }));
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "badge badge-sm font-bold" }, { class: ({
                'badge-error': (obj.priority || 'A') === 'A',
                'badge-warning': obj.priority === 'B',
                'badge-ghost': obj.priority === 'C'
            }) }));
        /** @type {__VLS_StyleScopedClasses['badge']} */ ;
        /** @type {__VLS_StyleScopedClasses['badge-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['badge-error']} */ ;
        /** @type {__VLS_StyleScopedClasses['badge-warning']} */ ;
        /** @type {__VLS_StyleScopedClasses['badge-ghost']} */ ;
        (obj.priority || 'A');
        __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (obj.type === 'trail' ? '🏃' : '🚴');
        __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "font-medium" }));
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        (obj.name);
        __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "badge badge-sm badge-primary" }));
        /** @type {__VLS_StyleScopedClasses['badge']} */ ;
        /** @type {__VLS_StyleScopedClasses['badge-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['badge-primary']} */ ;
        (__VLS_ctx.daysUntil(obj.date));
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-xs text-base-content/60 mt-1" }));
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-base-content/60']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
        (__VLS_ctx.formatDate(obj.date));
        (obj.distance_km);
        (obj.elevation_gain);
        if (obj.type === 'trail' && obj.elevation_loss) {
            __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            (obj.elevation_loss);
        }
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex gap-1" }));
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.localObjectives.length > 0))
                    return;
                __VLS_ctx.editObjective(obj);
                // @ts-ignore
                [editingObjective, editingObjective, editingObjective, editingObjective, editingObjective, localObjectives, localObjectives, isTrail, cancelEdit, saveObjective, daysUntil, formatDate, editObjective,];
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
                if (!(__VLS_ctx.localObjectives.length > 0))
                    return;
                __VLS_ctx.deleteObjective(obj.id);
                // @ts-ignore
                [deleteObjective,];
            } }, { class: "btn btn-xs btn-ghost text-error" }));
        /** @type {__VLS_StyleScopedClasses['btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-error']} */ ;
        // @ts-ignore
        [];
    };
    for (var _b = 0, _c = __VLS_getVForSourceType((__VLS_ctx.localObjectives)); _b < _c.length; _b++) {
        var obj = _c[_b][0];
        _loop_1(obj);
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-center py-6 text-base-content/50" }));
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base-content/50']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-xs mt-1" }));
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
}
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex justify-end gap-2 pt-4 border-t border-base-300" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['border-t']} */ ;
/** @type {__VLS_StyleScopedClasses['border-base-300']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.emit('close');
        // @ts-ignore
        [emit,];
    } }, { class: "btn btn-ghost" }));
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: (__VLS_ctx.saveAll) }, { class: "btn btn-primary" }));
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
// @ts-ignore
[saveAll,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
exports.default = {};
