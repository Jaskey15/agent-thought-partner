'use client';

import { useEffect, useRef, useState } from 'react';
import { useSpeechSynthesis } from '@/hooks/use-speech-synthesis';
import type { Mode } from '@/lib/types';

interface ConversationHistoryVoiceProps {
  messages: Array<{
    id: string;
    role: string;
    content: string;
    data?: { mode?: Mode };
  }>;
}

export function ConversationHistoryVoice({ messages }: ConversationHistoryVoiceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { speak } = useSpeechSynthesis();
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleExpanded = (messageId: string) => {
    setExpandedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const handleReplay = (content: string) => {
    speak(content);
  };

  const getModeColor = (mode?: Mode) => {
    switch (mode) {
      case 'listen':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'clarify':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300';
      case 'challenge':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
    }
  };

  const getModeName = (mode?: Mode) => {
    if (!mode) return '';
    return mode.charAt(0).toUpperCase() + mode.slice(1);
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Ready to listen
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Hold the button below to start speaking your thoughts
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      <div className="max-w-4xl mx-auto space-y-2">
        {messages.map((message, index) => {
          const isExpanded = expandedMessages.has(message.id);
          const isOld = index < messages.length - 3;
          const truncatedContent = message.content.length > 100
            ? message.content.substring(0, 100) + '...'
            : message.content;

          return (
            <div
              key={message.id}
              className={`
                p-3 rounded-lg border transition-opacity duration-300
                ${message.role === 'user'
                  ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
                  : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                }
                ${isOld ? 'opacity-60' : 'opacity-100'}
              `}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                    {message.role === 'user' ? 'You' : 'AI'}
                  </span>
                  {message.role === 'assistant' && message.data?.mode && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getModeColor(message.data.mode)}`}>
                      {getModeName(message.data.mode)}
                    </span>
                  )}
                </div>

                {/* Replay Button */}
                <button
                  onClick={() => handleReplay(message.content)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  aria-label="Replay message"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {/* Message Content */}
              <div
                className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                onClick={() => toggleExpanded(message.id)}
              >
                {isExpanded ? message.content : truncatedContent}
              </div>

              {/* Expand Indicator */}
              {message.content.length > 100 && (
                <button
                  onClick={() => toggleExpanded(message.id)}
                  className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {isExpanded ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
