# Agent Thought Partner

Voice-first AI assistant for thinking out loud with three interaction modes.

## The Three Modes

- **Listen** - Empathetic validation, affirms your thoughts
- **Clarify** - Socratic questioning, explores deeper understanding
- **Challenge** - Constructive opposition, stress-tests ideas

## Tech Stack

- Next.js 16 + React 19
- Anthropic Claude API (Sonnet 4.5)
- Vercel AI SDK (streaming)
- Web Speech API (STT/TTS)
- File-based storage (JSON)

## Current State

**Voice-only interface** ✅ Complete

- Push-to-talk (hold button or spacebar to speak)
- Auto-play AI responses via TTS
- Browser's native Speech API (free, no dependencies)
- Compact conversation history with replay
- Real-time transcript display

## Quick Start

```bash
npm install
npm run dev
```

**Env required:** `ANTHROPIC_API_KEY` in `.env.local`

## Architecture

- `/app/api/chat` - Streaming chat endpoint (unchanged)
- `/components/chat` - Voice UI components
- `/hooks` - Speech recognition & synthesis hooks
- `/lib` - Business logic (prompts, storage, types, speech utils)
- `/data/conversations` - Persisted conversations (JSON files)

**Key decisions:**
- No database. File-based storage keeps it simple.
- Voice is UI-only. API stays text-based (STT→text→API→text→TTS).
- No npm packages for voice. Native Web Speech API only.
