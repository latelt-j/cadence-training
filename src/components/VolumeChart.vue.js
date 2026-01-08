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
var vue_chartjs_1 = require("vue-chartjs");
var chart_js_1 = require("chart.js");
chart_js_1.Chart.register(chart_js_1.CategoryScale, chart_js_1.LinearScale, chart_js_1.BarElement, chart_js_1.Title, chart_js_1.Tooltip, chart_js_1.Legend);
var props = defineProps();
var period = (0, vue_1.ref)(3);
var getStartOfWeek = function (date) {
    var d = new Date(date);
    var day = d.getDay();
    var diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
};
var getWeekKey = function (date) {
    var monday = getStartOfWeek(date);
    return "".concat(monday.getFullYear(), "-").concat(String(monday.getMonth() + 1).padStart(2, '0'), "-").concat(String(monday.getDate()).padStart(2, '0'));
};
var getWeekLabel = function (date) {
    var monday = getStartOfWeek(date);
    return "".concat(monday.getDate(), "/").concat(monday.getMonth() + 1);
};
var chartData = (0, vue_1.computed)(function () {
    var now = new Date();
    var startDate = new Date(now);
    startDate.setMonth(startDate.getMonth() - period.value);
    // Get all weeks in the period
    var weeks = new Map();
    // Start from the Monday of the start week
    var current = getStartOfWeek(startDate);
    var endWeek = getStartOfWeek(now);
    while (current <= endWeek) {
        var key = getWeekKey(current);
        weeks.set(key, { label: getWeekLabel(current), cyclingDone: 0, cyclingPlanned: 0, runningDone: 0, runningPlanned: 0 });
        current.setDate(current.getDate() + 7);
    }
    // Fill with session data
    props.sessions.forEach(function (session) {
        var sessionDate = new Date(session.date);
        var key = getWeekKey(sessionDate);
        var week = weeks.get(key);
        if (week) {
            var hours = session.duration_min / 60;
            var isDone = session.type === 'strava' || session.type === 'manual';
            if (session.sport === 'cycling' || session.sport === 'mtb') {
                if (isDone)
                    week.cyclingDone += hours;
                else
                    week.cyclingPlanned += hours;
            }
            else if (session.sport === 'running') {
                if (isDone)
                    week.runningDone += hours;
                else
                    week.runningPlanned += hours;
            }
        }
    });
    var sortedWeeks = Array.from(weeks.entries())
        .sort(function (_a, _b) {
        var a = _a[0];
        var b = _b[0];
        return b.localeCompare(a);
    })
        .map(function (_a) {
        var data = _a[1];
        return data;
    });
    return {
        labels: sortedWeeks.map(function (w) { return w.label; }),
        datasets: [
            {
                label: 'Vélo (fait)',
                data: sortedWeeks.map(function (w) { return Math.round(w.cyclingDone * 10) / 10; }),
                backgroundColor: 'rgba(236, 72, 153, 0.9)', // pink-500
                borderRadius: 4,
                stack: 'cycling',
            },
            {
                label: 'Vélo (prévu)',
                data: sortedWeeks.map(function (w) { return Math.round(w.cyclingPlanned * 10) / 10; }),
                backgroundColor: 'rgba(236, 72, 153, 0.35)', // pink-500/35
                borderRadius: 4,
                stack: 'cycling',
            },
            {
                label: 'Course (fait)',
                data: sortedWeeks.map(function (w) { return Math.round(w.runningDone * 10) / 10; }),
                backgroundColor: 'rgba(56, 189, 248, 0.9)', // sky-400
                borderRadius: 4,
                stack: 'running',
            },
            {
                label: 'Course (prévu)',
                data: sortedWeeks.map(function (w) { return Math.round(w.runningPlanned * 10) / 10; }),
                backgroundColor: 'rgba(56, 189, 248, 0.35)', // sky-400/35
                borderRadius: 4,
                stack: 'running',
            },
        ],
    };
});
var chartOptions = (0, vue_1.computed)(function () { return ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
        intersect: false,
        mode: 'index',
    },
    scales: {
        x: {
            stacked: true,
            grid: { display: false },
        },
        y: {
            stacked: true,
            title: { display: true, text: 'Heures' },
            beginAtZero: true,
        },
    },
    skipNull: true,
    plugins: {
        legend: {
            position: 'bottom',
        },
        tooltip: {
            callbacks: {
                label: function (ctx) {
                    var totalMinutes = Math.round(ctx.parsed.y * 60);
                    var hours = Math.floor(totalMinutes / 60);
                    var minutes = totalMinutes % 60;
                    return "".concat(ctx.dataset.label || '', ": ").concat(hours, "h").concat(minutes.toString().padStart(2, '0'));
                },
            },
        },
    },
}); });
var __VLS_ctx = __assign(__assign(__assign(__assign({}, {}), {}), {}), {});
var ___VLS_components;
var ___VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "card bg-base-100 shadow-xl" }));
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-base-100']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-xl']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "card-body" }));
/** @type {__VLS_StyleScopedClasses['card-body']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "flex justify-between items-center mb-4" }));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.h2, __VLS_intrinsics.h2)(__assign({ class: "card-title text-lg" }));
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "btn-group" }));
/** @type {__VLS_StyleScopedClasses['btn-group']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign({ onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.period = 1;
        // @ts-ignore
        [period,];
    } }, { class: "btn btn-sm" }), { class: (__VLS_ctx.period === 1 ? 'btn-primary' : 'btn-ghost') }));
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign({ onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.period = 3;
        // @ts-ignore
        [period, period,];
    } }, { class: "btn btn-sm" }), { class: (__VLS_ctx.period === 3 ? 'btn-primary' : 'btn-ghost') }));
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)(__assign(__assign({ onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.period = 6;
        // @ts-ignore
        [period, period,];
    } }, { class: "btn btn-sm" }), { class: (__VLS_ctx.period === 6 ? 'btn-primary' : 'btn-ghost') }));
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)(__assign({ class: "h-64" }));
/** @type {__VLS_StyleScopedClasses['h-64']} */ ;
var __VLS_0;
/** @ts-ignore @type {typeof ___VLS_components.Bar} */
vue_chartjs_1.Bar;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    data: (__VLS_ctx.chartData),
    options: (__VLS_ctx.chartOptions),
}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{
        data: (__VLS_ctx.chartData),
        options: (__VLS_ctx.chartOptions),
    }], __VLS_functionalComponentArgsRest(__VLS_1), false));
// @ts-ignore
[period, chartData, chartOptions,];
var __VLS_export = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    __typeProps: {},
});
exports.default = {};
