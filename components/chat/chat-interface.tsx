'use client';

import { useState, useEffect } from 'react';
import { useChat } from 'ai/react';
import type { Mode } from '@/lib/types';
import { ModeSelector } from './mode-selector';
import { ConversationHistoryVoice } from './conversation-history-voice';
import { VoicePlayback } from './voice-playback';
import { VoiceRecorder } from './voice-recorder';

export function ChatInterface() {
  const [mode, setMode] = useState<Mode>('listen');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const { messages, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
    body: {
      mode,
      conversationId,
    },
    onResponse: (response) => {
      // Extract conversation ID from response headers if present
      const respConvId = response.headers.get('X-Conversation-ID');
      if (respConvId && !conversationId) {
        setConversationId(respConvId);
        // Store in localStorage for persistence across page reloads
        localStorage.setItem('conversationId', respConvId);
      }
    },
    onError: (error) => {
      console.error('Chat error:', error);
    },
  });

  // Load conversation ID from localStorage on mount
  useEffect(() => {
    const storedConvId = localStorage.getItem('conversationId');
    if (storedConvId) {
      setConversationId(storedConvId);
    }
  }, []);

  // Update messages with mode information for display
  const messagesWithMode = messages.map((msg) => {
    const existingData = typeof msg.data === 'object' && msg.data !== null ? msg.data : {};
    return {
      ...msg,
      data: { ...existingData, mode: msg.role === 'assistant' ? mode : undefined },
    };
  });

  // Handle voice transcript completion
  const handleVoiceTranscript = (transcript: string) => {
    // Create a synthetic form event to submit via useChat
    const event = new Event('submit') as any;
    handleSubmit(event, {
      data: { content: transcript }
    });
  };

  // Get latest AI message for TTS auto-play
  const latestAIMessage = messages.length > 0 && messages[messages.length - 1].role === 'assistant'
    ? messages[messages.length - 1]
    : null;

  // Coordination logic
  const canRecord = !isSpeaking && !isLoading;
  const canChangeMode = !isSpeaking && !isLoading;

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 p-3">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Voice Assistant
        </h1>
      </header>

      {/* Mode Selector */}
      <ModeSelector
        currentMode={mode}
        onModeChange={setMode}
        disabled={!canChangeMode}
      />

      {/* Error Display */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">
            <strong>Error:</strong> {error.message}
          </p>
        </div>
      )}

      {/* Conversation History */}
      <ConversationHistoryVoice messages={messagesWithMode} />

      {/* Voice Playback (TTS for AI responses) */}
      {latestAIMessage && (
        <VoicePlayback
          text={latestAIMessage.content}
          autoPlay={true}
          onStart={() => setIsSpeaking(true)}
          onComplete={() => setIsSpeaking(false)}
        />
      )}

      {/* Voice Recorder (STT for user input) */}
      <VoiceRecorder
        onTranscriptComplete={handleVoiceTranscript}
        isDisabled={!canRecord}
      />
    </div>
  );
}
