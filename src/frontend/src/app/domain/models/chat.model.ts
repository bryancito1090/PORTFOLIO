export type ChatMessageRole = 'user' | 'assistant' | 'system';
export type ChatMessageStatus = 'sending' | 'sent' | 'error';

export interface ChatMessage {
  readonly id: string;
  readonly role: ChatMessageRole;
  readonly content: string;
  readonly timestamp: string;
  readonly status: ChatMessageStatus;
}

export interface ChatPayload {
  readonly message: string;
  readonly sessionId: string;
}

export interface ChatResponse {
  readonly reply: string;
  readonly sessionId: string;
}
