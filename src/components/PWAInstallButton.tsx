import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Language } from '../types';

interface PWAInstallButtonProps {
  lang?: Language;
  variant?: 'compact' | 'full';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  lang = 'en',
  variant = 'compact'
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setJustInstalled(true);
        setTimeout(() => setJustInstalled(false), 3000);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // If browser hasn't fired beforeinstallprompt yet, show guidance
      setShowIOSGuide(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        title={lang === 'km' ? 'ដំឡើងកម្មវិធី PWA' : 'Install PWA App'}
        className={`flex items-center gap-1.5 rounded-xl font-bold transition-all active:scale-95 ${
          variant === 'full'
            ? 'w-full justify-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs shadow-md shadow-blue-500/25'
            : 'px-3 py-1.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-xs'
        }`}
      >
        {justInstalled ? (
          <>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>{lang === 'km' ? 'បានដំឡើងជោគជ័យ' : 'Installed!'}</span>
          </>
        ) : (
          <>
            <Download className="w-3.5 h-3.5 animate-bounce" />
            <span>{lang === 'km' ? 'ដំឡើង App' : 'Install App'}</span>
          </>
        )}
      </button>

      {/* Guided Installation Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-sm">
                  ML
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {lang === 'km' ? 'ដំឡើងកម្មវិធីលើទូរស័ព្ទ / កុំព្យូទ័រ' : 'Install App on Device'}
                  </h3>
                  <p className="text-[11px] text-slate-400">Marketing Landmark PWA</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50">
                <p className="font-bold text-blue-900 dark:text-blue-300 mb-1 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                  <span>{lang === 'km' ? 'សម្រាប់ទូរស័ព្ទ iPhone / iPad (Safari)' : 'For iPhone / iPad (Safari)'}:</span>
                </p>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-400 pl-1">
                  <li>{lang === 'km' ? 'ចុចប៊ូតុង Share (ចែករំលែក) ក្នុង Safari' : 'Tap the Share button in Safari toolbar'}</li>
                  <li>{lang === 'km' ? 'រំកិលចុះក្រោម រួចចុច "Add to Home Screen"' : 'Scroll down and tap "Add to Home Screen"'}</li>
                  <li>{lang === 'km' ? 'ចុច "Add" ដើម្បីបញ្ចប់ការដំឡើង' : 'Tap "Add" in top-right to finish'}</li>
                </ol>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">
                  {lang === 'km' ? 'សម្រាប់ Chrome, Edge ឬ Android' : 'For Chrome, Edge or Android'}:
                </p>
                <p className="text-slate-500 dark:text-slate-400">
                  {lang === 'km'
                    ? 'ចុចសញ្ញា ︙ នៅខាងស្តាំលើជ្រុងកម្មវិធីរុករក រួចជ្រើសរើស "Install app" ឬ "Add to Home screen"។'
                    : 'Tap the 3 dots (⋮) menu in your browser and choose "Install app" or "Add to Home screen".'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/25 active:scale-95 transition-all"
            >
              {lang === 'km' ? 'យល់ព្រម' : 'Got it'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
