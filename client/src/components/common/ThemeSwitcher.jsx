import React, { useState, useEffect } from 'react';
import { Palette, Check, Sun, Moon } from 'lucide-react';

export const THEMES = [
  {
    id: 'neu-dark-slate',
    name: 'Dark Slate',
    color: '#5C73F8',
    previewBg: '#131722',
  },
  {
    id: 'neu-cyber-violet',
    name: 'Cyber Violet',
    color: '#A855F7',
    previewBg: '#151026',
  },
  {
    id: 'neu-deep-midnight',
    name: 'Deep Midnight',
    color: '#06B6D4',
    previewBg: '#0B132B',
  },
  {
    id: 'neu-soft-minimal',
    name: 'Soft Light',
    color: '#4F46E5',
    previewBg: '#F1F5F9',
  },
];

export const ThemeSwitcher = () => {
  const [activeTheme, setActiveTheme] = useState(() => {
    return localStorage.getItem('studix_theme') || 'neu-dark-slate';
  });
  const [isOpen, setIsOpen] = useState(false);

  const isLightMode = activeTheme === 'neu-soft-minimal';

  useEffect(() => {
    document.documentElement.className = isLightMode ? 'neu-soft-minimal light' : `${activeTheme} dark`;
    localStorage.setItem('studix_theme', activeTheme);
  }, [activeTheme, isLightMode]);

  const handleSelectTheme = (themeId) => {
    setActiveTheme(themeId);
    setIsOpen(false);
  };

  const toggleDarkLight = () => {
    if (isLightMode) {
      setActiveTheme('neu-dark-slate');
    } else {
      setActiveTheme('neu-soft-minimal');
    }
  };

  return (
    <div className="flex items-center space-x-1.5">
      {/* 1. Direct Sun / Moon Dark & Light Toggle */}
      <button
        type="button"
        id="theme-mode-toggle-btn"
        onClick={toggleDarkLight}
        title={isLightMode ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        className="p-2 rounded-xl neu-button flex items-center space-x-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-all group"
      >
        {isLightMode ? (
          <Moon className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
        ) : (
          <Sun className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
        )}
        <span className="hidden sm:inline text-[11px] font-bold text-slate-200">
          {isLightMode ? 'Dark' : 'Light'}
        </span>
      </button>

      {/* 2. Neumorphic Palette Dropdown for Accent Themes */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          title="Color Theme Palette"
          className="p-2 rounded-xl neu-button flex items-center space-x-1 text-xs font-semibold text-slate-300 hover:text-white"
        >
          <Palette className="w-4 h-4 text-brand-400" />
        </button>


      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-52 p-3 rounded-2xl neu-flat z-50 animate-fade-in space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1 mb-1">
              Select Neumorphic Theme
            </p>
            {THEMES.map((theme) => {
              const isSelected = activeTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => handleSelectTheme(theme.id)}
                  className={`w-full p-2.5 rounded-xl flex items-center justify-between text-xs font-semibold transition-all ${
                    isSelected
                      ? 'neu-pressed text-brand-400 font-bold'
                      : 'hover:bg-slate-200/60 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/10 dark:border-white/20 shadow-sm"
                      style={{ backgroundColor: theme.color }}
                    />
                    <span className="font-bold">{theme.name}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-brand-400" />}
                </button>
              );
            })}
          </div>
        </>
      )}
      </div>
    </div>
  );
};



export default ThemeSwitcher;
