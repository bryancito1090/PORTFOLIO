import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GuestbookStore } from '../../../application/stores/guestbook.store';

@Component({
  selector: 'app-guestbook',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './guestbook.component.html',
  styleUrl: './guestbook.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GuestbookComponent {
  readonly store = inject(GuestbookStore);

  // Form Signals
  readonly senderName = signal<string>('');
  readonly senderContact = signal<string>('');
  readonly message = signal<string>('');

  readonly formError = signal<string | null>(null);
  readonly showSuccessNotice = signal<boolean>(false);

  onSubmit(event: Event): void {
    event.preventDefault();

    const name = this.senderName().trim();
    const msg = this.message().trim();
    const contact = this.senderContact().trim();

    if (!name || name.length < 2) {
      this.formError.set('Por favor ingresa un nombre o alias válido (mínimo 2 caracteres).');
      return;
    }

    if (!msg || msg.length < 5) {
      this.formError.set('El mensaje debe tener al menos 5 caracteres.');
      return;
    }

    this.formError.set(null);

    this.store.submitEntry(
      {
        senderName: name,
        message: msg,
        senderContact: contact || undefined,
        origin: 'WebForm'
      },
      () => {
        this.senderName.set('');
        this.senderContact.set('');
        this.message.set('');
        this.showSuccessNotice.set(true);

        setTimeout(() => {
          this.showSuccessNotice.set(false);
        }, 4000);
      }
    );
  }

  refreshWall(): void {
    this.store.loadEntries();
  }

  formatDate(utcStr: string): string {
    try {
      const d = new Date(utcStr);
      return new Intl.DateTimeFormat('es-EC', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(d);
    } catch {
      return utcStr;
    }
  }
}
