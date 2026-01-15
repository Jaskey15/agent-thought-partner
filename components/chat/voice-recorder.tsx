'use client';

import { useEffect } from 'react';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';

interface VoiceRecorderProps {
  onTranscriptComplete: (transcript: string) => void;
  isDisabled: boolean;
}

export function VoiceRecorder({ onTranscriptComplete, isDisabled }: VoiceRecorderProps) {
  const {
    state,
    transcript,
    interimTranscript,
    error,
    startRecording,
    stopRecording,
    reset,
  } = useSpeechRecognition();

  const handleMouseDown = () => {
    if (!isDisabled && state === 'idle') {
      startRecording();
    }
  };

  const handleMouseUp = () => {
    if (state === 'recording') {
      stopRecording();
    }
  };

  const handleTranscriptReady = () => {
    if (transcript.trim()) {
      onTranscriptComplete(transcript.trim());
      reset();
    } else {
      reset();
    }
  };

  // Handle transcript completion
  useEffect(() => {
    if (state === 'processing' && transcript) {
      handleTranscriptReady();
    }
  }, [state, transcript]);

  // Keyboard support (Spacebar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isDisabled && state === 'idle' && !e.repeat) {
        e.preventDefault();
        startRecording();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && state === 'recording') {
        e.preventDefault();
        stopRecording();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [state, isDisabled, startRecording, stopRecording]);

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      {/* Error Display */}
      {error && (
        <div className="w-full max-w-md p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200 text-center">
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}

      {/* Interim Transcript Display */}
      {(state === 'recording' || state === 'processing') && (
        <div className="w-full max-w-2xl p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <p className="text-gray-900 dark:text-gray-100">
            {transcript}
            {interimTranscript && (
              <span className="text-gray-500 dark:text-gray-400">{interimTranscript}</span>
            )}
          </p>
        </div>
      )}

      {/* Record Button */}
      <button
        className={`
          relative w-32 h-32 rounded-full font-semibold text-white transition-all duration-200
          focus:outline-none focus:ring-4 focus:ring-offset-2
          ${state === 'idle' && !isDisabled
            ? 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-300 dark:focus:ring-blue-800'
            : ''
          }
          ${state === 'recording'
            ? 'bg-red-500 animate-pulse focus:ring-red-300 dark:focus:ring-red-800'
            : ''
          }
          ${state === 'processing'
            ? 'bg-amber-500 focus:ring-amber-300 dark:focus:ring-amber-800'
            : ''
          }
          ${state === 'error'
            ? 'bg-red-600 focus:ring-red-300 dark:focus:ring-red-800'
            : ''
          }
          ${isDisabled
            ? 'bg-gray-400 cursor-not-allowed opacity-50'
            : 'cursor-pointer'
          }
        `}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        disabled={isDisabled}
        aria-label={state === 'recording' ? 'Recording - Release to send' : 'Hold to record'}
      >
        {/* Microphone Icon */}
        {state === 'idle' && (
          <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
          </svg>
        )}

        {/* Recording Icon */}
        {state === 'recording' && (
          <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
            <circle cx="10" cy="10" r="6" />
          </svg>
        )}

        {/* Processing Spinner */}
        {state === 'processing' && (
          <svg className="w-12 h-12 mx-auto animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}

        {/* Error Icon */}
        {state === 'error' && (
          <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {/* Status Text */}
      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        {state === 'idle' && !isDisabled && 'Press and hold to speak'}
        {state === 'idle' && isDisabled && 'Please wait...'}
        {state === 'recording' && 'Release when finished'}
        {state === 'processing' && 'Converting speech to text...'}
        {state === 'error' && 'An error occurred'}
      </div>

      {/* Keyboard Hint */}
      <div className="text-xs text-gray-500 dark:text-gray-500">
        Tip: Hold <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Space</kbd> to record
      </div>
    </div>
  );
}
