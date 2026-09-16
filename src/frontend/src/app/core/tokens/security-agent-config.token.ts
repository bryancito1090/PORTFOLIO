import { InjectionToken } from '@angular/core';

export const SECURITY_AGENT_WEBHOOK_URL = new InjectionToken<string>('SECURITY_AGENT_WEBHOOK_URL', {
  providedIn: 'root',
  factory: () => 'https://n8n.bryan-bano.com/webhook/security-agent'
});
