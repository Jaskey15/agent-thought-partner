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

**Transitioning from text chat → voice-only interface**

Plan: `/.claude/plans/proud-wibbling-kernighan.md`

- Text chat: ✅ Working
- Voice interface: 🚧 In progress
  - Push-to-talk (hold button to speak)
  - Auto-play AI responses
  - Browser's native Speech API (free)

## Quick Start

```bash
npm install
npm run dev
```

**Env required:** `ANTHROPIC_API_KEY` in `.env.local`

## Architecture

- `/app/api/chat` - Streaming chat endpoint
- `/components/chat` - UI components
- `/lib` - Business logic (prompts, storage, types)
- `/data/conversations` - Persisted conversations (JSON files)

**Key decision:** No database. File-based storage keeps it simple.
**Key decision:** Voice is UI-only. API stays text-based (STT→text→API→text→TTS).
