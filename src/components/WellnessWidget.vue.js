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
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
Object.defineProperty(exports, "__esModule", { value: true });
var vue_1 = require("vue");
var vue3_apexcharts_1 = require("vue3-apexcharts");
var useIntervals_1 = require("../composables/useIntervals");
var _l = (0, useIntervals_1.useIntervals)(), isLoading = _l.isLoading, error = _l.error, todayWellness = _l.todayWellness, wellnessHistory = _l.wellnessHistory, fetchTodayWellness = _l.fetchTodayWellness, fetchWellnessRange = _l.fetchWellnessRange, currentHRV = _l.currentHRV, currentRestingHR = _l.currentRestingHR, currentCTL = _l.currentCTL, currentATL = _l.currentATL, currentTSB = _l.currentTSB, formStatus = _l.formStatus;
var chartPeriod = (0, vue_1.ref)('month');
(0, vue_1.onMounted)(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, fetchWellnessRange(90)]; // Last 90 days for graphs
            case 1:
                _a.sent(); // Last 90 days for graphs
                fetchTodayWellness();
                return [2 /*return*/];
        }
    });
}); });
var last7Days = (0, vue_1.computed)(function () {
    var _a, _b, _c, _d;
    var days = [];
    var _loop_1 = function (i) {
        var d = new Date();
        d.setDate(d.getDate() - i);
        var year = d.getFullYear();
        var month = String(d.getMonth() + 1).padStart(2, '0');
        var dayNum = String(d.getDate()).padStart(2, '0');
        var dateStr = "".concat(year, "-").concat(month, "-").concat(dayNum);
        var wellness = wellnessHistory.value.find(function (w) { return w.id === dateStr; });
        var hrv = (_d = (_c = (_b = (_a = wellness === null || wellness === void 0 ? void 0 : wellness.hrv) !== null && _a !== void 0 ? _a : wellness === null || wellness === void 0 ? void 0 : wellness.hrvSDNN) !== null && _b !== void 0 ? _b : wellness === null || wellness === void 0 ? void 0 : wellness.rmssd) !== null && _c !== void 0 ? _c : wellness === null || wellness === void 0 ? void 0 : wellness.lastNightAvg) !== null && _d !== void 0 ? _d : null;
        days.push({
            date: dateStr,
            dateDisplay: d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }),
            day: d.toLocaleDateString('fr-FR', { weekday: 'short' }).charAt(0).toUpperCase(),
            tsb: wellness ? Math.round(wellness.ctl - wellness.atl) : null,
            ctl: (wellness === null || wellness === void 0 ? void 0 : wellness.ctl) ? Math.round(wellness.ctl) : null,
            atl: (wellness === null || wellness === void 0 ? void 0 : wellness.atl) ? Math.round(wellness.atl) : null,
            hrv: hrv ? Math.round(hrv) : null,
        });
    };
    for (var i = 6; i >= 0; i--) {
        _loop_1(i);
    }
    return days;
});
var getTsbColor = function (tsb, forHistory) {
    if (forHistory === void 0) { forHistory = false; }
    if (forHistory) {
        // Subtle backgrounds for history emojis
        if (tsb === null)
            return 'bg-base-300/50';
        if (tsb > 15)
            return 'bg-cyan-500/20';
        if (tsb > 5)
            return 'bg-emerald-500/20';
        if (tsb > -10)
            return 'bg-green-500/20';
        if (tsb > -25)
            return 'bg-orange-500/20';
        return 'bg-rose-600/20';
    }
    // Solid backgrounds for main TSB display
    if (tsb === null)
        return 'bg-base-300 text-base-content';
    if (tsb > 15)
        return 'bg-cyan-500 text-white';
    if (tsb > 5)
        return 'bg-emerald-500 text-white';
    if (tsb > -10)
        return 'bg-green-500 text-white';
    if (tsb > -25)
        return 'bg-orange-500 text-white';
    return 'bg-rose-600 text-white';
};
var getTsbEmoji = function (tsb) {
    if (tsb === null)
        return '–';
    if (tsb > 15)
        return '❄️';
    if (tsb > 5)
        return '💪';
    if (tsb > -10)
        return '🎯';
    if (tsb > -25)
        return '😓';
    return '🛑';
};
var refresh = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, fetchWellnessRange(90)];
            case 1:
                _a.sent();
                fetchTodayWellness();
                return [2 /*return*/];
        }
    });
}); };
// Chart data
var chartDays = (0, vue_1.computed)(function () {
    var days = chartPeriod.value === 'week' ? 7 : chartPeriod.value === 'month' ? 30 : 90;
    return days;
});
var chartData = (0, vue_1.computed)(function () {
    var days = chartDays.value;
    var data = [];
    var _loop_2 = function (i) {
        var d = new Date();
        d.setDate(d.getDate() - i);
        var year = d.getFullYear();
        var month = String(d.getMonth() + 1).padStart(2, '0');
        var dayNum = String(d.getDate()).padStart(2, '0');
        var dateStr = "".concat(year, "-").concat(month, "-").concat(dayNum);
        var wellness = wellnessHistory.value.find(function (w) { return w.id === dateStr; });
        if (wellness) {
            data.push({
                date: dateStr,
                tsb: Math.round(wellness.ctl - wellness.atl),
                ctl: Math.round(wellness.ctl),
                atl: Math.round(wellness.atl),
            });
        }
    };
    for (var i = days - 1; i >= 0; i--) {
        _loop_2(i);
    }
    return data;
});
// ApexCharts configuration
var chartSeries = (0, vue_1.computed)(function () { return [
    {
        name: 'TSB (Forme)',
        data: chartData.value.map(function (d) { return ({ x: d.date, y: d.tsb }); }),
    },
    {
        name: 'Fitness (CTL)',
        data: chartData.value.map(function (d) { return ({ x: d.date, y: d.ctl }); }),
    },
    {
        name: 'Fatigue (ATL)',
        data: chartData.value.map(function (d) { return ({ x: d.date, y: d.atl }); }),
    },
]; });
var chartOptions = (0, vue_1.computed)(function () { return ({
    chart: {
        type: 'area',
        height: 180,
        toolbar: { show: false },
        zoom: { enabled: false },
        background: 'transparent',
        fontFamily: 'inherit',
        animations: {
            enabled: true,
            easing: 'easeinout',
            speed: 500,
        },
    },
    colors: ['#22c55e', '#ec4899', '#fbbf24'], // TSB green, Fitness pink, Fatigue yellow
    stroke: {
        width: [3, 2, 2],
        curve: 'smooth',
        dashArray: [0, 0, 0],
    },
    fill: {
        type: 'gradient',
        gradient: {
            shade: 'dark',
            type: 'vertical',
            shadeIntensity: 0,
            opacityFrom: 0.3,
            opacityTo: 0,
            stops: [0, 100],
        },
    },
    grid: {
        borderColor: 'rgba(255,255,255,0.1)',
        strokeDashArray: 4,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
    },
    xaxis: {
        type: 'datetime',
        labels: {
            style: { colors: 'rgba(255,255,255,0.5)', fontSize: '10px' },
            datetimeFormatter: { day: 'dd MMM' },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
    },
    yaxis: {
        labels: {
            style: { colors: 'rgba(255,255,255,0.5)', fontSize: '10px' },
            formatter: function (val) { return Math.round(val).toString(); },
        },
    },
    annotations: {
        yaxis: [{
                y: 0,
                strokeDashArray: 4,
                borderColor: 'rgba(255,255,255,0.3)',
            }],
    },
    legend: {
        show: true,
        position: 'bottom',
        horizontalAlign: 'center',
        fontSize: '11px',
        labels: { colors: 'rgba(255,255,255,0.6)' },
        markers: { size: 4 },
        itemMargin: { horizontal: 8 },
    },
    tooltip: {
        theme: 'dark',
        shared: true,
        intersect: false,
        x: {
            format: 'dd MMM yyyy',
        },
        y: {
            formatter: function (val) { return val !== null ? Math.round(val).toString() : '-'; },
        },
    },
    dataLabels: { enabled: false },
}); });
var __VLS_ctx = __assign(__assign({}, {}), {});
var ___VLS_components;
var ___VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "card bg-base-100 shadow-xl" }));
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-base-100']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-xl']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "card-body p-4" }));
/** @type {__VLS_StyleScopedClasses['card-body']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center justify-between" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.h2, __VLS_intrinsics.h2)(__assign({ class: "card-title text-lg" }));
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign({ onClick: (__VLS_ctx.refresh) }, { class: "btn btn-ghost btn-sm btn-square" }), { disabled: (__VLS_ctx.isLoading) }));
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-square']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: ({ 'animate-spin': __VLS_ctx.isLoading }) }));
/** @type {__VLS_StyleScopedClasses['animate-spin']} */ ;
if (__VLS_ctx.error) {
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "alert alert-error text-sm" }));
    /** @type {__VLS_StyleScopedClasses['alert']} */ ;
    /** @type {__VLS_StyleScopedClasses['alert-error']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    (__VLS_ctx.error);
}
else if (__VLS_ctx.isLoading && !__VLS_ctx.todayWellness) {
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex justify-center py-8" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-8']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "loading loading-spinner loading-md" }));
    /** @type {__VLS_StyleScopedClasses['loading']} */ ;
    /** @type {__VLS_StyleScopedClasses['loading-spinner']} */ ;
    /** @type {__VLS_StyleScopedClasses['loading-md']} */ ;
}
else if (__VLS_ctx.todayWellness) {
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center gap-4 mt-2" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold" }, { class: (__VLS_ctx.getTsbColor(__VLS_ctx.currentTSB)) }));
    /** @type {__VLS_StyleScopedClasses['w-16']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-16']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    ((_a = __VLS_ctx.currentTSB) !== null && _a !== void 0 ? _a : '?');
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-2xl" }));
    /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
    ((_c = (_b = __VLS_ctx.formStatus) === null || _b === void 0 ? void 0 : _b.icon) !== null && _c !== void 0 ? _c : '❓');
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-sm font-medium" }, { class: ((_d = __VLS_ctx.formStatus) === null || _d === void 0 ? void 0 : _d.color) }));
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    ((_f = (_e = __VLS_ctx.formStatus) === null || _e === void 0 ? void 0 : _e.label) !== null && _f !== void 0 ? _f : 'Chargement...');
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-xs text-base-content/60" }));
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base-content/60']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "grid grid-cols-3 gap-2 mt-4" }));
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-center p-2 bg-pink-500/10 rounded-lg" }));
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-pink-500/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-lg font-bold text-pink-400" }));
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-pink-400']} */ ;
    (__VLS_ctx.currentCTL !== null ? Math.round(__VLS_ctx.currentCTL) : '-');
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-xs text-base-content/60" }));
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base-content/60']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-center p-2 bg-amber-500/10 rounded-lg" }));
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-amber-500/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-lg font-bold text-amber-400" }));
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-amber-400']} */ ;
    (__VLS_ctx.currentATL !== null ? Math.round(__VLS_ctx.currentATL) : '-');
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-xs text-base-content/60" }));
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base-content/60']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-center p-2 bg-sky-500/10 rounded-lg" }));
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-sky-500/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-lg font-bold text-sky-400" }));
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sky-400']} */ ;
    (__VLS_ctx.currentHRV !== null ? Math.round(__VLS_ctx.currentHRV) : '-');
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-xs text-base-content/60" }));
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base-content/60']} */ ;
    if (__VLS_ctx.currentRestingHR) {
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-center text-xs text-base-content/50 mt-2" }));
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-base-content/50']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
        (__VLS_ctx.currentRestingHR);
    }
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "mt-4" }));
    /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex items-center justify-between mb-2" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-xs text-base-content/60" }));
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-base-content/60']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex gap-1" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign({ onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!!(__VLS_ctx.error))
                return;
            if (!!(__VLS_ctx.isLoading && !__VLS_ctx.todayWellness))
                return;
            if (!(__VLS_ctx.todayWellness))
                return;
            __VLS_ctx.chartPeriod = 'week';
            // @ts-ignore
            [refresh, isLoading, isLoading, isLoading, error, error, todayWellness, todayWellness, getTsbColor, currentTSB, currentTSB, formStatus, formStatus, formStatus, currentCTL, currentCTL, currentATL, currentATL, currentHRV, currentHRV, currentRestingHR, currentRestingHR, chartPeriod,];
        } }, { class: "btn btn-xs" }), { class: (__VLS_ctx.chartPeriod === 'week' ? 'btn-primary' : 'btn-ghost') }));
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-xs']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign({ onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!!(__VLS_ctx.error))
                return;
            if (!!(__VLS_ctx.isLoading && !__VLS_ctx.todayWellness))
                return;
            if (!(__VLS_ctx.todayWellness))
                return;
            __VLS_ctx.chartPeriod = 'month';
            // @ts-ignore
            [chartPeriod, chartPeriod,];
        } }, { class: "btn btn-xs" }), { class: (__VLS_ctx.chartPeriod === 'month' ? 'btn-primary' : 'btn-ghost') }));
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-xs']} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign({ onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!!(__VLS_ctx.error))
                return;
            if (!!(__VLS_ctx.isLoading && !__VLS_ctx.todayWellness))
                return;
            if (!(__VLS_ctx.todayWellness))
                return;
            __VLS_ctx.chartPeriod = '3months';
            // @ts-ignore
            [chartPeriod, chartPeriod,];
        } }, { class: "btn btn-xs" }), { class: (__VLS_ctx.chartPeriod === '3months' ? 'btn-primary' : 'btn-ghost') }));
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-xs']} */ ;
    if (__VLS_ctx.chartData.length > 1) {
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "bg-base-200/50 rounded-xl overflow-hidden" }));
        /** @type {__VLS_StyleScopedClasses['bg-base-200/50']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
        var __VLS_0 = void 0;
        /** @ts-ignore @type {typeof ___VLS_components.VueApexCharts} */
        vue3_apexcharts_1.default;
        // @ts-ignore
        var __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
            type: "area",
            height: "180",
            options: (__VLS_ctx.chartOptions),
            series: (__VLS_ctx.chartSeries),
        }));
        var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
                type: "area",
                height: "180",
                options: (__VLS_ctx.chartOptions),
                series: (__VLS_ctx.chartSeries),
            }], __VLS_functionalComponentArgsRest(__VLS_1), false));
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-center text-xs text-base-content/40 py-4" }));
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-base-content/40']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-4']} */ ;
    }
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex gap-1 mt-4 justify-between" }));
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    for (var _i = 0, _m = __VLS_getVForSourceType((__VLS_ctx.last7Days)); _i < _m.length; _i++) {
        var day = _m[_i][0];
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ key: (day.date) }, { class: "flex flex-col items-center gap-1 group relative" }));
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['group']} */ ;
        /** @type {__VLS_StyleScopedClasses['relative']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "w-7 h-7 rounded-full flex items-center justify-center cursor-help" }, { class: (__VLS_ctx.getTsbColor(day.tsb, true)) }));
        /** @type {__VLS_StyleScopedClasses['w-7']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-7']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['cursor-help']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-base" }));
        /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
        (__VLS_ctx.getTsbEmoji(day.tsb));
        __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "text-xs text-base-content/50" }));
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-base-content/50']} */ ;
        (day.day);
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50" }));
        /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
        /** @type {__VLS_StyleScopedClasses['bottom-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['left-1/2']} */ ;
        /** @type {__VLS_StyleScopedClasses['-translate-x-1/2']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['hidden']} */ ;
        /** @type {__VLS_StyleScopedClasses['group-hover:block']} */ ;
        /** @type {__VLS_StyleScopedClasses['z-50']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "bg-base-300 text-base-content rounded-lg shadow-lg p-2 text-xs whitespace-nowrap" }));
        /** @type {__VLS_StyleScopedClasses['bg-base-300']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-base-content']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['whitespace-nowrap']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "font-semibold mb-1 capitalize" }));
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['capitalize']} */ ;
        (day.dateDisplay);
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "space-y-0.5 text-base-content/80" }));
        /** @type {__VLS_StyleScopedClasses['space-y-0.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-base-content/80']} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "font-medium" }));
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        ((_g = day.tsb) !== null && _g !== void 0 ? _g : '-');
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "font-medium" }));
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        ((_h = day.ctl) !== null && _h !== void 0 ? _h : '-');
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "font-medium" }));
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        ((_j = day.atl) !== null && _j !== void 0 ? _j : '-');
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsics.span, __VLS_intrinsics.span)(__assign({ class: "font-medium" }));
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        ((_k = day.hrv) !== null && _k !== void 0 ? _k : '-');
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-base-300" }));
        /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
        /** @type {__VLS_StyleScopedClasses['top-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['left-1/2']} */ ;
        /** @type {__VLS_StyleScopedClasses['-translate-x-1/2']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-transparent']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-t-base-300']} */ ;
        // @ts-ignore
        [getTsbColor, chartPeriod, chartData, chartOptions, chartSeries, last7Days, getTsbEmoji,];
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
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "text-center mt-3" }));
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.a, __VLS_intrinsics.a)(__assign({ href: "https://intervals.icu", target: "_blank" }, { class: "text-xs text-base-content/40 hover:text-base-content/60" }));
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-base-content/40']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-base-content/60']} */ ;
// @ts-ignore
[];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({});
exports.default = {};
