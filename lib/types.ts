// Mode types for the three interaction modes
export type Mode = 'listen' | 'clarify' | 'challenge';

// Message role types
export type MessageRole = 'user' | 'assistant';

// Individual message structure
export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  mode?: Mode; // Mode used when this message was generated (for assistant messages)
  timestamp: number;
}

// Conversation structure stored in JSON files
export interface Conversation {
  id: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

// Request body for chat API
export interface ChatRequest {
  messages: Array<{
    role: MessageRole;
    content: string;
  }>;
  mode: Mode;
  conversationId?: string;
}

// Response format for chat API (streaming)
export interface ChatResponse {
  success: boolean;
  conversationId?: string;
  error?: string;
}
