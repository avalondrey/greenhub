import { useState, useEffect, useCallback } from 'react';
import { getMoonPhase } from '../utils/moon.js';

const WEATHER_URL = (lat, lon) =>
  `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,is_day,precipitation,rain,showers,snowfall&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max&timezone=Europe/Paris`;

function analyzeWeatherRaw(data) {
  const alerts = [];
  const current = data.current;
  const daily = data.daily;

  if (!current) return alerts;

  if (current.temperature_2m > 30) {
    alerts.push({ type: 'warning', icon: '🌡️', msg: `Canicule! ${current.temperature_2m}°C - Arrosez ce soir` });
  } else if (current.temperature_2m < 2) {
    alerts.push({ type: 'error', icon: '❄️', msg: `Gel! ${current.temperature_2m}°C - Protection nécessaire` });
  }

  if (daily?.precipitation_sum?.[0] > 20) {
    alerts.push({ type: 'info', icon: '🌧️', msg: `Fortes pluies prévues (${daily.precipitation_sum[0]}mm) - Ne pas arroser` });
  } else if (current.precipitation > 0) {
    alerts.push({ type: 'info', icon: '💧', msg: 'Il pleut - Pause arrosage' });
  } else if (current.relative_humidity_2m < 40 && current.temperature_2m > 25) {
    alerts.push({ type: 'warning', icon: '💧', msg: 'Air sec et chaud - Arrosage conseillé' });
  }

  if (daily?.windspeed_10m_max?.[0] > 50) {
    alerts.push({ type: 'warning', icon: '💨', msg: `Vent fort (${daily.windspeed_10m_max[0]}km/h) - Tuteures à vérifier` });
  }

  const moon = getMoonPhase();
  if (moon.sow) {
    const typePlants =
      moon.sow === 'racines' ? 'carottes, radis, betteraves' :
      moon.sow === 'feuilles' ? 'salades, épinards, choux' :
      moon.sow === 'fruits' ? 'tomates, courges, poivrons' :
      'haricots, pois';
    alerts.push({ type: 'success', icon: moon.icon, msg: `${moon.name} - Parfait pour semer : ${typePlants}` });
  }

  return alerts;
}

/**
 * Fetch weather from Open-Meteo every 30 minutes.
 * @returns {{ weather, weatherAlerts, analyzeWeather }}
 */
export function useWeather() {
  const [weather, setWeather] = useState(null);
  const [weatherAlerts, setWeatherAlerts] = useState([]);

  const analyzeWeather = useCallback((data) => {
    const alerts = analyzeWeatherRaw(data);
    setWeatherAlerts(alerts);
  }, []);

  useEffect(() => {
    const lat = 48.8566;
    const lon = 2.3522;

    const fetchWeather = () => {
      fetch(WEATHER_URL(lat, lon))
        .then(r => r.json())
        .then(data => {
          setWeather(data);
          analyzeWeather(data);
        })
        .catch(() => {});
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [analyzeWeather]);

  return { weather, weatherAlerts, analyzeWeather };
}

export { analyzeWeatherRaw as analyzeWeather };
