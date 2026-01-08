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
Object.defineProperty(exports, "__esModule", { value: true });
var vue_1 = require("vue");
var props = defineProps();
var emit = defineEmits();
var localProfile = (0, vue_1.ref)(__assign({}, props.profile));
(0, vue_1.watch)(function () { return props.profile; }, function (newProfile) {
    localProfile.value = __assign({}, newProfile);
}, { deep: true });
var saveProfile = function () {
    emit('save', localProfile.value);
    emit('close');
};
// Helper text based on FTP values
var getFtpLevel = (0, vue_1.computed)(function () {
    var ftp = localProfile.value.ftp;
    if (!ftp)
        return null;
    if (ftp < 150)
        return { text: 'Debutant', color: 'text-info' };
    if (ftp < 200)
        return { text: 'Intermediaire', color: 'text-success' };
    if (ftp < 250)
        return { text: 'Avance', color: 'text-warning' };
    if (ftp < 300)
        return { text: 'Tres avance', color: 'text-error' };
    return { text: 'Elite', color: 'text-primary' };
});
// Calculate HR reserve
var hrReserve = (0, vue_1.computed)(function () {
    var _a = localProfile.value, max_hr = _a.max_hr, resting_hr = _a.resting_hr;
    if (!max_hr || !resting_hr)
        return null;
    return max_hr - resting_hr;
});
// Calculate zones based on FTP
var ftpZones = (0, vue_1.computed)(function () {
    var ftp = localProfile.value.ftp;
    if (!ftp)
        return null;
    return [
        { name: 'Z1 Recup', min: Math.round(ftp * 0.55), max: Math.round(ftp * 0.75) },
        { name: 'Z2 Endurance', min: Math.round(ftp * 0.75), max: Math.round(ftp * 0.9) },
        { name: 'Z3 Tempo', min: Math.round(ftp * 0.9), max: Math.round(ftp * 1.05) },
        { name: 'Z4 Seuil', min: Math.round(ftp * 1.05), max: Math.round(ftp * 1.2) },
        { name: 'Z5 VO2max', min: Math.round(ftp * 1.2), max: Math.round(ftp * 1.5) },
    ];
});
var __VLS_ctx = __assign(__assign(__assign(__assign(__assign({}, {}), {}), {}), {}), {});
var ___VLS_components;
var ___VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-4" }));
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center gap-2" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-2xl" }));
/** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.h3, __VLS_intrinsics.h3)(__assign({ class: "font-bold text-lg" }));
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-sm text-base-content/70" }));
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-base-content/70']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-4 pt-2" }));
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-2']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement(__VLS_intrinsics.label, __VLS_intrinsics.label)(__assign({ class: "text-sm font-medium mb-1 block" }));
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex gap-2 items-center" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.input)(__assign(__assign({ type: "number" }, { class: "input input-bordered flex-1" }), { placeholder: "Ex: 250", min: "0", max: "500" }));
(__VLS_ctx.localProfile.ftp);
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['input-bordered']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-sm text-base-content/60" }));
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-base-content/60']} */ ;
if (__VLS_ctx.getFtpLevel) {
    __VLS_asFunctionalElement(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-xs mt-1" }, { class: (__VLS_ctx.getFtpLevel.color) }));
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
    (__VLS_ctx.getFtpLevel.text);
}
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement(__VLS_intrinsics.label, __VLS_intrinsics.label)(__assign({ class: "text-sm font-medium mb-1 block" }));
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex gap-2 items-center" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.input)(__assign(__assign({ type: "number" }, { class: "input input-bordered flex-1" }), { placeholder: "Ex: 185", min: "100", max: "220" }));
(__VLS_ctx.localProfile.max_hr);
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['input-bordered']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-sm text-base-content/60" }));
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-base-content/60']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-xs text-base-content/50 mt-1" }));
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-base-content/50']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement(__VLS_intrinsics.label, __VLS_intrinsics.label)(__assign({ class: "text-sm font-medium mb-1 block" }));
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex gap-2 items-center" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.input)(__assign(__assign({ type: "number" }, { class: "input input-bordered flex-1" }), { placeholder: "Ex: 55", min: "30", max: "100" }));
(__VLS_ctx.localProfile.resting_hr);
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['input-bordered']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-sm text-base-content/60" }));
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-base-content/60']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "divider text-xs text-base-content/50" }));
/** @type {__VLS_StyleScopedClasses['divider']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-base-content/50']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement(__VLS_intrinsics.label, __VLS_intrinsics.label)(__assign({ class: "text-sm font-medium mb-1 block" }));
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.textarea, __VLS_intrinsics.textarea)(__assign(__assign({ value: (__VLS_ctx.localProfile.environment) }, { class: "textarea textarea-bordered w-full h-24" }), { placeholder: "\u0045\u0078\u003a\u0020\u004a\u0027\u0068\u0061\u0062\u0069\u0074\u0065\u0020\u0061\u0020\u004c\u0079\u006f\u006e\u0020\u0028\u007a\u006f\u006e\u0065\u0020\u0075\u0072\u0062\u0061\u0069\u006e\u0065\u002c\u0020\u0070\u0061\u0073\u0020\u0064\u0065\u0020\u0064\u0065\u006e\u0069\u0076\u0065\u006c\u0065\u0029\u002e\u000a\u0054\u0072\u0061\u0069\u006c\u002f\u006d\u006f\u006e\u0074\u0061\u0067\u006e\u0065\u0020\u0070\u006f\u0073\u0073\u0069\u0062\u006c\u0065\u0020\u0075\u006e\u0069\u0071\u0075\u0065\u006d\u0065\u006e\u0074\u0020\u006c\u0065\u0020\u0077\u0065\u0065\u006b\u002d\u0065\u006e\u0064\u000a\u0028\u004d\u006f\u006e\u0074\u0073\u0020\u0064\u0027\u004f\u0072\u0020\u0061\u0020\u0033\u0030\u006d\u0069\u006e\u002c\u0020\u006d\u006f\u0079\u0065\u006e\u006e\u0065\u0020\u006d\u006f\u006e\u0074\u0061\u0067\u006e\u0065\u0020\u0061\u0020\u0031\u0068\u0020\u0065\u006e\u0020\u0076\u006f\u0069\u0074\u0075\u0072\u0065\u0029\u002e" }));
/** @type {__VLS_StyleScopedClasses['textarea']} */ ;
/** @type {__VLS_StyleScopedClasses['textarea-bordered']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['h-24']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.p, __VLS_intrinsics.p)(__assign({ class: "text-xs text-base-content/50 mt-1" }));
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-base-content/50']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
if (__VLS_ctx.hrReserve) {
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "bg-base-200 rounded-lg p-3" }));
    /** @type {__VLS_StyleScopedClasses['bg-base-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-sm font-medium" }));
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-2xl font-bold text-primary" }));
    /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-primary']} */ ;
    (__VLS_ctx.hrReserve);
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-xs text-base-content/60" }));
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base-content/60']} */ ;
}
if (__VLS_ctx.ftpZones) {
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "bg-base-200 rounded-lg p-3" }));
    /** @type {__VLS_StyleScopedClasses['bg-base-200']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-sm font-medium mb-2" }));
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "grid grid-cols-1 gap-1 text-xs" }));
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    for (var _i = 0, _a = __VLS_getVForSourceType((__VLS_ctx.ftpZones)); _i < _a.length; _i++) {
        var zone = _a[_i][0];
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ key: (zone.name) }, { class: "flex justify-between" }));
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-base-content/70" }));
        /** @type {__VLS_StyleScopedClasses['text-base-content/70']} */ ;
        (zone.name);
        __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "font-mono" }));
        /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
        (zone.min);
        (zone.max);
        // @ts-ignore
        [localProfile, localProfile, localProfile, localProfile, getFtpLevel, getFtpLevel, getFtpLevel, hrReserve, hrReserve, ftpZones, ftpZones,];
    }
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
__VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign({ onClick: (__VLS_ctx.saveProfile) }, { class: "btn btn-primary" }));
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
// @ts-ignore
[saveProfile,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
exports.default = {};
