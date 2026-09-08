import {
  Component,
  ChangeDetectionStrategy,
  inject,
  ViewChild,
  ElementRef,
  effect,
  AfterViewInit
} from '@angular/core';
import { ChatStore } from '../../../application/stores/chat.store';
import { I18nService } from '../../../application/services/i18n.service';

@Component({
  selector: 'app-chat-bot',
  standalone: true,
  templateUrl: './chat-bot.component.html',
  styleUrl: './chat-bot.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatBotComponent implements AfterViewInit {
  protected readonly store = inject(ChatStore);
  protected readonly i18n = inject(I18nService);

  @ViewChild('messagesContainer') private messagesContainer?: ElementRef<HTMLDivElement>;
  @ViewChild('chatInput') private chatInput?: ElementRef<HTMLInputElement>;

  constructor() {
    // Desplazar automáticamente hacia el final al recibir un mensaje o iniciar respuesta
    effect(() => {
      this.store.messages();
      this.store.isTyping();
      this.scrollToBottom();
    });

    // Enfocar el input al abrir el chat
    effect(() => {
      if (this.store.isOpen()) {
        setTimeout(() => this.chatInput?.nativeElement?.focus(), 150);
      }
    });
  }

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

  protected onSend(inputEl: HTMLInputElement): void {
    const val = inputEl.value;
    if (!val.trim() || this.store.isTyping()) return;
    this.store.sendMessage(val);
    inputEl.value = '';
    this.scrollToBottom();
  }

  protected onSelectPrompt(prompt: string): void {
    if (this.store.isTyping()) return;
    this.store.sendMessage(prompt);
    this.scrollToBottom();
  }

  protected onKeyDown(event: KeyboardEvent, inputEl: HTMLInputElement): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSend(inputEl);
    } else if (event.key === 'Escape') {
      this.store.closeChat();
    }
  }

  private scrollToBottom(): void {
    if (typeof window === 'undefined') return;
    setTimeout(() => {
      if (this.messagesContainer?.nativeElement) {
        const el = this.messagesContainer.nativeElement;
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      }
    }, 60);
  }
}
