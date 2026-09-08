import { InjectionToken } from '@angular/core';

export const CHAT_WEBHOOK_URL = new InjectionToken<string>('CHAT_WEBHOOK_URL', {
  providedIn: 'root',
  // Por defecto apunta a un endpoint relativo o variable local; se puede sobreescribir en app.config.ts
  factory: () => 'https://chat-api.bryanbano.com/webhook/portfolio-chat'
});
