import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు' },
    { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  ];

  const currentCode = (i18n.resolvedLanguage || i18n.language || 'en').slice(0, 2).toLowerCase();
  const currentLang = languages.find((l) => l.code === currentCode) || languages[0];

  const handleSelectLanguage = (code) => {
    i18n.changeLanguage(code);
    try {
      localStorage.setItem('i18nextLng', code);
    } catch (_) {}
    if (typeof document !== 'undefined') {
      document.documentElement.lang = code;
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        title={`Current Language: ${currentLang.native} (${currentLang.label}). Click to switch.`}
        className="p-2 rounded-xl neu-button flex items-center space-x-1.5 text-xs font-semibold text-slate-300 hover:text-white"
        id="navbar-language-switcher-btn"
      >
        <Globe className="w-4 h-4 text-accent-cyan" />
        <span className="text-[11px] font-black uppercase text-brand-300">{currentLang.code}</span>
        <span className="hidden xl:inline text-[11px] text-slate-400 font-medium">({currentLang.native})</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 p-2.5 rounded-2xl neu-flat z-50 animate-fade-in space-y-1 shadow-2xl border border-slate-700/60">
            <div className="flex items-center justify-between px-2 py-1 mb-1 border-b border-slate-700/40">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Select Language
              </span>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300">
                {currentLang.code.toUpperCase()}
              </span>
            </div>
            {languages.map((lng) => {
              const isSelected = currentCode === lng.code;
              return (
                <button
                  key={lng.code}
                  onClick={() => handleSelectLanguage(lng.code)}
                  id={`lang-select-${lng.code}`}
                  className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'neu-pressed text-brand-300 font-bold border border-brand-500/30'
                      : 'hover:bg-slate-800/40 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold">{lng.native}</span>
                    <span className="text-[10px] text-slate-400">{lng.label}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-accent-cyan font-bold" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSwitcher;
