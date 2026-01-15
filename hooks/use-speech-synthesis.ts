import { useState, useRef, useCallback, useEffect } from 'react';
import { getSpeechSynthesis } from '@/lib/speech-utils';

export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [queue, setQueue] = useState<string[]>([]);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isProcessingRef = useRef(false);

  const speak = useCallback((text: string, options?: { rate?: number; pitch?: number; volume?: number; onComplete?: () => void }) => {
    const synthesis = getSpeechSynthesis();

    if (!synthesis) {
      console.error('Speech synthesis not supported');
      options?.onComplete?.();
      return;
    }

    // Cancel any ongoing speech first
    synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Configure voice
    const voices = synthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.rate = options?.rate ?? 1.0;
    utterance.pitch = options?.pitch ?? 1.0;
    utterance.volume = options?.volume ?? 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      utteranceRef.current = null;
      options?.onComplete?.();
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', {
        error: event.error,
        charIndex: event.charIndex,
        elapsedTime: event.elapsedTime,
        name: event.name,
      });
      setIsSpeaking(false);
      options?.onComplete?.();
    };

    utteranceRef.current = utterance;
    synthesis.speak(utterance);

  }, []);

  const addToQueue = useCallback((text: string) => {
    setQueue(prev => [...prev, text]);
  }, []);

  const processQueue = useCallback(() => {
    if (isProcessingRef.current || queue.length === 0) return;

    isProcessingRef.current = true;
    const text = queue[0];

    speak(text);

    // Wait for completion
    const interval = setInterval(() => {
      if (!isSpeaking) {
        clearInterval(interval);
        setQueue(prev => prev.slice(1));
        isProcessingRef.current = false;
      }
    }, 100);

  }, [queue, isSpeaking, speak]);

  const stop = useCallback(() => {
    const synthesis = getSpeechSynthesis();
    if (synthesis) {
      synthesis.cancel();
      setIsSpeaking(false);
      setQueue([]);
    }
  }, []);

  const pause = useCallback(() => {
    const synthesis = getSpeechSynthesis();
    if (synthesis) {
      synthesis.pause();
      setIsPaused(true);
    }
  }, []);

  const resume = useCallback(() => {
    const synthesis = getSpeechSynthesis();
    if (synthesis) {
      synthesis.resume();
      setIsPaused(false);
    }
  }, []);

  // Process queue when items added
  useEffect(() => {
    if (queue.length > 0 && !isProcessingRef.current) {
      processQueue();
    }
  }, [queue, processQueue]);

  // Cleanup
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    isSpeaking,
    isPaused,
    speak,
    addToQueue,
    stop,
    pause,
    resume,
  };
};
