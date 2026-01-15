import { useState, useRef, useCallback, useEffect } from 'react';
import { getSpeechRecognition } from '@/lib/speech-utils';

type RecognitionState = 'idle' | 'recording' | 'processing' | 'error';

export const useSpeechRecognition = () => {
  const [state, setState] = useState<RecognitionState>('idle');
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  const startRecording = useCallback(() => {
    const SpeechRecognition = getSpeechRecognition();

    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser');
      setState('error');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcriptPart + ' ';
          } else {
            interim += transcriptPart;
          }
        }

        if (final) {
          setTranscript(prev => prev + final);
        }
        setInterimTranscript(interim);
      };

      recognition.onerror = (event: any) => {
        const errorMessages: Record<string, string> = {
          'no-speech': 'No speech detected',
          'audio-capture': 'Microphone error',
          'not-allowed': 'Microphone permission denied',
          'network': 'Network error',
        };

        setError(errorMessages[event.error] || 'Speech recognition error');
        setState('error');
      };

      recognition.onend = () => {
        if (state === 'recording') {
          setState('processing');
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
      setState('recording');
      setTranscript('');
      setInterimTranscript('');
      setError(null);

    } catch (err) {
      setError('Failed to start recording');
      setState('error');
    }
  }, [state]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setState('processing');
    }
  }, []);

  const reset = useCallback(() => {
    setState('idle');
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  return {
    state,
    transcript,
    interimTranscript,
    error,
    startRecording,
    stopRecording,
    reset,
  };
};
