import { InjectionToken } from '@angular/core';

export const NOTIFY_WEBHOOK_URL = new InjectionToken<string>('NOTIFY_WEBHOOK_URL', {
  providedIn: 'root',
  factory: () => 'https://n8n.bryan-bano.com/webhook/portfolio-notify'
});
