import { InjectionToken } from '@angular/core';

export const CHAT_WEBHOOK_URL = new InjectionToken<string>('CHAT_WEBHOOK_URL', {
  providedIn: 'root',
  factory: () => 'https://n8n.bryan-bano.com/webhook/portfolio-chat'
});
