import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const TextToSpeechButton = ({ text, className = '' }) => {
  const { i18n } = useTranslation();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const utteranceQueueRef = useRef([]);

  // Cancel any active speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        if (window._studixUtterances) {
          window._studixUtterances = [];
        }
      }
    };
  }, []);

  const handleToggleSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Text-to-Speech is not supported by your browser.');
      return;
    }

    // If already speaking, stop
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      utteranceQueueRef.current = [];
      if (window._studixUtterances) window._studixUtterances = [];
      setIsSpeaking(false);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Mobile Chrome / Safari unlock: explicitly resume suspended speech context on user tap
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      // Clean text of markdown, code blocks, URLs, and symbols for natural voice narration
      const cleanText = text
        .replace(/```[\s\S]*?```/g, 'Code block omitted.')
        .replace(/#+\s/g, '')
        .replace(/[*_`]/g, '')
        .replace(/\[.*?\]\(.*?\)/g, '')
        .replace(/>\s/g, '')
        .replace(/\|.*?\|/g, '') // strip markdown tables
        .replace(/\n+/g, '. ')
        .trim();

      if (!cleanText) {
        setIsLoading(false);
        return;
      }

      // Determine target language
      const targetLang =
        i18n.language === 'te' ? 'te-IN' : i18n.language === 'ta' ? 'ta-IN' : 'en-US';

      // Load available system voices
      const voices = window.speechSynthesis.getVoices();
      let matchedVoice = voices.find((v) => v.lang === targetLang || v.lang.startsWith(targetLang.split('-')[0]));
      // Fallback to english if regional language voice is not installed on mobile device
      if (!matchedVoice) {
        matchedVoice = voices.find((v) => v.lang.startsWith('en')) || voices[0] || null;
      }

      // Split text into short sentence chunks (under 160 characters) to avoid mobile Chrome 15s timeout
      const sentences = cleanText
        .match(/[^.!?]+[.!?]+/g) || [cleanText];

      const queue = [];
      window._studixUtterances = queue; // Store globally on window to avoid V8 garbage collection dropping audio

      sentences.forEach((sentence, index) => {
        const trimmed = sentence.trim();
        if (!trimmed) return;

        const utterance = new SpeechSynthesisUtterance(trimmed);
        if (matchedVoice) {
          utterance.voice = matchedVoice;
          utterance.lang = matchedVoice.lang;
        } else {
          utterance.lang = targetLang;
        }

        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        if (index === 0) {
          utterance.onstart = () => {
            setIsLoading(false);
            setIsSpeaking(true);
          };
        }

        if (index === sentences.length - 1) {
          utterance.onend = () => {
            setIsSpeaking(false);
            setIsLoading(false);
            window._studixUtterances = [];
          };
          utterance.onerror = (e) => {
            console.warn('Speech synthesis ended with event:', e);
            setIsSpeaking(false);
            setIsLoading(false);
            window._studixUtterances = [];
          };
        } else {
          utterance.onerror = (e) => {
            console.warn('Speech chunk notice:', e);
          };
        }

        queue.push(utterance);
      });

      utteranceQueueRef.current = queue;

      // Speak all chunks sequentially
      queue.forEach((u) => {
        window.speechSynthesis.speak(u);
      });

      // Mobile Safari / Chrome watchdog: if paused, resume
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch (err) {
      console.error('Text-to-speech error on device:', err);
      setIsSpeaking(false);
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggleSpeech}
      title={isSpeaking ? 'Stop voice readout' : 'Read solution aloud (TTS)'}
      className={`p-2 rounded-xl neu-button transition-all flex items-center space-x-1.5 text-xs touch-manipulation ${
        isSpeaking
          ? 'text-amber-400 active font-bold shadow-glow border-amber-500/40'
          : 'text-slate-300 hover:text-white'
      } ${className}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 text-brand-400 animate-spin" />
          <span className="text-[10px] text-brand-300">Voice...</span>
        </>
      ) : isSpeaking ? (
        <>
          <VolumeX className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          <span className="text-[10px] text-amber-300 font-bold">Stop Voice</span>
        </>
      ) : (
        <>
          <Volume2 className="w-3.5 h-3.5 text-accent-cyan" />
          <span className="text-[10px] font-semibold">Read Aloud</span>
        </>
      )}
    </button>
  );
};

export default TextToSpeechButton;
