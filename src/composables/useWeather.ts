import { ref } from 'vue'

interface DayForecast {
  date: string
  tempMax: number
  tempMin: number
  weatherCode: number
  precipitation: number
  windSpeed: number
  windDirection: number
}

const forecast = ref<DayForecast[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const locationName = ref<string>('Paris')

// Weather codes to emoji mapping (WMO codes)
const weatherEmoji: Record<number, string> = {
  0: '☀️',   // Clear sky
  1: '🌤',   // Mainly clear
  2: '⛅',   // Partly cloudy
  3: '☁️',   // Overcast
  45: '🌁',  // Foggy
  48: '🌁',  // Depositing rime fog
  51: '🌧',  // Light drizzle
  53: '🌧',  // Moderate drizzle
  55: '🌧',  // Dense drizzle
  56: '🌧',  // Light freezing drizzle
  57: '🌧',  // Dense freezing drizzle
  61: '🌧',  // Slight rain
  63: '🌧',  // Moderate rain
  65: '💧',  // Heavy rain
  66: '🌧',  // Light freezing rain
  67: '💧',  // Heavy freezing rain
  71: '❄️',  // Slight snow
  73: '🌨',  // Moderate snow
  75: '🌨',  // Heavy snow
  77: '❄️',  // Snow grains
  80: '🌦',  // Slight rain showers
  81: '🌦',  // Moderate rain showers
  82: '⛈',  // Violent rain showers
  85: '🌨',  // Slight snow showers
  86: '🌨',  // Heavy snow showers
  95: '⛈',  // Thunderstorm
  96: '⛈',  // Thunderstorm with slight hail
  99: '⛈',  // Thunderstorm with heavy hail
}

export function useWeather() {
  const fetchForecast = async (latitude: number = 48.8566, longitude: number = 2.3522) => {
    isLoading.value = true
    error.value = null

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,wind_direction_10m_dominant&timezone=auto&forecast_days=14`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('Erreur API météo')
      }

      const data = await response.json()

      forecast.value = data.daily.time.map((date: string, i: number) => ({
        date,
        tempMax: Math.round(data.daily.temperature_2m_max[i]),
        tempMin: Math.round(data.daily.temperature_2m_min[i]),
        weatherCode: data.daily.weather_code[i],
        precipitation: data.daily.precipitation_sum[i],
        windSpeed: Math.round(data.daily.wind_speed_10m_max[i]),
        windDirection: data.daily.wind_direction_10m_dominant[i],
      }))

      return forecast.value
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erreur inconnue'
      return []
    } finally {
      isLoading.value = false
    }
  }

  const getWeatherForDate = (date: string): DayForecast | null => {
    return forecast.value.find(f => f.date === date) ?? null
  }

  const getWeatherEmoji = (code: number): string => {
    return weatherEmoji[code] ?? '❓'
  }

  // Convert degrees to arrow direction (arrow points where wind is going TO)
  const getWindArrow = (degrees: number): string => {
    // Wind direction is where it comes FROM, arrow shows where it goes TO
    const arrows = ['↓', '↙', '←', '↖', '↑', '↗', '→', '↘']
    const index = Math.round(degrees / 45) % 8
    return arrows[index] ?? '→'
  }

  const getWindLabel = (degrees: number): string => {
    const labels = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO']
    const index = Math.round(degrees / 45) % 8
    return labels[index] ?? 'N'
  }

  // Reverse geocoding to get city name
  const fetchLocationName = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      )
      const data = await response.json()
      locationName.value = data.address?.city || data.address?.town || data.address?.village || data.address?.municipality || 'Lieu inconnu'
    } catch {
      locationName.value = 'Lieu inconnu'
    }
  }

  // Try to get user location, fallback to Paris
  const fetchWithGeolocation = async () => {
    if ('geolocation' in navigator) {
      return new Promise<void>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords
            await Promise.all([
              fetchForecast(latitude, longitude),
              fetchLocationName(latitude, longitude)
            ])
            resolve()
          },
          async () => {
            // Fallback to Paris if denied
            locationName.value = 'Paris'
            await fetchForecast()
            resolve()
          },
          { timeout: 5000 }
        )
      })
    } else {
      locationName.value = 'Paris'
      await fetchForecast()
    }
  }

  return {
    forecast,
    isLoading,
    error,
    locationName,
    fetchForecast,
    fetchWithGeolocation,
    getWeatherForDate,
    getWeatherEmoji,
    getWindArrow,
    getWindLabel,
  }
}
