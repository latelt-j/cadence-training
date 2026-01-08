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
exports.useStrava = useStrava;
var vue_1 = require("vue");
var cyclingMetrics_1 = require("../utils/cyclingMetrics");
var STRAVA_CLIENT_ID = import.meta.env.VITE_STRAVA_CLIENT_ID || '118625';
var REDIRECT_URI = window.location.origin;
var STORAGE_KEY = 'strava-tokens';
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
function useStrava() {
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
        var scope = 'activity:read_all,activity:write';
        var authUrl = "https://www.strava.com/oauth/authorize?client_id=".concat(STRAVA_CLIENT_ID, "&redirect_uri=").concat(REDIRECT_URI, "&response_type=code&scope=").concat(scope);
        window.location.href = authUrl;
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
                    return [4 /*yield*/, fetch("".concat(SUPABASE_URL, "/functions/v1/strava-auth"), {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': "Bearer ".concat(SUPABASE_ANON_KEY),
                            },
                            body: JSON.stringify({
                                code: code,
                                redirect_uri: REDIRECT_URI,
                            }),
                        })];
                case 2:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 3:
                    err = _a.sent();
                    throw new Error(err.error || 'Échec de l\'authentification Strava');
                case 4: return [4 /*yield*/, response.json()];
                case 5:
                    data = _a.sent();
                    saveTokens({
                        access_token: data.access_token,
                        refresh_token: data.refresh_token,
                        expires_at: data.expires_at,
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
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!tokens.value)
                        return [2 /*return*/, false];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch("".concat(SUPABASE_URL, "/functions/v1/strava-refresh"), {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': "Bearer ".concat(SUPABASE_ANON_KEY),
                            },
                            body: JSON.stringify({
                                refresh_token: tokens.value.refresh_token,
                            }),
                        })];
                case 2:
                    response = _b.sent();
                    if (!response.ok) {
                        clearTokens();
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _b.sent();
                    saveTokens({
                        access_token: data.access_token,
                        refresh_token: data.refresh_token,
                        expires_at: data.expires_at,
                    });
                    return [2 /*return*/, true];
                case 4:
                    _a = _b.sent();
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
                        return [2 /*return*/, null
                            // Check if token is expired (with 60s buffer)
                        ];
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
    var fetchActivities = function () {
        var args_1 = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args_1[_i] = arguments[_i];
        }
        return __awaiter(_this, __spreadArray([], args_1, true), void 0, function (days) {
            var accessToken, after, response, e_2;
            if (days === void 0) { days = 7; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        isLoading.value = true;
                        error.value = null;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, 6, 7]);
                        return [4 /*yield*/, getValidToken()];
                    case 2:
                        accessToken = _a.sent();
                        if (!accessToken) {
                            throw new Error('Non connecté à Strava');
                        }
                        after = Math.floor(Date.now() / 1000) - days * 24 * 60 * 60;
                        return [4 /*yield*/, fetch("https://www.strava.com/api/v3/athlete/activities?after=".concat(after, "&per_page=100"), {
                                headers: { Authorization: "Bearer ".concat(accessToken) },
                            })];
                    case 3:
                        response = _a.sent();
                        if (!response.ok) {
                            if (response.status === 401) {
                                clearTokens();
                                throw new Error('Session expirée, reconnectez-vous');
                            }
                            throw new Error('Erreur lors de la récupération des activités');
                        }
                        return [4 /*yield*/, response.json()];
                    case 4: return [2 /*return*/, _a.sent()];
                    case 5:
                        e_2 = _a.sent();
                        error.value = e_2 instanceof Error ? e_2.message : 'Erreur inconnue';
                        return [2 /*return*/, []];
                    case 6:
                        isLoading.value = false;
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    var fetchActivityDetail = function (activityId) { return __awaiter(_this, void 0, void 0, function () {
        var accessToken, response, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, getValidToken()];
                case 1:
                    accessToken = _b.sent();
                    if (!accessToken)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, fetch("https://www.strava.com/api/v3/activities/".concat(activityId), {
                            headers: { Authorization: "Bearer ".concat(accessToken) },
                        })];
                case 2:
                    response = _b.sent();
                    if (!response.ok)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, response.json()];
                case 3: return [2 /*return*/, _b.sent()];
                case 4:
                    _a = _b.sent();
                    return [2 /*return*/, null];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Fetch details for specific activities (or all if not specified)
    var fetchActivitiesWithDetails = function () {
        var args_1 = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args_1[_i] = arguments[_i];
        }
        return __awaiter(_this, __spreadArray([], args_1, true), void 0, function (days, activitiesToFetch) {
            var activities, _a, detailedActivities, _b, activities_1, activity, detail, e_3;
            if (days === void 0) { days = 7; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        isLoading.value = true;
                        error.value = null;
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 9, 10, 11]);
                        if (!(activitiesToFetch !== null && activitiesToFetch !== void 0)) return [3 /*break*/, 2];
                        _a = activitiesToFetch;
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, fetchActivities(days)
                        // Fetch details for each activity (with laps)
                    ];
                    case 3:
                        _a = _c.sent();
                        _c.label = 4;
                    case 4:
                        activities = _a;
                        detailedActivities = [];
                        _b = 0, activities_1 = activities;
                        _c.label = 5;
                    case 5:
                        if (!(_b < activities_1.length)) return [3 /*break*/, 8];
                        activity = activities_1[_b];
                        return [4 /*yield*/, fetchActivityDetail(activity.id)];
                    case 6:
                        detail = _c.sent();
                        if (detail) {
                            detailedActivities.push(detail);
                        }
                        else {
                            // Fallback to basic activity if detail fetch fails
                            detailedActivities.push(activity);
                        }
                        _c.label = 7;
                    case 7:
                        _b++;
                        return [3 /*break*/, 5];
                    case 8: return [2 /*return*/, detailedActivities];
                    case 9:
                        e_3 = _c.sent();
                        error.value = e_3 instanceof Error ? e_3.message : 'Erreur inconnue';
                        return [2 /*return*/, []];
                    case 10:
                        isLoading.value = false;
                        return [7 /*endfinally*/];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    // Fetch activity streams (second-by-second data)
    var fetchActivityStreams = function (activityId_1) {
        var args_1 = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args_1[_i - 1] = arguments[_i];
        }
        return __awaiter(_this, __spreadArray([activityId_1], args_1, true), void 0, function (activityId, keys) {
            var accessToken, keysParam, response, _a;
            if (keys === void 0) { keys = ['heartrate', 'watts', 'velocity_smooth', 'altitude', 'grade_smooth', 'time', 'distance']; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, getValidToken()];
                    case 1:
                        accessToken = _b.sent();
                        if (!accessToken)
                            return [2 /*return*/, null];
                        keysParam = keys.join(',');
                        return [4 /*yield*/, fetch("https://www.strava.com/api/v3/activities/".concat(activityId, "/streams?keys=").concat(keysParam, "&key_by_type=true"), {
                                headers: { Authorization: "Bearer ".concat(accessToken) },
                            })];
                    case 2:
                        response = _b.sent();
                        if (!response.ok)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, response.json()];
                    case 3: return [2 /*return*/, _b.sent()];
                    case 4:
                        _a = _b.sent();
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // Fetch activities with detailed data AND calculated metrics from streams
    // Only fetches streams for cycling activities with power data
    var fetchActivitiesWithMetrics = function () {
        var args_1 = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args_1[_i] = arguments[_i];
        }
        return __awaiter(_this, __spreadArray([], args_1, true), void 0, function (days, activitiesToFetch, athleteProfile) {
            var detailedActivities, cyclingTypes_1, enrichedActivities, e_4;
            var _this = this;
            if (days === void 0) { days = 7; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        isLoading.value = true;
                        error.value = null;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, 5, 6]);
                        return [4 /*yield*/, fetchActivitiesWithDetails(days, activitiesToFetch)];
                    case 2:
                        detailedActivities = _a.sent();
                        cyclingTypes_1 = ['Ride', 'VirtualRide', 'MountainBikeRide', 'GravelRide', 'EBikeRide'] // includes MTB for metrics
                        ;
                        return [4 /*yield*/, Promise.all(detailedActivities.map(function (activity) { return __awaiter(_this, void 0, void 0, function () {
                                var type, isCycling, streams, streamData, metrics;
                                var _a, _b, _c, _d, _e, _f, _g;
                                return __generator(this, function (_h) {
                                    switch (_h.label) {
                                        case 0:
                                            type = activity.sport_type || activity.type;
                                            isCycling = cyclingTypes_1.includes(type);
                                            // Fetch streams for all cycling activities (not just those with NP)
                                            if (!isCycling) {
                                                return [2 /*return*/, activity];
                                            }
                                            return [4 /*yield*/, fetchActivityStreams(activity.id)];
                                        case 1:
                                            streams = _h.sent();
                                            if (streams) {
                                                streamData = {
                                                    heartrate: (_a = streams.heartrate) === null || _a === void 0 ? void 0 : _a.data,
                                                    watts: (_b = streams.watts) === null || _b === void 0 ? void 0 : _b.data,
                                                    velocity_smooth: (_c = streams.velocity_smooth) === null || _c === void 0 ? void 0 : _c.data,
                                                    altitude: (_d = streams.altitude) === null || _d === void 0 ? void 0 : _d.data,
                                                    grade_smooth: (_e = streams.grade_smooth) === null || _e === void 0 ? void 0 : _e.data,
                                                    time: (_f = streams.time) === null || _f === void 0 ? void 0 : _f.data,
                                                    distance: (_g = streams.distance) === null || _g === void 0 ? void 0 : _g.data,
                                                };
                                                metrics = (0, cyclingMetrics_1.calculateAllMetrics)(streamData, activity.weighted_average_watts, activity.average_watts, athleteProfile === null || athleteProfile === void 0 ? void 0 : athleteProfile.ftp);
                                                return [2 /*return*/, __assign(__assign({}, activity), { intensity_factor: metrics.intensity_factor, variability_index: metrics.variability_index, aerobic_decoupling: metrics.aerobic_decoupling, average_vam: metrics.average_vam })];
                                            }
                                            return [2 /*return*/, activity];
                                    }
                                });
                            }); }))];
                    case 3:
                        enrichedActivities = _a.sent();
                        return [2 /*return*/, enrichedActivities];
                    case 4:
                        e_4 = _a.sent();
                        error.value = e_4 instanceof Error ? e_4.message : 'Erreur inconnue';
                        return [2 /*return*/, []];
                    case 5:
                        isLoading.value = false;
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    var mapStravaToSport = function (activity) {
        var type = activity.sport_type || activity.type;
        console.log('[Strava] Activity:', activity.name, '| Type:', type, '| Sport type:', activity.sport_type, '| Type:', activity.type);
        var cyclingTypes = ['Ride', 'VirtualRide', 'GravelRide', 'EBikeRide'];
        var mtbTypes = ['MountainBikeRide'];
        var runningTypes = ['Run', 'TrailRun', 'VirtualRun', 'Treadmill', 'Soccer', 'Football'];
        var strengthTypes = ['WeightTraining', 'Workout', 'Crossfit', 'Yoga', 'HIIT'];
        var hikingTypes = ['Hike', 'Walk', 'RockClimbing'];
        if (cyclingTypes.includes(type))
            return 'cycling';
        if (mtbTypes.includes(type))
            return 'mtb';
        if (runningTypes.includes(type))
            return 'running';
        if (strengthTypes.includes(type))
            return 'strength';
        if (hikingTypes.includes(type))
            return 'hiking';
        console.log('[Strava] Unknown type:', type, '- skipping activity');
        return null;
    };
    var convertToSessions = function (activities) {
        return activities
            .map(function (activity) {
            var _a;
            var sport = mapStravaToSport(activity);
            if (!sport)
                return null;
            var durationMin = Math.round(activity.moving_time / 60);
            var distanceKm = Math.round(activity.distance / 1000 * 10) / 10;
            var date = activity.start_date_local.split('T')[0];
            // Convert Strava laps to our format
            var laps = ((_a = activity.laps) === null || _a === void 0 ? void 0 : _a.map(function (lap) { return ({
                name: lap.name,
                elapsed_time: lap.elapsed_time,
                moving_time: lap.moving_time,
                distance: lap.distance,
                average_speed: lap.average_speed,
                max_speed: lap.max_speed,
                average_heartrate: lap.average_heartrate,
                max_heartrate: lap.max_heartrate,
                average_watts: lap.average_watts,
                average_cadence: lap.average_cadence,
                total_elevation_gain: lap.total_elevation_gain,
            }); })) || [];
            var session = {
                sport: sport,
                type: 'strava',
                title: activity.name,
                duration_min: durationMin,
                description: "".concat(distanceKm, " km").concat(activity.total_elevation_gain ? " \u2022 ".concat(Math.round(activity.total_elevation_gain), "m D+") : ''),
                structure: [],
                actual_km: distanceKm,
                actual_elevation: activity.total_elevation_gain ? Math.round(activity.total_elevation_gain) : 0,
                strava_id: activity.id,
                laps: laps.length > 0 ? laps : undefined,
                average_heartrate: activity.average_heartrate,
                max_heartrate: activity.max_heartrate,
                average_watts: activity.average_watts,
                max_watts: activity.max_watts,
                average_cadence: activity.average_cadence,
                // Cycling metrics from Strava API
                normalized_power: activity.weighted_average_watts,
                device_watts: activity.device_watts,
                suffer_score: activity.suffer_score,
                kilojoules: activity.kilojoules,
                calories: activity.calories,
                // Calculated metrics from streams
                intensity_factor: activity.intensity_factor,
                variability_index: activity.variability_index,
                aerobic_decoupling: activity.aerobic_decoupling,
                average_vam: activity.average_vam,
            };
            return { session: session, date: date };
        })
            .filter(function (item) { return item !== null; });
    };
    var updateActivity = function (activityId, updates) { return __awaiter(_this, void 0, void 0, function () {
        var accessToken, response, e_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, getValidToken()];
                case 1:
                    accessToken = _a.sent();
                    if (!accessToken) {
                        throw new Error('Non connecté à Strava');
                    }
                    return [4 /*yield*/, fetch("https://www.strava.com/api/v3/activities/".concat(activityId), {
                            method: 'PUT',
                            headers: {
                                Authorization: "Bearer ".concat(accessToken),
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(updates),
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) {
                        if (response.status === 401) {
                            clearTokens();
                            throw new Error('Session expirée, reconnectez-vous');
                        }
                        throw new Error('Erreur lors de la mise à jour sur Strava');
                    }
                    return [2 /*return*/, true];
                case 3:
                    e_5 = _a.sent();
                    error.value = e_5 instanceof Error ? e_5.message : 'Erreur inconnue';
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var disconnect = function () {
        clearTokens();
    };
    // Re-sync a single activity with full metrics (for existing activities)
    var resyncActivity = function (stravaId, athleteProfile) { return __awaiter(_this, void 0, void 0, function () {
        var detail, cyclingTypes, type, isCycling, enrichedActivity, streams, streamData, metrics, converted, e_6;
        var _a, _b, _c, _d, _e, _f, _g, _h;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0:
                    isLoading.value = true;
                    error.value = null;
                    _j.label = 1;
                case 1:
                    _j.trys.push([1, 5, 6, 7]);
                    return [4 /*yield*/, fetchActivityDetail(stravaId)];
                case 2:
                    detail = _j.sent();
                    if (!detail) {
                        error.value = 'Activité introuvable sur Strava';
                        return [2 /*return*/, null];
                    }
                    cyclingTypes = ['Ride', 'VirtualRide', 'MountainBikeRide', 'GravelRide', 'EBikeRide'];
                    type = detail.sport_type || detail.type;
                    isCycling = cyclingTypes.includes(type);
                    enrichedActivity = detail;
                    if (!isCycling) return [3 /*break*/, 4];
                    return [4 /*yield*/, fetchActivityStreams(stravaId)];
                case 3:
                    streams = _j.sent();
                    if (streams) {
                        streamData = {
                            heartrate: (_a = streams.heartrate) === null || _a === void 0 ? void 0 : _a.data,
                            watts: (_b = streams.watts) === null || _b === void 0 ? void 0 : _b.data,
                            velocity_smooth: (_c = streams.velocity_smooth) === null || _c === void 0 ? void 0 : _c.data,
                            altitude: (_d = streams.altitude) === null || _d === void 0 ? void 0 : _d.data,
                            grade_smooth: (_e = streams.grade_smooth) === null || _e === void 0 ? void 0 : _e.data,
                            time: (_f = streams.time) === null || _f === void 0 ? void 0 : _f.data,
                            distance: (_g = streams.distance) === null || _g === void 0 ? void 0 : _g.data,
                        };
                        metrics = (0, cyclingMetrics_1.calculateAllMetrics)(streamData, detail.weighted_average_watts, detail.average_watts, athleteProfile === null || athleteProfile === void 0 ? void 0 : athleteProfile.ftp);
                        enrichedActivity = __assign(__assign({}, detail), { intensity_factor: metrics.intensity_factor, variability_index: metrics.variability_index, aerobic_decoupling: metrics.aerobic_decoupling, average_vam: metrics.average_vam });
                    }
                    _j.label = 4;
                case 4:
                    converted = convertToSessions([enrichedActivity]);
                    return [2 /*return*/, ((_h = converted[0]) === null || _h === void 0 ? void 0 : _h.session) || null];
                case 5:
                    e_6 = _j.sent();
                    error.value = e_6 instanceof Error ? e_6.message : 'Erreur inconnue';
                    return [2 /*return*/, null];
                case 6:
                    isLoading.value = false;
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    return {
        isConnected: isConnected,
        isLoading: isLoading,
        error: error,
        authorize: authorize,
        handleCallback: handleCallback,
        fetchActivities: fetchActivities,
        fetchActivityDetail: fetchActivityDetail,
        fetchActivitiesWithDetails: fetchActivitiesWithDetails,
        fetchActivitiesWithMetrics: fetchActivitiesWithMetrics,
        convertToSessions: convertToSessions,
        updateActivity: updateActivity,
        resyncActivity: resyncActivity,
        disconnect: disconnect,
    };
}
