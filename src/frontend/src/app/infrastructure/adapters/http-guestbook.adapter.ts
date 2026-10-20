import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { GuestbookPort } from '../../domain/ports/guestbook.port';
import { CreateGuestbookRequest, GuestbookEntry } from '../../domain/models/guestbook.model';
import { API_BASE_URL } from '../../core/tokens/api-config.token';
import { NOTIFY_WEBHOOK_URL } from '../../core/tokens/notify-config.token';

const STORAGE_KEY = 'zen_guestbook_entries_cache';

const INITIAL_MOCK_ENTRIES: GuestbookEntry[] = [
  {
    id: 'mock-1',
    senderName: 'Sophia Lindqvist',
    message: 'Impresionante nivel técnico en la arquitectura limpia y el diseño retro. El 3D scroll es impecable.',
    origin: 'WebForm',
    createdAtUtc: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'mock-2',
    senderName: 'Kenji Sato',
    message: '素晴らしいデザイン！ La estética Zen y el monitor CRT son únicos. Saludos desde Tokio.',
    origin: 'Terminal',
    createdAtUtc: new Date(Date.now() - 3600000 * 8).toISOString()
  },
  {
    id: 'mock-3',
    senderName: 'Alex Rivera',
    message: 'Probé el simulador de incidentes y la API .NET responde en milisegundos desde Oracle Cloud. Gran trabajo.',
    origin: 'ApiTester',
    createdAtUtc: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

@Injectable({
  providedIn: 'root'
})
export class HttpGuestbookAdapter implements GuestbookPort {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly notifyWebhookUrl = inject(NOTIFY_WEBHOOK_URL);

  getEntries(limit: number = 50): Observable<GuestbookEntry[]> {
    return this.http.get<GuestbookEntry[]>(`${this.baseUrl}/guestbook?limit=${limit}`).pipe(
      tap(entries => this.saveToCache(entries)),
      catchError(() => of(this.loadFromCache()))
    );
  }

  createEntry(request: CreateGuestbookRequest): Observable<GuestbookEntry> {
    this.dispatchN8nNotification(request);

    return this.http.post<GuestbookEntry>(`${this.baseUrl}/guestbook`, request).pipe(
      tap(created => {
        const cached = this.loadFromCache();
        this.saveToCache([created, ...cached]);
      }),
      catchError(() => {
        // Fallback local para permitir firmas inmediatas sin servidor
        const localEntry: GuestbookEntry = {
          id: 'local-' + Date.now(),
          senderName: request.senderName,
          message: request.message,
          origin: request.origin ?? 'WebForm',
          createdAtUtc: new Date().toISOString()
        };
        const cached = this.loadFromCache();
        this.saveToCache([localEntry, ...cached]);
        return of(localEntry);
      })
    );
  }

  private dispatchN8nNotification(request: CreateGuestbookRequest): void {
    try {
      this.http.post(this.notifyWebhookUrl, {
        eventType: 'GUESTBOOK_SIGNATURE',
        senderName: request.senderName,
        senderContact: request.senderContact || 'Firma de Visitante Web',
        message: request.message,
        serviceType: request.origin ?? 'WebForm'
      }).subscribe({
        next: () => {},
        error: () => {}
      });
    } catch {
      // Ignorar fallos de red en notificación
    }
  }

  private loadFromCache(): GuestbookEntry[] {
    if (typeof localStorage === 'undefined') return INITIAL_MOCK_ENTRIES;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      this.saveToCache(INITIAL_MOCK_ENTRIES);
      return INITIAL_MOCK_ENTRIES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_MOCK_ENTRIES;
    }
  }

  private saveToCache(entries: GuestbookEntry[]): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, 50)));
    }
  }
}
