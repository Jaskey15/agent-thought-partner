'use client';

import { useEffect } from 'react';
import { useSpeechSynthesis } from '@/hooks/use-speech-synthesis';

interface VoicePlaybackProps {
  text: string;
  autoPlay?: boolean;
  onComplete?: () => void;
  onStart?: () => void;
}

export function VoicePlayback({ text, autoPlay = true, onComplete, onStart }: VoicePlaybackProps) {
  const { isSpeaking, speak, stop } = useSpeechSynthesis();

  useEffect(() => {
    if (text && autoPlay && !isSpeaking) {
      speak(text);
      onStart?.();
    }
  }, [text, autoPlay]);

  useEffect(() => {
    if (!isSpeaking && text && onComplete) {
      onComplete();
    }
  }, [isSpeaking]);

  if (!text) return null;

  return (
    <div className="w-full p-4 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-4xl mx-auto">
        {isSpeaking && (
          <div className="flex items-center justify-between">
            {/* Speaking Animation */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <span className="w-1 h-4 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1 h-6 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1 h-8 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></span>
                <span className="w-1 h-6 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '450ms' }}></span>
                <span className="w-1 h-4 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '600ms' }}></span>
              </div>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                AI is speaking...
              </span>
            </div>

            {/* Stop Button */}
            <button
              onClick={stop}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
              aria-label="Stop speaking"
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                </svg>
                <span>Stop</span>
              </div>
            </button>
          </div>
        )}

        {/* Current Text Display */}
        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}
