# Components

All chat UI components live in `/components/chat/`.

## Current (Text-Based)

- `chat-interface.tsx` - Main orchestrator, uses Vercel AI's `useChat` hook
- `mode-selector.tsx` - Three-button mode toggle (Listen/Clarify/Challenge)
- `message-list.tsx` - Displays conversation history
- `message-input.tsx` - Textarea for text input

## Voice Interface (In Progress)

**Replacing:**
- `message-input.tsx` → `voice-recorder.tsx` (push-to-talk STT)
- `message-list.tsx` → `conversation-history-voice.tsx` (compact display)

**Adding:**
- `voice-playback.tsx` - TTS for AI responses with auto-play
- `/hooks/use-speech-recognition.ts` - STT logic
- `/hooks/use-speech-synthesis.ts` - TTS logic
- `/lib/speech-utils.ts` - Web Speech API utilities

## Patterns

- Client components (`'use client'`)
- Tailwind for styling (dark mode supported)
- Props-down, events-up communication
- State managed in `chat-interface.tsx`, passed to children

## State Flow

```
chat-interface.tsx (useChat hook)
  ├─ mode (Listen/Clarify/Challenge)
  ├─ messages (conversation history)
  ├─ isLoading (API request status)
  └─ conversationId (persisted in localStorage)
```
