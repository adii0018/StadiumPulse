/**
 * @fileoverview useSpeech hook — Web Speech API for STT and TTS.
 * Uses loose typing for cross-browser compatibility (webkit prefixed API).
 */

import { useState, useCallback, useRef } from 'react';

// Loose types for Web Speech API (not fully typed in TypeScript's DOM lib)
type SpeechRecognitionType = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionType;

interface UseSpeechReturn {
  isListening: boolean;
  isSpeaking: boolean;
  isSupported: boolean;
  startListening: (lang: string, onResult: (text: string) => void) => void;
  stopListening: () => void;
  speak: (text: string, lang: string) => void;
  cancelSpeech: () => void;
}

export function useSpeech(): UseSpeechReturn {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionType | null>(null);

  const getRecognitionCtor = (): SpeechRecognitionConstructor | undefined => {
    if (typeof window === 'undefined') return undefined;
    const w = window as unknown as Record<string, unknown>;
    return (w['SpeechRecognition'] ?? w['webkitSpeechRecognition']) as SpeechRecognitionConstructor | undefined;
  };

  const SpeechRecognitionCtor = getRecognitionCtor();
  const isSupported = !!SpeechRecognitionCtor && typeof window.speechSynthesis !== 'undefined';

  const startListening = useCallback(
    (lang: string, onResult: (text: string) => void) => {
      const Ctor = getRecognitionCtor();
      if (!Ctor || isListening) return;

      const recognition = new Ctor();
      recognition.lang = lang === 'es' ? 'es-ES' : lang === 'hi' ? 'hi-IN' : 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
      };

      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    },
    [isListening],
  );

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const speak = useCallback((text: string, lang: string) => {
    if (typeof window.speechSynthesis === 'undefined') return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'es' ? 'es-ES' : lang === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, []);

  const cancelSpeech = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  return { isListening, isSpeaking, isSupported, startListening, stopListening, speak, cancelSpeech };
}
