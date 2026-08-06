import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useGeolocation } from '../hooks/useGeolocation';
import { getLocalWeather } from '../lib/openweather';
import { CROP_CALENDAR_DATA } from '../lib/cropCalendarData';
import WeatherWidget from '../components/WeatherWidget';

export function WeatherCalendar() {
  const { t } = useTranslation();
  const geo = useGeolocation();

  const [weather, setWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState('All');

  useEffect(() => {
    async function fetchInitialWeather() {
      setLoadingWeather(true);
      const data = await getLocalWeather(geo.latitude, geo.longitude);
      setWeather(data);
      setLoadingWeather(false);
    }
    fetchInitialWeather();
  }, [geo.latitude, geo.longitude]);

  const handleCitySearch = async (cityName) => {
    setLoadingWeather(true);
    const data = await getLocalWeather(28.6139, 77.2090, cityName);
    setWeather(data);
    setLoadingWeather(false);
  };

  const filteredCrops = CROP_CALENDAR_DATA.filter((cropItem) => {
    if (selectedSeason === 'All') return true;
    return cropItem.season.toLowerCase().includes(selectedSeason.toLowerCase());
  });

  return (
    <div className="pt-24 pb-16 min-h-screen bg-background text-on-surface">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop space-y-10">
        {/* Title Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 bg-secondary-container/60 text-on-secondary-container px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[18px]">cloud_sync</span>
            Live Micro-Climate & Seasonal Calendar
          </div>
          <h1 className="font-headline-md text-3xl md:text-5xl font-bold text-primary">
            {t('pages.weatherCalendar.title')}
          </h1>
          <p className="text-base md:text-lg text-on-surface-variant leading-relaxed">
            {t('pages.weatherCalendar.subtitle')}
          </p>
        </div>

        {/* Live Weather Analytics Widget */}
        {loadingWeather ? (
          <div className="p-12 bg-surface border border-outline-variant/30 rounded-2xl text-center text-secondary font-bold flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[28px] animate-spin">sync</span>
            <span>Fetching live agricultural weather forecast & AI advisory...</span>
          </div>
        ) : (
          <WeatherWidget
            weather={weather}
            onSearchCity={handleCitySearch}
            searching={loadingWeather}
          />
        )}

        {/* Seasonal Crop Advisory Calendar Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-outline-variant/20 pb-4">
            <div>
              <h2 className="font-headline-sm text-2xl md:text-3xl font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-[32px] text-secondary">calendar_month</span>
                Seasonal Crop Advisory Calendar
              </h2>
              <p className="text-sm text-on-surface-variant">Sowing, irrigation, and harvesting timelines for major Indian crops</p>
            </div>

            {/* Season Filters */}
            <div className="flex items-center gap-2 bg-surface-container p-1 rounded-xl border border-outline-variant/30 text-xs font-bold">
              {['All', 'Kharif', 'Rabi', 'Zaid'].map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSeason(s)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    selectedSeason === s
                      ? 'bg-primary-container text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  {s === 'All' ? 'All Seasons' : `${s} Crops`}
                </button>
              ))}
            </div>
          </div>

          {/* Crop Calendar Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCrops.map((crop) => (
              <div
                key={crop.id}
                className="bg-surface border border-outline-variant/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-secondary-container/40 text-on-secondary-container text-xs font-bold rounded-full">
                      {crop.season}
                    </span>
                    <span className="text-xs text-on-surface-variant font-semibold">
                      Ideal: {crop.idealTemp}
                    </span>
                  </div>

                  <h3 className="font-headline-sm text-xl font-bold text-primary">
                    {crop.crop}
                  </h3>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2.5 bg-surface-container-low rounded-xl border border-outline-variant/20">
                      <span className="text-on-surface-variant block font-medium">Sowing Window</span>
                      <span className="font-bold text-primary">{crop.sowingMonths}</span>
                    </div>

                    <div className="p-2.5 bg-surface-container-low rounded-xl border border-outline-variant/20">
                      <span className="text-on-surface-variant block font-medium">Harvest Window</span>
                      <span className="font-bold text-terracotta">{crop.harvestMonths}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-surface-container-lowest border border-outline-variant/30 rounded-xl space-y-1">
                    <span className="text-xs font-bold text-secondary uppercase tracking-wider block">
                      Agronomic Advisory:
                    </span>
                    <p className="text-xs text-on-surface leading-relaxed">
                      {crop.keyAdvisory}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between text-xs text-on-surface-variant">
                  <span className="flex items-center gap-1 font-semibold">
                    <span className="material-symbols-outlined text-[16px] text-primary">water_drop</span>
                    {crop.waterRequirement}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeatherCalendar;
