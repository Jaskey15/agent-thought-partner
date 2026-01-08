import Anthropic from '@anthropic-ai/sdk';
import { AnthropicStream, StreamingTextResponse } from 'ai';
import type { Mode } from '@/lib/types';
import { getSystemPrompt, isValidMode } from '@/lib/prompts';
import {
  getOrCreateConversation,
  addMessage,
  getRecentMessages,
} from '@/lib/storage';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    // Parse request body
    const body = await req.json();
    const { messages, mode, conversationId } = body;

    // Validate inputs
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!mode || !isValidMode(mode)) {
      return new Response(
        JSON.stringify({ error: 'Valid mode is required (listen, clarify, or challenge)' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY is not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get or create conversation
    const conversation = await getOrCreateConversation(conversationId);

    // Get recent message history for context (last 10 messages)
    const historyMessages = await getRecentMessages(conversation.id, 10);

    // Format history messages for Anthropic API (exclude the current user message)
    const formattedHistory = historyMessages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Get the latest user message from the request
    const latestUserMessage = messages[messages.length - 1];

    // Save the user message to storage
    await addMessage(
      conversation.id,
      'user',
      latestUserMessage.content
    );

    // Combine history with new messages
    const allMessages = [
      ...formattedHistory,
      ...messages,
    ];

    // Get system prompt based on mode
    const systemPrompt = getSystemPrompt(mode as Mode);

    // Call Anthropic API with streaming
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      system: systemPrompt,
      messages: allMessages,
      stream: true,
    });

    // Store the complete response text
    let fullResponse = '';

    // Create streaming response with callback to save message
    const stream = AnthropicStream(response, {
      onFinal: async (completion) => {
        fullResponse = completion;

        // Save assistant's response to storage
        try {
          await addMessage(
            conversation.id,
            'assistant',
            completion,
            mode as Mode
          );
        } catch (error) {
          console.error('Error saving assistant message:', error);
        }
      },
    });

    // Return streaming response with conversation ID in headers
    return new StreamingTextResponse(stream, {
      headers: {
        'X-Conversation-ID': conversation.id,
      },
    });

  } catch (error) {
    console.error('Error in chat API:', error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
