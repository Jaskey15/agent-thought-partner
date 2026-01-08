'use client';

import { useState, useEffect } from 'react';
import { useChat } from 'ai/react';
import type { Mode } from '@/lib/types';
import { ModeSelector } from './mode-selector';
import { MessageList } from './message-list';
import { MessageInput } from './message-input';

export function ChatInterface() {
  const [mode, setMode] = useState<Mode>('listen');
  const [conversationId, setConversationId] = useState<string | null>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
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
  const messagesWithMode = messages.map((msg) => ({
    ...msg,
    data: { ...msg.data, mode: msg.role === 'assistant' ? mode : undefined },
  }));

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 p-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Second Brain with Opinions
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Choose your interaction mode and start thinking out loud
        </p>
      </header>

      {/* Mode Selector */}
      <ModeSelector
        currentMode={mode}
        onModeChange={setMode}
        disabled={isLoading}
      />

      {/* Error Display */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">
            <strong>Error:</strong> {error.message}
          </p>
        </div>
      )}

      {/* Messages */}
      <MessageList messages={messagesWithMode} isLoading={isLoading} />

      {/* Input */}
      <MessageInput
        input={input}
        isLoading={isLoading}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
