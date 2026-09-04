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

  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];

  const handleSelectLanguage = (code) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Switch Language (English / Telugu / Tamil)"
        className="p-2 rounded-xl neu-button flex items-center space-x-1.5 text-xs font-semibold text-slate-300 hover:text-white"
      >
        <Globe className="w-4 h-4 text-accent-cyan" />
        <span className="hidden xl:inline text-[11px] font-bold uppercase">{currentLang.code}</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-44 p-2.5 rounded-2xl neu-flat z-50 animate-fade-in space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1">
              Select Language
            </p>
            {languages.map((lng) => {
              const isSelected = i18n.language === lng.code;
              return (
                <button
                  key={lng.code}
                  onClick={() => handleSelectLanguage(lng.code)}
                  className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-xs font-semibold transition-all ${
                    isSelected
                      ? 'neu-pressed text-white font-bold'
                      : 'hover:bg-slate-800/40 text-slate-300'
                  }`}
                >
                  <div className="flex flex-col text-left">
                    <span className="text-xs">{lng.native}</span>
                    <span className="text-[10px] text-slate-400">{lng.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-accent-cyan" />}
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
