import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const TextToSpeechButton = ({ text, className = '' }) => {
  const { i18n } = useTranslation();
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-Speech is not supported by your browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();

    // Clean text of markdown formatting for natural speech
    const cleanText = text
      .replace(/#+\s/g, '')
      .replace(/[*_`]/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Set voice language match
    const langCode = i18n.language === 'te' ? 'te-IN' : i18n.language === 'ta' ? 'ta-IN' : 'en-US';
    utterance.lang = langCode;
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  return (
    <button
      type="button"
      onClick={handleToggleSpeech}
      title={isSpeaking ? 'Stop voice readout' : 'Read solution aloud (TTS)'}
      className={`p-1.5 rounded-xl neu-button transition-colors flex items-center space-x-1 text-xs ${
        isSpeaking
          ? 'text-amber-400 active font-bold'
          : 'text-slate-400 hover:text-white'
      } ${className}`}
    >
      {isSpeaking ? (
        <>
          <VolumeX className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          <span className="text-[10px] text-amber-300">Stop Voice</span>
        </>
      ) : (
        <>
          <Volume2 className="w-3.5 h-3.5 text-accent-cyan" />
          <span className="text-[10px]">Read Aloud</span>
        </>
      )}
    </button>
  );
};

export default TextToSpeechButton;
