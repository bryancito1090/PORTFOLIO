import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { RetroScorePort } from './domain/ports/retro-score.port';
import { LocalStorageRetroScoreAdapter } from './infrastructure/adapters/local-storage-retro-score.adapter';
import { ChatPort } from './domain/ports/chat.port';
import { N8nChatAdapter } from './infrastructure/adapters/n8n-chat.adapter';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(),
    { provide: RetroScorePort, useClass: LocalStorageRetroScoreAdapter },
    { provide: ChatPort, useClass: N8nChatAdapter }
  ]
};
