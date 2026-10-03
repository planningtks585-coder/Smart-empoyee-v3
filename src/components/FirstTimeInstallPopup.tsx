import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, CheckCircle2, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Language } from '../types';

interface FirstTimeInstallPopupProps {
  lang?: Language;
}

export const FirstTimeInstallPopup: React.FC<FirstTimeInstallPopupProps> = ({
  lang = 'en'
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [isOpen, setIsOpen] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  useEffect(() => {
    // If already installed or already dismissed, do not show
    if (isInstalled) return;

    const alreadyDismissed = localStorage.getItem('pwa_install_prompt_dismissed');
    if (alreadyDismissed === 'true') return;

    // Show popup after a smooth 1.8 second delay on first visit
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1800);

    return () => clearTimeout(timer);
  }, [isInstalled]);

  const handleDismiss = () => {
    localStorage.setItem('pwa_install_prompt_dismissed', 'true');
    setIsOpen(false);
    setShowIOSGuide(false);
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setJustInstalled(true);
        localStorage.setItem('pwa_install_prompt_dismissed', 'true');
        setTimeout(() => {
          setIsOpen(false);
          setJustInstalled(false);
        }, 2200);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      setShowIOSGuide(true);
    }
  };

  if (!isOpen || isInstalled) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-300">
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-100 dark:border-slate-800 relative text-slate-900 dark:text-white">
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Dismiss install prompt"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Title */}
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 mb-3 relative">
            <span className="font-extrabold text-xl tracking-tight">ML</span>
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-xs">
              <Sparkles className="w-3 h-3" />
            </div>
          </div>

          <h3 className="text-base font-extrabold tracking-tight">
            {lang === 'km' ? 'ដំឡើងកម្មវិធី Marketing Landmark' : 'Install Marketing Landmark'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[260px]">
            {lang === 'km'
              ? 'ដំឡើងលើទូរស័ព្ទ ឬកុំព្យូទ័ររបស់អ្នក ដើម្បីចូលប្រើប្រាស់បានលឿន និងដំណើរការក្រៅបណ្ដាញ (Offline)។'
              : 'Add to your home screen or desktop for instant 1-tap access, fast loading, and offline sync.'}
          </p>
        </div>

        {/* iOS Guide Section if triggered */}
        {showIOSGuide ? (
          <div className="mt-4 p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 text-xs space-y-2">
            <p className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-blue-600" />
              <span>{lang === 'km' ? 'របៀបដំឡើងលើ iPhone/iPad (Safari)' : 'How to install on iOS (Safari)'}:</span>
            </p>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-400 text-[11px] pl-1">
              <li>{lang === 'km' ? 'ចុចប៊ូតុង Share (ចែករំលែក) ក្នុង Safari' : 'Tap the Share button in Safari toolbar'}</li>
              <li>{lang === 'km' ? 'រំកិលចុះក្រោម រួចចុច "Add to Home Screen"' : 'Scroll down & tap "Add to Home Screen"'}</li>
              <li>{lang === 'km' ? 'ចុច "Add" ដើម្បីបញ្ចប់ការដំឡើង' : 'Tap "Add" in the top-right to finish'}</li>
            </ol>
            <button
              onClick={handleDismiss}
              className="w-full mt-2 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors"
            >
              {lang === 'km' ? 'យល់ព្រម' : 'Got it'}
            </button>
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={handleInstallClick}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 active:scale-98 transition-all"
            >
              {justInstalled ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>{lang === 'km' ? 'បានដំឡើងជោគជ័យ!' : 'Installed Successfully!'}</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 animate-bounce" />
                  <span>{lang === 'km' ? 'ដំឡើងឥឡូវនេះ' : 'Install App Now'}</span>
                </>
              )}
            </button>
            <button
              onClick={handleDismiss}
              className="w-full py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              {lang === 'km' ? 'ពេលក្រោយ / បោះបង់' : 'Maybe Later'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
