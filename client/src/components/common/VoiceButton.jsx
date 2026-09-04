import React, { useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const VoiceButton = ({ onTranscript, className = '' }) => {
  const { i18n } = useTranslation();
  const [isListening, setIsListening] = useState(false);

  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech-to-text is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    // Detect language: English, Telugu, or Tamil
    const langCode = i18n.language === 'te' ? 'te-IN' : i18n.language === 'ta' ? 'ta-IN' : 'en-US';
    recognition.lang = langCode;

    if (!isListening) {
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (onTranscript) onTranscript(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } else {
      setIsListening(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
        isListening
          ? 'neu-pressed text-rose-400 border border-rose-500/50 animate-pulse'
          : 'neu-button text-slate-400 hover:text-white'
      } ${className}`}
      title={isListening ? 'Listening (speak now)...' : 'Voice Input (Speech-to-Text)'}
    >
      {isListening ? (
        <MicOff className="w-4 h-4 text-rose-400" />
      ) : (
        <Mic className="w-4 h-4 text-accent-cyan" />
      )}
    </button>
  );
};

export default VoiceButton;

