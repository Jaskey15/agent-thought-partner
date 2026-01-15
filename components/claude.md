# Components

All chat UI components live in `/components/chat/`.

## Voice Components

- `chat-interface.tsx` - Main orchestrator with voice state coordination
- `mode-selector.tsx` - Three-button mode toggle (compact)
- `voice-recorder.tsx` - Push-to-talk STT (mouse/touch/keyboard)
- `voice-playback.tsx` - TTS with auto-play & stop button
- `conversation-history-voice.tsx` - Compact history with replay

## Hooks

- `/hooks/use-speech-recognition.ts` - STT state & logic
- `/hooks/use-speech-synthesis.ts` - TTS queue & playback

## Utilities

- `/lib/speech-utils.ts` - Browser detection, sentence parsing

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
  ├─ isSpeaking (TTS playback status)
  └─ conversationId (persisted in localStorage)
```

**Coordination:**
- Recording disabled while AI speaking or loading
- Mode switching disabled while speaking or loading
- Latest AI message auto-plays via TTS
