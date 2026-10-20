import { Injectable, inject, signal } from '@angular/core';
import { GuestbookPort } from '../../domain/ports/guestbook.port';
import { HttpGuestbookAdapter } from '../../infrastructure/adapters/http-guestbook.adapter';
import { CreateGuestbookRequest, GuestbookEntry } from '../../domain/models/guestbook.model';

@Injectable({
  providedIn: 'root'
})
export class GuestbookStore {
  private readonly adapter: GuestbookPort = inject(HttpGuestbookAdapter);

  readonly entries = signal<GuestbookEntry[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);
  readonly lastSubmitted = signal<GuestbookEntry | null>(null);

  constructor() {
    this.loadEntries();
  }

  loadEntries(): void {
    this.isLoading.set(true);
    this.adapter.getEntries(50).subscribe({
      next: entries => {
        this.entries.set(entries);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  submitEntry(request: CreateGuestbookRequest, onSuccess?: () => void): void {
    this.isSubmitting.set(true);
    this.adapter.createEntry(request).subscribe({
      next: newEntry => {
        this.entries.update(list => [newEntry, ...list.filter(e => e.id !== newEntry.id)]);
        this.lastSubmitted.set(newEntry);
        this.isSubmitting.set(false);
        onSuccess?.();
      },
      error: () => this.isSubmitting.set(false)
    });
  }
}
