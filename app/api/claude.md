# API Layer

Single endpoint: `/api/chat` (POST)

## Request

```typescript
{
  messages: Array<{ role: 'user' | 'assistant', content: string }>,
  mode: 'listen' | 'clarify' | 'challenge',
  conversationId?: string
}
```

## Response

Streaming text response via Vercel AI SDK.

Headers: `X-Conversation-ID: {id}`

## Flow

1. Validate request (messages, mode, API key)
2. Get or create conversation
3. Load recent history (last 10 messages)
4. Save user message to storage
5. Call Claude API with streaming
6. Stream response back to client
7. Save assistant response on completion
8. Return conversation ID in header

## Model

`claude-sonnet-4-5-20250929` with max_tokens: 1024

## Key Features

- **Streaming:** Real-time response chunks via `AnthropicStream`
- **Context:** Last 10 messages loaded for continuity
- **Persistence:** Every message saved to file storage
- **Mode-aware:** System prompt changes based on mode

## Error Handling

- Missing messages → 400
- Invalid mode → 400
- Missing API key → 500
- Claude API errors → 500 with error message

## Voice Interface Impact

**None.** Voice is UI-only transformation:
- STT converts speech → text
- API handles text (as before)
- TTS converts response → speech

No backend changes needed.
