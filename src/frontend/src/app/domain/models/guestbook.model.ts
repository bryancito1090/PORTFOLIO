export interface GuestbookEntry {
  id: string;
  senderName: string;
  message: string;
  origin: 'Terminal' | 'WebForm' | 'ApiTester';
  createdAtUtc: string;
}

export interface CreateGuestbookRequest {
  senderName: string;
  message: string;
  origin?: 'Terminal' | 'WebForm' | 'ApiTester';
  senderContact?: string;
}
