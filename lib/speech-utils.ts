// Utility functions for Web Speech API

/**
 * Get the browser's SpeechRecognition API with webkit prefix fallback
 */
export const getSpeechRecognition = (): typeof SpeechRecognition | null => {
  if (typeof window === 'undefined') return null;
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
};

/**
 * Get the browser's SpeechSynthesis API
 */
export const getSpeechSynthesis = (): SpeechSynthesis | null => {
  if (typeof window === 'undefined') return null;
  return window.speechSynthesis || null;
};

/**
 * Check browser support for speech APIs
 */
export const checkBrowserSupport = () => {
  return {
    speechRecognition: !!getSpeechRecognition(),
    speechSynthesis: !!getSpeechSynthesis(),
  };
};

/**
 * Detect if the device is iOS
 */
export const isIOSDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

/**
 * Extract complete sentences from text
 */
export const extractSentences = (text: string): string[] => {
  const sentenceRegex = /[^.!?]+[.!?]+/g;
  return text.match(sentenceRegex) || [];
};
