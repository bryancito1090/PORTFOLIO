export interface N8nChatRequestDto {
  readonly message: string;
  readonly sessionId: string;
}

export interface N8nChatResponseDto {
  readonly reply?: string;
  readonly output?: string;
  readonly text?: string;
  readonly sessionId?: string;
}
