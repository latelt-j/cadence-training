"use strict";
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
exports.useSessions = useSessions;
var vue_1 = require("vue");
var uuid_1 = require("uuid");
var session_1 = require("../types/session");
var useSupabase_1 = require("./useSupabase");
var STORAGE_KEY = 'training-planner-sessions';
var sessions = (0, vue_1.ref)([]);
var isLoading = (0, vue_1.ref)(false);
var isSynced = (0, vue_1.ref)(false);
var syncError = (0, vue_1.ref)(null);
function useSessions() {
    var _this = this;
    var _a = (0, useSupabase_1.useSupabase)(), fetchSessions = _a.fetchSessions, dbCreateSession = _a.createSession, dbUpdateSession = _a.updateSession, dbDeleteSession = _a.deleteSession, dbUpsertSessions = _a.upsertSessions;
    // Load from localStorage as cache first (instant display)
    var loadFromCache = function () {
        var savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
            var parsedSessions = JSON.parse(savedData);
            // Migration: convert old sessions
            parsedSessions = parsedSessions.map(function (s) {
                var updated = s;
                if (!s.title && s.name) {
                    updated = __assign(__assign({}, updated), { title: s.name });
                }
                // Only mark as strava if it has a strava_id
                if (s.strava_id && s.type !== 'strava') {
                    updated = __assign(__assign({}, updated), { type: 'strava' });
                }
                // Default unknown types to 'planned'
                if (!s.type || !['planned', 'strava', 'manual'].includes(s.type)) {
                    updated = __assign(__assign({}, updated), { type: 'planned' });
                }
                return updated;
            });
            sessions.value = parsedSessions;
        }
    };
    // Sync from Supabase
    var syncFromSupabase = function () { return __awaiter(_this, void 0, void 0, function () {
        var dbSessions, migratedSessions, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    isLoading.value = true;
                    syncError.value = null;
                    console.log('Syncing from Supabase...');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, fetchSessions()];
                case 2:
                    dbSessions = _a.sent();
                    console.log('Fetched sessions from Supabase:', dbSessions);
                    migratedSessions = dbSessions.map(function (s) {
                        if (!s.type || !['planned', 'strava', 'manual'].includes(s.type)) {
                            return __assign(__assign({}, s), { type: s.strava_id ? 'strava' : 'planned' });
                        }
                        return s;
                    });
                    sessions.value = migratedSessions;
                    // Update local cache
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedSessions));
                    isSynced.value = true;
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error('Error syncing from Supabase:', error_1);
                    syncError.value = error_1 instanceof Error ? error_1.message : 'Erreur de synchronisation';
                    return [3 /*break*/, 5];
                case 4:
                    isLoading.value = false;
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Save to localStorage (for cache) and debounced Supabase sync
    var saveToCache = function () {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.value));
    };
    // Initialize: load cache immediately, then sync with Supabase
    var init = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    loadFromCache();
                    return [4 /*yield*/, syncFromSupabase()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var loadFromJson = function (jsonData_1) {
        var args_1 = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args_1[_i - 1] = arguments[_i];
        }
        return __awaiter(_this, __spreadArray([jsonData_1], args_1, true), void 0, function (jsonData, replaceExisting) {
            var today, newSessions, sessionsToAdd, sessionsToDelete, importDates_1, _a, sessionsToDelete_1, id, error_2, error_3;
            var _b;
            if (replaceExisting === void 0) { replaceExisting = false; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        today = (_b = new Date().toISOString().split('T')[0]) !== null && _b !== void 0 ? _b : '';
                        newSessions = jsonData.map(function (item) {
                            var _a;
                            // Check if it's already a full ScheduledSession
                            if ('id' in item && 'date' in item) {
                                var session = item;
                                // Ensure type is valid, default to 'planned'
                                if (!session.type || !['planned', 'strava', 'manual'].includes(session.type)) {
                                    return __assign(__assign({}, session), { type: 'planned' });
                                }
                                return session;
                            }
                            // Otherwise create a new session, preserving date if provided
                            var itemWithDate = item;
                            return __assign(__assign({}, item), { id: (0, uuid_1.v4)(), date: (_a = itemWithDate.date) !== null && _a !== void 0 ? _a : today, 
                                // Always 'planned' for new imported sessions (workout type like "sweet_spot" is preserved in ...item)
                                type: item.strava_id ? 'strava' : 'planned' });
                        });
                        sessionsToAdd = [];
                        sessionsToDelete = [];
                        // If replaceExisting, remove all non-strava sessions on the dates we're importing
                        if (replaceExisting) {
                            importDates_1 = new Set(newSessions.map(function (s) { return s.date; }));
                            sessions.value = sessions.value.filter(function (s) {
                                // Keep Strava-synced sessions (they have strava_id)
                                if (importDates_1.has(s.date) && !s.strava_id) {
                                    sessionsToDelete.push(s.id);
                                    return false;
                                }
                                return true;
                            });
                        }
                        newSessions.forEach(function (newSession) {
                            var key = "".concat(newSession.title, "-").concat(newSession.date);
                            var existingIndex = sessions.value.findIndex(function (s) { return "".concat(s.title, "-").concat(s.date) === key; });
                            if (existingIndex !== -1) {
                                var existing = sessions.value[existingIndex];
                                // Don't replace Strava-synced sessions
                                if (existing && !existing.strava_id) {
                                    sessions.value[existingIndex] = newSession;
                                    sessionsToAdd.push(newSession);
                                }
                            }
                            else {
                                sessions.value.push(newSession);
                                sessionsToAdd.push(newSession);
                            }
                        });
                        saveToCache();
                        _a = 0, sessionsToDelete_1 = sessionsToDelete;
                        _c.label = 1;
                    case 1:
                        if (!(_a < sessionsToDelete_1.length)) return [3 /*break*/, 6];
                        id = sessionsToDelete_1[_a];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, dbDeleteSession(id)];
                    case 3:
                        _c.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _c.sent();
                        console.error('Error deleting session:', error_2);
                        return [3 /*break*/, 5];
                    case 5:
                        _a++;
                        return [3 /*break*/, 1];
                    case 6:
                        if (!(sessionsToAdd.length > 0)) return [3 /*break*/, 10];
                        _c.label = 7;
                    case 7:
                        _c.trys.push([7, 9, , 10]);
                        return [4 /*yield*/, dbUpsertSessions(sessionsToAdd)];
                    case 8:
                        _c.sent();
                        return [3 /*break*/, 10];
                    case 9:
                        error_3 = _c.sent();
                        console.error('Error syncing imported sessions:', error_3);
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    var addSession = function (template, date) { return __awaiter(_this, void 0, void 0, function () {
        var newSession, result, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    newSession = __assign(__assign({}, template), { id: (0, uuid_1.v4)(), date: date });
                    console.log('Adding session:', newSession);
                    // Optimistic update
                    sessions.value.push(newSession);
                    saveToCache();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    console.log('Syncing to Supabase...');
                    return [4 /*yield*/, dbCreateSession(newSession)];
                case 2:
                    result = _a.sent();
                    console.log('Supabase result:', result);
                    return [3 /*break*/, 4];
                case 3:
                    error_4 = _a.sent();
                    console.error('Error creating session in Supabase:', error_4);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/, newSession];
            }
        });
    }); };
    var addSessions = function (templates, date) { return __awaiter(_this, void 0, void 0, function () {
        var newSessions, result, error_5;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    newSessions = templates.map(function (template) { return (__assign(__assign({}, template), { id: (0, uuid_1.v4)(), date: date })); });
                    console.log('Adding sessions:', newSessions);
                    // Optimistic update
                    (_a = sessions.value).push.apply(_a, newSessions);
                    saveToCache();
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    console.log('Syncing sessions to Supabase...');
                    return [4 /*yield*/, dbUpsertSessions(newSessions)];
                case 2:
                    result = _b.sent();
                    console.log('Supabase upsert result:', result);
                    return [3 /*break*/, 4];
                case 3:
                    error_5 = _b.sent();
                    console.error('Error creating sessions in Supabase:', error_5);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/, newSessions];
            }
        });
    }); };
    var updateSessionDate = function (sessionId, newDate) { return __awaiter(_this, void 0, void 0, function () {
        var session, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    session = sessions.value.find(function (s) { return s.id === sessionId; });
                    if (!session) return [3 /*break*/, 4];
                    session.date = newDate;
                    saveToCache();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, dbUpdateSession(session)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_6 = _a.sent();
                    console.error('Error updating session in Supabase:', error_6);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var updateSessionFeedback = function (sessionId, feedback) { return __awaiter(_this, void 0, void 0, function () {
        var session, error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    session = sessions.value.find(function (s) { return s.id === sessionId; });
                    if (!session) return [3 /*break*/, 4];
                    session.coach_feedback = feedback;
                    saveToCache();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, dbUpdateSession(session)];
                case 2:
                    _a.sent();
                    return [2 /*return*/, true];
                case 3:
                    error_7 = _a.sent();
                    console.error('Error updating session feedback in Supabase:', error_7);
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/, false];
            }
        });
    }); };
    var updateSession = function (sessionId, updates) { return __awaiter(_this, void 0, void 0, function () {
        var session, error_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    session = sessions.value.find(function (s) { return s.id === sessionId; });
                    if (!session) return [3 /*break*/, 4];
                    Object.assign(session, updates);
                    saveToCache();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, dbUpdateSession(session)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_8 = _a.sent();
                    console.error('Error updating session in Supabase:', error_8);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var removeSession = function (sessionId) { return __awaiter(_this, void 0, void 0, function () {
        var index, error_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    index = sessions.value.findIndex(function (s) { return s.id === sessionId; });
                    if (!(index !== -1)) return [3 /*break*/, 4];
                    sessions.value.splice(index, 1);
                    saveToCache();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, dbDeleteSession(sessionId)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_9 = _a.sent();
                    console.error('Error deleting session in Supabase:', error_9);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Bulk upsert for Strava sync
    var upsertSessions = function (newSessions) { return __awaiter(_this, void 0, void 0, function () {
        var error_10;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    newSessions.forEach(function (newSession) {
                        var existingIndex = sessions.value.findIndex(function (s) { return s.id === newSession.id; });
                        if (existingIndex !== -1) {
                            sessions.value[existingIndex] = newSession;
                        }
                        else {
                            sessions.value.push(newSession);
                        }
                    });
                    saveToCache();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, dbUpsertSessions(newSessions)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_10 = _a.sent();
                    console.error('Error upserting sessions in Supabase:', error_10);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var exportToJson = function () {
        var plannedOnly = sessions.value.filter(function (s) { return s.type !== 'strava'; });
        return JSON.stringify(plannedOnly, null, 2);
    };
    var downloadJson = function () {
        var json = exportToJson();
        var blob = new Blob([json], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = "training-plan-".concat(new Date().toISOString().split('T')[0], ".json");
        a.click();
        URL.revokeObjectURL(url);
    };
    var reset = function () { return __awaiter(_this, void 0, void 0, function () {
        var sessionsToDelete, _i, sessionsToDelete_2, session, error_11;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    sessionsToDelete = __spreadArray([], sessions.value, true);
                    sessions.value = [];
                    localStorage.removeItem(STORAGE_KEY);
                    _i = 0, sessionsToDelete_2 = sessionsToDelete;
                    _a.label = 1;
                case 1:
                    if (!(_i < sessionsToDelete_2.length)) return [3 /*break*/, 6];
                    session = sessionsToDelete_2[_i];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, dbDeleteSession(session.id)];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_11 = _a.sent();
                    console.error('Error deleting session:', error_11);
                    return [3 /*break*/, 5];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var currentWeekDate = (0, vue_1.ref)(new Date());
    var setCurrentWeek = function (date) {
        currentWeekDate.value = date;
    };
    var getWeekDates = function (date) {
        if (date === void 0) { date = new Date(); }
        var day = date.getDay();
        var diff = date.getDate() - day + (day === 0 ? -6 : 1);
        var start = new Date(date);
        start.setDate(diff);
        start.setHours(0, 0, 0, 0);
        var end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        return { start: start, end: end };
    };
    var weeklyStats = (0, vue_1.computed)(function () {
        var _a = getWeekDates(currentWeekDate.value), start = _a.start, end = _a.end;
        var weekSessions = sessions.value.filter(function (s) {
            var sessionDate = new Date(s.date);
            return sessionDate >= start && sessionDate <= end;
        });
        var stats = {
            cycling: { hours: 0, km: 0, elevation: 0, planned: 0, accomplished: 0 },
            running: { hours: 0, km: 0, elevation: 0, planned: 0, accomplished: 0 },
            strength: { hours: 0, planned: 0, accomplished: 0 },
            total: { hours: 0, sessions: weekSessions.length },
            planned: { hours: 0, sessions: 0 },
            accomplished: { hours: 0, sessions: 0 },
        };
        weekSessions.forEach(function (session) {
            var _a, _b, _c, _d;
            var hours = session.duration_min / 60;
            var sport = session.sport;
            var isAccomplished = session.type === 'strava' || session.type === 'manual';
            if (sport === 'cycling') {
                stats.cycling.hours += hours;
                stats.cycling.km += (_a = session.actual_km) !== null && _a !== void 0 ? _a : hours * session_1.ESTIMATES.cycling.avgSpeedKmh;
                stats.cycling.elevation += (_b = session.actual_elevation) !== null && _b !== void 0 ? _b : 0;
                if (isAccomplished) {
                    stats.cycling.accomplished += hours;
                }
                else {
                    stats.cycling.planned += hours;
                }
            }
            else if (sport === 'running') {
                stats.running.hours += hours;
                stats.running.km += (_c = session.actual_km) !== null && _c !== void 0 ? _c : hours * session_1.ESTIMATES.running.avgSpeedKmh;
                stats.running.elevation += (_d = session.actual_elevation) !== null && _d !== void 0 ? _d : 0;
                if (isAccomplished) {
                    stats.running.accomplished += hours;
                }
                else {
                    stats.running.planned += hours;
                }
            }
            else if (sport === 'strength') {
                stats.strength.hours += hours;
                if (isAccomplished) {
                    stats.strength.accomplished += hours;
                }
                else {
                    stats.strength.planned += hours;
                }
            }
            stats.total.hours += hours;
            // Track planned vs accomplished (global)
            if (isAccomplished) {
                stats.accomplished.hours += hours;
                stats.accomplished.sessions++;
            }
            else {
                stats.planned.hours += hours;
                stats.planned.sessions++;
            }
        });
        return stats;
    });
    return {
        sessions: sessions,
        isLoading: isLoading,
        isSynced: isSynced,
        syncError: syncError,
        init: init,
        syncFromSupabase: syncFromSupabase,
        loadFromJson: loadFromJson,
        addSession: addSession,
        addSessions: addSessions,
        updateSessionDate: updateSessionDate,
        updateSessionFeedback: updateSessionFeedback,
        updateSession: updateSession,
        removeSession: removeSession,
        upsertSessions: upsertSessions,
        exportToJson: exportToJson,
        downloadJson: downloadJson,
        reset: reset,
        weeklyStats: weeklyStats,
        setCurrentWeek: setCurrentWeek,
        currentWeekDate: currentWeekDate,
    };
}
