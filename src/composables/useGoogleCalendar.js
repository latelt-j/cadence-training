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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useGoogleCalendar = useGoogleCalendar;
var vue_1 = require("vue");
var session_1 = require("../types/session");
var GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
var REDIRECT_URI = window.location.origin;
var STORAGE_KEY = 'google-calendar-tokens';
var SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
var SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
var tokens = (0, vue_1.ref)(null);
var isLoading = (0, vue_1.ref)(false);
var error = (0, vue_1.ref)(null);
// Load tokens from localStorage
var savedTokens = localStorage.getItem(STORAGE_KEY);
if (savedTokens) {
    tokens.value = JSON.parse(savedTokens);
}
function useGoogleCalendar() {
    var _this = this;
    var isConnected = (0, vue_1.computed)(function () { return tokens.value !== null; });
    var saveTokens = function (newTokens) {
        tokens.value = newTokens;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newTokens));
    };
    var clearTokens = function () {
        tokens.value = null;
        localStorage.removeItem(STORAGE_KEY);
    };
    var authorize = function () {
        var scope = 'https://www.googleapis.com/auth/calendar.events';
        var params = new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID,
            redirect_uri: REDIRECT_URI,
            response_type: 'code',
            scope: scope,
            access_type: 'offline',
            prompt: 'consent',
            state: 'google',
        });
        window.location.href = "https://accounts.google.com/o/oauth2/v2/auth?".concat(params.toString());
    };
    var handleCallback = function (code) { return __awaiter(_this, void 0, void 0, function () {
        var response, err, data, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    isLoading.value = true;
                    error.value = null;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 8]);
                    return [4 /*yield*/, fetch("".concat(SUPABASE_URL, "/functions/v1/google-auth"), {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': "Bearer ".concat(SUPABASE_ANON_KEY),
                            },
                            body: JSON.stringify({
                                code: code,
                                redirect_uri: REDIRECT_URI,
                                grant_type: 'authorization_code',
                            }),
                        })];
                case 2:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 3:
                    err = _a.sent();
                    throw new Error(err.error || 'Échec de l\'authentification Google');
                case 4: return [4 /*yield*/, response.json()];
                case 5:
                    data = _a.sent();
                    saveTokens({
                        access_token: data.access_token,
                        refresh_token: data.refresh_token,
                        expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
                    });
                    return [2 /*return*/, true];
                case 6:
                    e_1 = _a.sent();
                    error.value = e_1 instanceof Error ? e_1.message : 'Erreur inconnue';
                    return [2 /*return*/, false];
                case 7:
                    isLoading.value = false;
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    var refreshAccessToken = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, data, _a;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!((_b = tokens.value) === null || _b === void 0 ? void 0 : _b.refresh_token))
                        return [2 /*return*/, false];
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch("".concat(SUPABASE_URL, "/functions/v1/google-auth"), {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': "Bearer ".concat(SUPABASE_ANON_KEY),
                            },
                            body: JSON.stringify({
                                refresh_token: tokens.value.refresh_token,
                                grant_type: 'refresh_token',
                            }),
                        })];
                case 2:
                    response = _c.sent();
                    if (!response.ok) {
                        clearTokens();
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _c.sent();
                    saveTokens({
                        access_token: data.access_token,
                        refresh_token: data.refresh_token || tokens.value.refresh_token,
                        expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
                    });
                    return [2 /*return*/, true];
                case 4:
                    _a = _c.sent();
                    clearTokens();
                    return [2 /*return*/, false];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var getValidToken = function () { return __awaiter(_this, void 0, void 0, function () {
        var now, refreshed;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!tokens.value)
                        return [2 /*return*/, null];
                    now = Math.floor(Date.now() / 1000);
                    if (!(tokens.value.expires_at < now + 60)) return [3 /*break*/, 2];
                    return [4 /*yield*/, refreshAccessToken()];
                case 1:
                    refreshed = _a.sent();
                    if (!refreshed)
                        return [2 /*return*/, null];
                    _a.label = 2;
                case 2: return [2 /*return*/, tokens.value.access_token];
            }
        });
    }); };
    var syncToCalendar = function (sessions) { return __awaiter(_this, void 0, void 0, function () {
        var added, updated, accessToken, now, day, diff, weekStart_1, weekEnd_1, weekSessions, _i, weekSessions_1, session, config, eventId, event_1, updateResponse, _, eventWithoutId, createResponse, _a, e_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    isLoading.value = true;
                    error.value = null;
                    added = 0;
                    updated = 0;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 12, 13, 14]);
                    return [4 /*yield*/, getValidToken()];
                case 2:
                    accessToken = _b.sent();
                    if (!accessToken) {
                        throw new Error('Non connecté à Google');
                    }
                    now = new Date();
                    day = now.getDay();
                    diff = now.getDate() - day + (day === 0 ? -6 : 1);
                    weekStart_1 = new Date(now);
                    weekStart_1.setDate(diff);
                    weekStart_1.setHours(0, 0, 0, 0);
                    weekEnd_1 = new Date(weekStart_1);
                    weekEnd_1.setDate(weekStart_1.getDate() + 6);
                    weekEnd_1.setHours(23, 59, 59, 999);
                    weekSessions = sessions.filter(function (s) {
                        var sessionDate = new Date(s.date);
                        return sessionDate >= weekStart_1 && sessionDate <= weekEnd_1;
                    });
                    _i = 0, weekSessions_1 = weekSessions;
                    _b.label = 3;
                case 3:
                    if (!(_i < weekSessions_1.length)) return [3 /*break*/, 11];
                    session = weekSessions_1[_i];
                    config = session_1.SPORT_CONFIG[session.sport];
                    eventId = session.id.replace(/-/g, '').toLowerCase();
                    event_1 = {
                        id: eventId,
                        summary: "".concat(config.emoji, " ").concat(session.title),
                        description: "".concat(session.description || '', "\n\nDur\u00E9e: ").concat(session.duration_min, " min\nType: ").concat(session.type, "\n\n\uD83D\uDCF1 Cadence"),
                        start: {
                            date: session.date,
                        },
                        end: {
                            date: session.date,
                        },
                        colorId: session.sport === 'cycling' ? '7' : session.sport === 'running' ? '5' : '11',
                    };
                    _b.label = 4;
                case 4:
                    _b.trys.push([4, 9, , 10]);
                    return [4 /*yield*/, fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events/".concat(eventId), {
                            method: 'PUT',
                            headers: {
                                Authorization: "Bearer ".concat(accessToken),
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(event_1),
                        })];
                case 5:
                    updateResponse = _b.sent();
                    if (!updateResponse.ok) return [3 /*break*/, 6];
                    updated++;
                    return [3 /*break*/, 8];
                case 6:
                    if (!(updateResponse.status === 404)) return [3 /*break*/, 8];
                    _ = event_1.id, eventWithoutId = __rest(event_1, ["id"]);
                    return [4 /*yield*/, fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
                            method: 'POST',
                            headers: {
                                Authorization: "Bearer ".concat(accessToken),
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(eventWithoutId),
                        })];
                case 7:
                    createResponse = _b.sent();
                    if (createResponse.ok) {
                        added++;
                    }
                    _b.label = 8;
                case 8: return [3 /*break*/, 10];
                case 9:
                    _a = _b.sent();
                    return [3 /*break*/, 10];
                case 10:
                    _i++;
                    return [3 /*break*/, 3];
                case 11: return [2 /*return*/, { added: added, updated: updated }];
                case 12:
                    e_2 = _b.sent();
                    error.value = e_2 instanceof Error ? e_2.message : 'Erreur inconnue';
                    return [2 /*return*/, { added: 0, updated: 0 }];
                case 13:
                    isLoading.value = false;
                    return [7 /*endfinally*/];
                case 14: return [2 /*return*/];
            }
        });
    }); };
    var deleteAllEvents = function () { return __awaiter(_this, void 0, void 0, function () {
        var deleted, accessToken, searchResponse, data, events, _i, events_1, event_2, response, _a, _b;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    isLoading.value = true;
                    deleted = 0;
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 11, 12, 13]);
                    return [4 /*yield*/, getValidToken()];
                case 2:
                    accessToken = _d.sent();
                    if (!accessToken) {
                        throw new Error('Non connecté à Google');
                    }
                    return [4 /*yield*/, fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events?q=Cadence&maxResults=500", {
                            headers: {
                                Authorization: "Bearer ".concat(accessToken),
                            },
                        })];
                case 3:
                    searchResponse = _d.sent();
                    if (!searchResponse.ok) {
                        return [2 /*return*/, 0];
                    }
                    return [4 /*yield*/, searchResponse.json()];
                case 4:
                    data = _d.sent();
                    events = data.items || [];
                    _i = 0, events_1 = events;
                    _d.label = 5;
                case 5:
                    if (!(_i < events_1.length)) return [3 /*break*/, 10];
                    event_2 = events_1[_i];
                    if (!((_c = event_2.description) === null || _c === void 0 ? void 0 : _c.includes('📱 Cadence'))) return [3 /*break*/, 9];
                    _d.label = 6;
                case 6:
                    _d.trys.push([6, 8, , 9]);
                    return [4 /*yield*/, fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events/".concat(event_2.id), {
                            method: 'DELETE',
                            headers: {
                                Authorization: "Bearer ".concat(accessToken),
                            },
                        })];
                case 7:
                    response = _d.sent();
                    if (response.ok || response.status === 204) {
                        deleted++;
                    }
                    return [3 /*break*/, 9];
                case 8:
                    _a = _d.sent();
                    return [3 /*break*/, 9];
                case 9:
                    _i++;
                    return [3 /*break*/, 5];
                case 10: return [2 /*return*/, deleted];
                case 11:
                    _b = _d.sent();
                    return [2 /*return*/, 0];
                case 12:
                    isLoading.value = false;
                    return [7 /*endfinally*/];
                case 13: return [2 /*return*/];
            }
        });
    }); };
    var disconnect = function () {
        clearTokens();
    };
    return {
        isConnected: isConnected,
        isLoading: isLoading,
        error: error,
        authorize: authorize,
        handleCallback: handleCallback,
        syncToCalendar: syncToCalendar,
        deleteAllEvents: deleteAllEvents,
        disconnect: disconnect,
    };
}
