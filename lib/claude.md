# Core Business Logic

## Files

- `types.ts` - TypeScript interfaces (Mode, Message, Conversation)
- `prompts.ts` - System prompts for each mode + mode validation
- `storage.ts` - File-based conversation persistence
- `speech-utils.ts` - Web Speech API utilities

## Mode System

Each mode has a distinct system prompt defining Claude's behavior:

- **Listen** - Validates feelings, affirms thoughts
- **Clarify** - Asks questions, explores understanding
- **Challenge** - Plays devil's advocate, finds flaws

Mode is passed to API with each request and stored with assistant messages.

## Storage

**File-based JSON storage** in `/data/conversations/`

Format: `{timestamp}-{uuid}.json`

Structure:
```typescript
{
  id: string,
  messages: Message[],
  createdAt: number,
  updatedAt: number
}
```

**Why files?** Simple, portable, no database setup. Good for MVP.

Conversation ID persisted in browser's localStorage.

Recent context (last 10 messages) loaded on each API call.

## Speech Utilities

**`speech-utils.ts` functions:**
- `getSpeechRecognition()` - Get browser's API with webkit fallback
- `getSpeechSynthesis()` - Get TTS API
- `checkBrowserSupport()` - Check STT/TTS availability
- `isIOSDevice()` - Detect iOS for special handling
- `extractSentences()` - Parse text for chunked TTS

**Browser support:** Chrome, Safari, Edge (desktop & mobile). Firefox has TTS only.
