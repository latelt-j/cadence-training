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
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSupabase = useSupabase;
var supabase_js_1 = require("@supabase/supabase-js");
var vue_1 = require("vue");
// Singleton client
var supabase = null;
var isInitialized = (0, vue_1.ref)(false);
var initError = (0, vue_1.ref)(null);
function useSupabase() {
    var _this = this;
    var getClient = function () {
        if (!supabase) {
            var url = import.meta.env.VITE_SUPABASE_URL;
            var anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
            if (!url || !anonKey) {
                throw new Error('Supabase URL and Anon Key must be set in environment variables');
            }
            supabase = (0, supabase_js_1.createClient)(url, anonKey);
            isInitialized.value = true;
        }
        return supabase;
    };
    // Sessions CRUD
    var fetchSessions = function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, data, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getClient()
                        .from('sessions')
                        .select('*')
                        .order('date', { ascending: true })];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error('Error fetching sessions:', error);
                        throw error;
                    }
                    return [2 /*return*/, data.map(dbToSession)];
            }
        });
    }); };
    var createSession = function (session) { return __awaiter(_this, void 0, void 0, function () {
        var dbSession, _a, data, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    dbSession = sessionToDb(session);
                    return [4 /*yield*/, getClient()
                            .from('sessions')
                            .insert(dbSession)
                            .select()
                            .single()];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error('Error creating session:', error);
                        throw error;
                    }
                    return [2 /*return*/, dbToSession(data)];
            }
        });
    }); };
    var updateSession = function (session) { return __awaiter(_this, void 0, void 0, function () {
        var dbSession, _a, data, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    dbSession = sessionToDb(session);
                    return [4 /*yield*/, getClient()
                            .from('sessions')
                            .update(dbSession)
                            .eq('id', session.id)
                            .select()
                            .single()];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error('Error updating session:', error);
                        throw error;
                    }
                    return [2 /*return*/, dbToSession(data)];
            }
        });
    }); };
    var deleteSession = function (id) { return __awaiter(_this, void 0, void 0, function () {
        var error;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getClient()
                        .from('sessions')
                        .delete()
                        .eq('id', id)];
                case 1:
                    error = (_a.sent()).error;
                    if (error) {
                        console.error('Error deleting session:', error);
                        throw error;
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    var upsertSession = function (session) { return __awaiter(_this, void 0, void 0, function () {
        var dbSession, _a, data, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    dbSession = sessionToDb(session);
                    return [4 /*yield*/, getClient()
                            .from('sessions')
                            .upsert(dbSession, { onConflict: 'id' })
                            .select()
                            .single()];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error('Error upserting session:', error);
                        throw error;
                    }
                    return [2 /*return*/, dbToSession(data)];
            }
        });
    }); };
    var upsertSessions = function (sessions) { return __awaiter(_this, void 0, void 0, function () {
        var uniqueMap, uniqueSessions, dbSessions, _a, data, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (sessions.length === 0)
                        return [2 /*return*/, []
                            // Deduplicate by ID (keep last occurrence)
                        ];
                    uniqueMap = new Map();
                    sessions.forEach(function (s) { return uniqueMap.set(s.id, s); });
                    uniqueSessions = Array.from(uniqueMap.values());
                    dbSessions = uniqueSessions.map(sessionToDb);
                    console.log('Upserting unique sessions:', dbSessions.length);
                    return [4 /*yield*/, getClient()
                            .from('sessions')
                            .upsert(dbSessions, { onConflict: 'id' })
                            .select()];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error('Error upserting sessions:', error);
                        throw error;
                    }
                    return [2 /*return*/, data.map(dbToSession)];
            }
        });
    }); };
    var deleteSessionsByDateAndType = function (date, excludeType) { return __awaiter(_this, void 0, void 0, function () {
        var error;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getClient()
                        .from('sessions')
                        .delete()
                        .eq('date', date)
                        .neq('type', excludeType)];
                case 1:
                    error = (_a.sent()).error;
                    if (error) {
                        console.error('Error deleting sessions by date:', error);
                        throw error;
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    // User Settings
    var fetchSettings = function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, data, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getClient()
                        .from('user_settings')
                        .select('*')
                        .eq('id', 1)
                        .single()];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        if (error.code === 'PGRST116')
                            return [2 /*return*/, null]; // No rows
                        console.error('Error fetching settings:', error);
                        throw error;
                    }
                    return [2 /*return*/, data];
            }
        });
    }); };
    var updateSettings = function (settings) { return __awaiter(_this, void 0, void 0, function () {
        var _a, data, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getClient()
                        .from('user_settings')
                        .update(settings)
                        .eq('id', 1)
                        .select()
                        .single()];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error('Error updating settings:', error);
                        throw error;
                    }
                    return [2 /*return*/, data];
            }
        });
    }); };
    // OAuth Tokens
    var fetchOAuthTokens = function (provider) { return __awaiter(_this, void 0, void 0, function () {
        var _a, data, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getClient()
                        .from('oauth_tokens')
                        .select('*')
                        .eq('provider', provider)
                        .single()];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        if (error.code === 'PGRST116')
                            return [2 /*return*/, null]; // No rows
                        console.error('Error fetching OAuth tokens:', error);
                        throw error;
                    }
                    return [2 /*return*/, data];
            }
        });
    }); };
    var upsertOAuthTokens = function (provider, tokens) { return __awaiter(_this, void 0, void 0, function () {
        var _a, data, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getClient()
                        .from('oauth_tokens')
                        .upsert(__assign({ id: provider === 'strava' ? 1 : 2, provider: provider }, tokens), { onConflict: 'provider' })
                        .select()
                        .single()];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error('Error upserting OAuth tokens:', error);
                        throw error;
                    }
                    return [2 /*return*/, data];
            }
        });
    }); };
    var deleteOAuthTokens = function (provider) { return __awaiter(_this, void 0, void 0, function () {
        var error;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getClient()
                        .from('oauth_tokens')
                        .delete()
                        .eq('provider', provider)];
                case 1:
                    error = (_a.sent()).error;
                    if (error) {
                        console.error('Error deleting OAuth tokens:', error);
                        throw error;
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    // Helpers
    var dbToSession = function (db) { return (__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign({ id: db.id, sport: db.sport, type: db.type, title: db.title, date: db.date, duration_min: db.duration_min, description: db.description || '', structure: db.structure || [] }, (db.actual_km !== null && { actual_km: db.actual_km })), (db.actual_elevation !== null && { actual_elevation: db.actual_elevation })), (db.strava_id !== null && { strava_id: db.strava_id })), (db.laps && db.laps.length > 0 && { laps: db.laps })), (db.average_heartrate !== null && { average_heartrate: db.average_heartrate })), (db.max_heartrate !== null && { max_heartrate: db.max_heartrate })), (db.average_watts !== null && { average_watts: db.average_watts })), (db.max_watts !== null && { max_watts: db.max_watts })), (db.average_cadence !== null && { average_cadence: db.average_cadence })), (db.coach_feedback && { coach_feedback: db.coach_feedback })), (db.normalized_power !== null && { normalized_power: db.normalized_power })), (db.device_watts !== null && { device_watts: db.device_watts })), (db.suffer_score !== null && { suffer_score: db.suffer_score })), (db.kilojoules !== null && { kilojoules: db.kilojoules })), (db.calories !== null && { calories: db.calories })), (db.intensity_factor !== null && { intensity_factor: db.intensity_factor })), (db.variability_index !== null && { variability_index: db.variability_index })), (db.aerobic_decoupling !== null && { aerobic_decoupling: db.aerobic_decoupling })), (db.average_vam !== null && { average_vam: db.average_vam })), (db.intensity !== null && { intensity: db.intensity })), (db.zwift_workout && { zwift_workout: db.zwift_workout })), (db.planned_title && { planned_title: db.planned_title })), (db.planned_description && { planned_description: db.planned_description }))); };
    var sessionToDb = function (session) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
        return ({
            id: session.id,
            sport: session.sport,
            type: session.type,
            title: session.title,
            date: session.date,
            duration_min: session.duration_min,
            description: session.description || '',
            structure: session.structure || [],
            actual_km: (_a = session.actual_km) !== null && _a !== void 0 ? _a : null,
            actual_elevation: (_b = session.actual_elevation) !== null && _b !== void 0 ? _b : null,
            strava_id: (_c = session.strava_id) !== null && _c !== void 0 ? _c : null,
            laps: (_d = session.laps) !== null && _d !== void 0 ? _d : null,
            average_heartrate: session.average_heartrate ? Math.round(session.average_heartrate) : null,
            max_heartrate: session.max_heartrate ? Math.round(session.max_heartrate) : null,
            average_watts: session.average_watts ? Math.round(session.average_watts) : null,
            max_watts: session.max_watts ? Math.round(session.max_watts) : null,
            average_cadence: session.average_cadence ? Math.round(session.average_cadence) : null,
            coach_feedback: (_e = session.coach_feedback) !== null && _e !== void 0 ? _e : null,
            // Cycling metrics
            normalized_power: session.normalized_power ? Math.round(session.normalized_power) : null,
            device_watts: (_f = session.device_watts) !== null && _f !== void 0 ? _f : null,
            suffer_score: session.suffer_score ? Math.round(session.suffer_score) : null,
            kilojoules: (_g = session.kilojoules) !== null && _g !== void 0 ? _g : null,
            calories: session.calories ? Math.round(session.calories) : null,
            intensity_factor: (_h = session.intensity_factor) !== null && _h !== void 0 ? _h : null,
            variability_index: (_j = session.variability_index) !== null && _j !== void 0 ? _j : null,
            aerobic_decoupling: (_k = session.aerobic_decoupling) !== null && _k !== void 0 ? _k : null,
            average_vam: session.average_vam ? Math.round(session.average_vam) : null,
            // Planned intensity
            intensity: (_l = session.intensity) !== null && _l !== void 0 ? _l : null,
            // Zwift workout
            zwift_workout: (_m = session.zwift_workout) !== null && _m !== void 0 ? _m : null,
            // Planned session info
            planned_title: (_o = session.planned_title) !== null && _o !== void 0 ? _o : null,
            planned_description: (_p = session.planned_description) !== null && _p !== void 0 ? _p : null,
        });
    };
    return {
        getClient: getClient,
        isInitialized: isInitialized,
        initError: initError,
        // Sessions
        fetchSessions: fetchSessions,
        createSession: createSession,
        updateSession: updateSession,
        deleteSession: deleteSession,
        upsertSession: upsertSession,
        upsertSessions: upsertSessions,
        deleteSessionsByDateAndType: deleteSessionsByDateAndType,
        // Settings
        fetchSettings: fetchSettings,
        updateSettings: updateSettings,
        // OAuth
        fetchOAuthTokens: fetchOAuthTokens,
        upsertOAuthTokens: upsertOAuthTokens,
        deleteOAuthTokens: deleteOAuthTokens,
    };
}
