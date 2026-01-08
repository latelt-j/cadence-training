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
exports.useIntervals = useIntervals;
var vue_1 = require("vue");
var SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
var SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
var isLoading = (0, vue_1.ref)(false);
var error = (0, vue_1.ref)(null);
var todayWellness = (0, vue_1.ref)(null);
var wellnessHistory = (0, vue_1.ref)([]);
function useIntervals() {
    var _this = this;
    var fetchWellness = function (startDate, endDate) { return __awaiter(_this, void 0, void 0, function () {
        var endpoint, response, err, data, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    isLoading.value = true;
                    error.value = null;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 8]);
                    endpoint = "/athlete/{athleteId}/wellness?oldest=".concat(startDate, "&newest=").concat(endDate);
                    return [4 /*yield*/, fetch("".concat(SUPABASE_URL, "/functions/v1/intervals-proxy"), {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': "Bearer ".concat(SUPABASE_ANON_KEY),
                            },
                            body: JSON.stringify({ endpoint: endpoint }),
                        })];
                case 2:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 3:
                    err = _a.sent();
                    throw new Error(err.error || "Erreur API Intervals: ".concat(response.status));
                case 4: return [4 /*yield*/, response.json()];
                case 5:
                    data = _a.sent();
                    wellnessHistory.value = data;
                    return [2 /*return*/, data];
                case 6:
                    e_1 = _a.sent();
                    error.value = e_1 instanceof Error ? e_1.message : 'Erreur inconnue';
                    console.error('Fetch error:', e_1);
                    return [2 /*return*/, []];
                case 7:
                    isLoading.value = false;
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    var fetchTodayWellness = function () {
        var today = new Date().toISOString().split('T')[0];
        var todayData = wellnessHistory.value.find(function (w) { return w.id === today; });
        if (todayData) {
            todayWellness.value = todayData;
            return todayData;
        }
        return null;
    };
    var fetchWellnessRange = function () {
        var args_1 = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args_1[_i] = arguments[_i];
        }
        return __awaiter(_this, __spreadArray([], args_1, true), void 0, function (days) {
            var endDate, startDate;
            var _a, _b;
            if (days === void 0) { days = 42; }
            return __generator(this, function (_c) {
                endDate = (_a = new Date().toISOString().split('T')[0]) !== null && _a !== void 0 ? _a : '';
                startDate = (_b = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]) !== null && _b !== void 0 ? _b : '';
                return [2 /*return*/, fetchWellness(startDate, endDate)];
            });
        });
    };
    // Computed values for easy access
    // HRV can be in different fields depending on the source (Garmin uses lastNightAvg)
    var currentHRV = (0, vue_1.computed)(function () {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        return (_h = (_f = (_d = (_b = (_a = todayWellness.value) === null || _a === void 0 ? void 0 : _a.hrv) !== null && _b !== void 0 ? _b : (_c = todayWellness.value) === null || _c === void 0 ? void 0 : _c.hrvSDNN) !== null && _d !== void 0 ? _d : (_e = todayWellness.value) === null || _e === void 0 ? void 0 : _e.rmssd) !== null && _f !== void 0 ? _f : (_g = todayWellness.value) === null || _g === void 0 ? void 0 : _g.lastNightAvg) !== null && _h !== void 0 ? _h : null;
    });
    var currentRestingHR = (0, vue_1.computed)(function () { var _a, _b; return (_b = (_a = todayWellness.value) === null || _a === void 0 ? void 0 : _a.restingHR) !== null && _b !== void 0 ? _b : null; });
    var currentCTL = (0, vue_1.computed)(function () { var _a, _b; return (_b = (_a = todayWellness.value) === null || _a === void 0 ? void 0 : _a.ctl) !== null && _b !== void 0 ? _b : null; });
    var currentATL = (0, vue_1.computed)(function () { var _a, _b; return (_b = (_a = todayWellness.value) === null || _a === void 0 ? void 0 : _a.atl) !== null && _b !== void 0 ? _b : null; });
    var currentTSB = (0, vue_1.computed)(function () {
        var _a, _b;
        if (((_a = todayWellness.value) === null || _a === void 0 ? void 0 : _a.ctl) !== undefined && ((_b = todayWellness.value) === null || _b === void 0 ? void 0 : _b.atl) !== undefined) {
            return Math.round(todayWellness.value.ctl - todayWellness.value.atl);
        }
        return null;
    });
    var currentReadiness = (0, vue_1.computed)(function () { var _a, _b; return (_b = (_a = todayWellness.value) === null || _a === void 0 ? void 0 : _a.readiness) !== null && _b !== void 0 ? _b : null; });
    var currentSleepScore = (0, vue_1.computed)(function () { var _a, _b; return (_b = (_a = todayWellness.value) === null || _a === void 0 ? void 0 : _a.sleepScore) !== null && _b !== void 0 ? _b : null; });
    // Form status based on TSB
    var formStatus = (0, vue_1.computed)(function () {
        var tsb = currentTSB.value;
        if (tsb === null)
            return null;
        if (tsb > 15)
            return { label: 'Frais', color: 'text-cyan-500', icon: '❄️' };
        if (tsb > 5)
            return { label: 'Forme', color: 'text-emerald-500', icon: '💪' };
        if (tsb > -10)
            return { label: 'Optimal', color: 'text-green-500', icon: '🎯' };
        if (tsb > -25)
            return { label: 'Fatigué', color: 'text-orange-500', icon: '😓' };
        return { label: 'Épuisé', color: 'text-rose-600', icon: '🛑' };
    });
    return {
        isLoading: isLoading,
        error: error,
        todayWellness: todayWellness,
        wellnessHistory: wellnessHistory,
        fetchTodayWellness: fetchTodayWellness,
        fetchWellnessRange: fetchWellnessRange,
        currentHRV: currentHRV,
        currentRestingHR: currentRestingHR,
        currentCTL: currentCTL,
        currentATL: currentATL,
        currentTSB: currentTSB,
        currentReadiness: currentReadiness,
        currentSleepScore: currentSleepScore,
        formStatus: formStatus,
    };
}
