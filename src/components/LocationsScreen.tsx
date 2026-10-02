import React from 'react';
import { MapPin, Navigation, ShieldCheck, Users } from 'lucide-react';
import { LocationSite, Language } from '../types';
import { translations } from '../i18n/translations';

interface LocationsScreenProps {
  locations: LocationSite[];
  lang?: Language;
}

export const LocationsScreen: React.FC<LocationsScreenProps> = ({ locations, lang = 'en' }) => {
  const t = translations[lang];

  return (
    <div className="flex flex-col min-h-full px-4 sm:px-8 py-5 pb-24 max-w-6xl mx-auto w-full">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t.locationsTitle}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t.locationsSub}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {locations.map(loc => (
          <div
            key={loc.id}
            className="p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start gap-3.5 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {loc.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {loc.address}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <Users className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="font-medium">{loc.activeCount} {t.workingHereNow}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 justify-end">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="font-medium font-mono">{t.geofence}: {loc.radiusMeters}{t.meters}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
