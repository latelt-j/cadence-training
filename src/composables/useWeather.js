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
exports.useWeather = useWeather;
var vue_1 = require("vue");
var forecast = (0, vue_1.ref)([]);
var isLoading = (0, vue_1.ref)(false);
var error = (0, vue_1.ref)(null);
var locationName = (0, vue_1.ref)('Paris');
// Weather codes to emoji mapping (WMO codes)
var weatherEmoji = {
    0: '☀️', // Clear sky
    1: '🌤', // Mainly clear
    2: '⛅', // Partly cloudy
    3: '☁️', // Overcast
    45: '🌁', // Foggy
    48: '🌁', // Depositing rime fog
    51: '🌧', // Light drizzle
    53: '🌧', // Moderate drizzle
    55: '🌧', // Dense drizzle
    56: '🌧', // Light freezing drizzle
    57: '🌧', // Dense freezing drizzle
    61: '🌧', // Slight rain
    63: '🌧', // Moderate rain
    65: '💧', // Heavy rain
    66: '🌧', // Light freezing rain
    67: '💧', // Heavy freezing rain
    71: '❄️', // Slight snow
    73: '🌨', // Moderate snow
    75: '🌨', // Heavy snow
    77: '❄️', // Snow grains
    80: '🌦', // Slight rain showers
    81: '🌦', // Moderate rain showers
    82: '⛈', // Violent rain showers
    85: '🌨', // Slight snow showers
    86: '🌨', // Heavy snow showers
    95: '⛈', // Thunderstorm
    96: '⛈', // Thunderstorm with slight hail
    99: '⛈', // Thunderstorm with heavy hail
};
function useWeather() {
    var _this = this;
    var fetchForecast = function () {
        var args_1 = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args_1[_i] = arguments[_i];
        }
        return __awaiter(_this, __spreadArray([], args_1, true), void 0, function (latitude, longitude) {
            var url, response, data_1, e_1;
            if (latitude === void 0) { latitude = 48.8566; }
            if (longitude === void 0) { longitude = 2.3522; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        isLoading.value = true;
                        error.value = null;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, 5, 6]);
                        url = "https://api.open-meteo.com/v1/forecast?latitude=".concat(latitude, "&longitude=").concat(longitude, "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,wind_direction_10m_dominant&timezone=auto&forecast_days=14");
                        return [4 /*yield*/, fetch(url)];
                    case 2:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error('Erreur API météo');
                        }
                        return [4 /*yield*/, response.json()];
                    case 3:
                        data_1 = _a.sent();
                        forecast.value = data_1.daily.time.map(function (date, i) { return ({
                            date: date,
                            tempMax: Math.round(data_1.daily.temperature_2m_max[i]),
                            tempMin: Math.round(data_1.daily.temperature_2m_min[i]),
                            weatherCode: data_1.daily.weather_code[i],
                            precipitation: data_1.daily.precipitation_sum[i],
                            windSpeed: Math.round(data_1.daily.wind_speed_10m_max[i]),
                            windDirection: data_1.daily.wind_direction_10m_dominant[i],
                        }); });
                        return [2 /*return*/, forecast.value];
                    case 4:
                        e_1 = _a.sent();
                        error.value = e_1 instanceof Error ? e_1.message : 'Erreur inconnue';
                        return [2 /*return*/, []];
                    case 5:
                        isLoading.value = false;
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    var getWeatherForDate = function (date) {
        var _a;
        return (_a = forecast.value.find(function (f) { return f.date === date; })) !== null && _a !== void 0 ? _a : null;
    };
    var getWeatherEmoji = function (code) {
        var _a;
        return (_a = weatherEmoji[code]) !== null && _a !== void 0 ? _a : '❓';
    };
    // Convert degrees to arrow direction (arrow points where wind is going TO)
    var getWindArrow = function (degrees) {
        var _a;
        // Wind direction is where it comes FROM, arrow shows where it goes TO
        var arrows = ['↓', '↙', '←', '↖', '↑', '↗', '→', '↘'];
        var index = Math.round(degrees / 45) % 8;
        return (_a = arrows[index]) !== null && _a !== void 0 ? _a : '→';
    };
    var getWindLabel = function (degrees) {
        var _a;
        var labels = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
        var index = Math.round(degrees / 45) % 8;
        return (_a = labels[index]) !== null && _a !== void 0 ? _a : 'N';
    };
    // Reverse geocoding to get city name
    var fetchLocationName = function (lat, lon) { return __awaiter(_this, void 0, void 0, function () {
        var response, data, _a;
        var _b, _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    _f.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch("https://nominatim.openstreetmap.org/reverse?lat=".concat(lat, "&lon=").concat(lon, "&format=json"))];
                case 1:
                    response = _f.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _f.sent();
                    locationName.value = ((_b = data.address) === null || _b === void 0 ? void 0 : _b.city) || ((_c = data.address) === null || _c === void 0 ? void 0 : _c.town) || ((_d = data.address) === null || _d === void 0 ? void 0 : _d.village) || ((_e = data.address) === null || _e === void 0 ? void 0 : _e.municipality) || 'Lieu inconnu';
                    return [3 /*break*/, 4];
                case 3:
                    _a = _f.sent();
                    locationName.value = 'Lieu inconnu';
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Try to get user location, fallback to Paris
    var fetchWithGeolocation = function () { return __awaiter(_this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!('geolocation' in navigator)) return [3 /*break*/, 1];
                    return [2 /*return*/, new Promise(function (resolve) {
                            navigator.geolocation.getCurrentPosition(function (position) { return __awaiter(_this, void 0, void 0, function () {
                                var _a, latitude, longitude;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            _a = position.coords, latitude = _a.latitude, longitude = _a.longitude;
                                            return [4 /*yield*/, Promise.all([
                                                    fetchForecast(latitude, longitude),
                                                    fetchLocationName(latitude, longitude)
                                                ])];
                                        case 1:
                                            _b.sent();
                                            resolve();
                                            return [2 /*return*/];
                                    }
                                });
                            }); }, function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            // Fallback to Paris if denied
                                            locationName.value = 'Paris';
                                            return [4 /*yield*/, fetchForecast()];
                                        case 1:
                                            _a.sent();
                                            resolve();
                                            return [2 /*return*/];
                                    }
                                });
                            }); }, { timeout: 5000 });
                        })];
                case 1:
                    locationName.value = 'Paris';
                    return [4 /*yield*/, fetchForecast()];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    }); };
    return {
        forecast: forecast,
        isLoading: isLoading,
        error: error,
        locationName: locationName,
        fetchForecast: fetchForecast,
        fetchWithGeolocation: fetchWithGeolocation,
        getWeatherForDate: getWeatherForDate,
        getWeatherEmoji: getWeatherEmoji,
        getWindArrow: getWindArrow,
        getWindLabel: getWindLabel,
    };
}
