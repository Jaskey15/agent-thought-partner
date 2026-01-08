import { promises as fs } from 'fs';
import path from 'path';
import type { Conversation, Message, Mode, MessageRole } from './types';

// Directory where conversation JSON files are stored
const DATA_DIR = path.join(process.cwd(), 'data', 'conversations');

// Ensure the data directory exists
async function ensureDataDir(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating data directory:', error);
    throw error;
  }
}

// Generate a unique conversation ID
export function generateConversationId(): string {
  return `${Date.now()}-${crypto.randomUUID()}`;
}

// Generate a unique message ID
export function generateMessageId(): string {
  return crypto.randomUUID();
}

// Get the file path for a conversation
function getConversationPath(conversationId: string): string {
  return path.join(DATA_DIR, `${conversationId}.json`);
}

// Create a new conversation
export async function createConversation(): Promise<Conversation> {
  await ensureDataDir();

  const conversation: Conversation = {
    id: generateConversationId(),
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await saveConversation(conversation);
  return conversation;
}

// Save a conversation to disk
export async function saveConversation(conversation: Conversation): Promise<void> {
  await ensureDataDir();

  const filePath = getConversationPath(conversation.id);
  const data = JSON.stringify(conversation, null, 2);

  try {
    await fs.writeFile(filePath, data, 'utf-8');
  } catch (error) {
    console.error('Error saving conversation:', error);
    throw error;
  }
}

// Load a conversation from disk
export async function loadConversation(conversationId: string): Promise<Conversation | null> {
  const filePath = getConversationPath(conversationId);

  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data) as Conversation;
  } catch (error) {
    // File doesn't exist or is invalid
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    console.error('Error loading conversation:', error);
    throw error;
  }
}

// Get or create a conversation
export async function getOrCreateConversation(conversationId?: string): Promise<Conversation> {
  if (conversationId) {
    const existing = await loadConversation(conversationId);
    if (existing) {
      return existing;
    }
  }

  return createConversation();
}

// Add a message to a conversation
export async function addMessage(
  conversationId: string,
  role: MessageRole,
  content: string,
  mode?: Mode
): Promise<Conversation> {
  const conversation = await loadConversation(conversationId);

  if (!conversation) {
    throw new Error(`Conversation ${conversationId} not found`);
  }

  const message: Message = {
    id: generateMessageId(),
    role,
    content,
    mode,
    timestamp: Date.now(),
  };

  conversation.messages.push(message);
  conversation.updatedAt = Date.now();

  await saveConversation(conversation);
  return conversation;
}

// Get recent messages from a conversation (for context)
export async function getRecentMessages(
  conversationId: string,
  limit: number = 10
): Promise<Message[]> {
  const conversation = await loadConversation(conversationId);

  if (!conversation) {
    return [];
  }

  // Return last N messages
  return conversation.messages.slice(-limit);
}

// List all conversations (for future feature)
export async function listConversations(): Promise<Conversation[]> {
  await ensureDataDir();

  try {
    const files = await fs.readdir(DATA_DIR);
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    const conversations = await Promise.all(
      jsonFiles.map(async (file) => {
        const conversationId = file.replace('.json', '');
        return loadConversation(conversationId);
      })
    );

    // Filter out nulls and sort by updatedAt (most recent first)
    return conversations
      .filter((conv): conv is Conversation => conv !== null)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  } catch (error) {
    console.error('Error listing conversations:', error);
    return [];
  }
}

// Delete a conversation (for future feature)
export async function deleteConversation(conversationId: string): Promise<void> {
  const filePath = getConversationPath(conversationId);

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.error('Error deleting conversation:', error);
      throw error;
    }
    // File doesn't exist, nothing to delete
  }
}
