import { Injectable, inject, signal, computed } from '@angular/core';
import { ChatPort } from '../../domain/ports/chat.port';
import { ChatMessage } from '../../domain/models/chat.model';
import { RetroAudioService } from '../services/retro-audio.service';
import { I18nService } from '../services/i18n.service';

const SESSION_STORAGE_KEY = 'bryan_portfolio_chat_session';

@Injectable({ providedIn: 'root' })
export class ChatStore {
  private readonly chatPort = inject(ChatPort);
  private readonly audio = inject(RetroAudioService);
  private readonly i18n = inject(I18nService);

  private readonly _isOpen = signal<boolean>(false);
  private readonly _isTyping = signal<boolean>(false);
  private readonly _unreadCount = signal<number>(0);
  private readonly _errorMessage = signal<string | null>(null);
  private readonly _history = signal<ChatMessage[]>([]);
  private readonly _sessionId = signal<string>(this.initSessionId());

  readonly isOpen = this._isOpen.asReadonly();
  readonly isTyping = this._isTyping.asReadonly();
  readonly unreadCount = this._unreadCount.asReadonly();
  readonly errorMessage = this._errorMessage.asReadonly();
  readonly hasUnread = computed(() => this._unreadCount() > 0);

  // Mensajes computados de forma reactiva y pura, sin efectos que causen NG0600
  readonly messages = computed<ChatMessage[]>(() => {
    const isEs = this.i18n.currentLang() === 'es';
    const greeting: ChatMessage = {
      id: 'greeting',
      role: 'assistant',
      content: isEs
        ? 'Hola, soy el asistente virtual de Bryan Baño. Puedo responder dudas sobre su perfil, Clean Architecture en .NET / Angular o sus proyectos. ¿En qué te puedo orientar?'
        : "Hello, I am Bryan Baño's virtual assistant. I can answer questions about his skills, Clean Architecture in .NET / Angular, or his projects. How can I assist you?",
      timestamp: 'Zen AI',
      status: 'sent'
    };
    return [greeting, ...this._history()];
  });

  readonly quickPrompts = computed(() => {
    const isEs = this.i18n.currentLang() === 'es';
    return isEs
      ? [
          '¿Cuál es tu stack principal?',
          '¿Qué proyectos has realizado?',
          '¿Cómo puedo contactarte?'
        ]
      : [
          'What is your main tech stack?',
          'What projects have you built?',
          'How can I get in touch?'
        ];
  });

  private initSessionId(): string {
    if (typeof window === 'undefined') return `session-${Date.now()}`;
    try {
      const saved = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) return saved;
      const newId =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `session-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      sessionStorage.setItem(SESSION_STORAGE_KEY, newId);
      return newId;
    } catch {
      return `session-${Date.now()}`;
    }
  }

  toggleChat(): void {
    const nextState = !this._isOpen();
    this._isOpen.set(nextState);
    if (nextState) {
      this._unreadCount.set(0);
      this.audio.playClick();
    }
  }

  openChat(): void {
    this._isOpen.set(true);
    this._unreadCount.set(0);
    this.audio.playClick();
  }

  closeChat(): void {
    this._isOpen.set(false);
  }

  clearHistory(): void {
    this._errorMessage.set(null);
    this._history.set([]);
    this.audio.playClick();
  }

  sendMessage(rawText: string): void {
    const text = rawText.trim();
    if (!text || this._isTyping()) return;

    this._errorMessage.set(null);

    const timeStr = typeof Intl !== 'undefined'
      ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '';

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: timeStr,
      status: 'sent'
    };

    this._history.update(prev => [...prev, userMessage]);
    this._isTyping.set(true);
    this.audio.playClick();

    this.chatPort.sendMessage({ message: text, sessionId: this._sessionId() }).subscribe({
      next: res => {
        const assistantMessage: ChatMessage = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: res.reply,
          timestamp: timeStr,
          status: 'sent'
        };

        this._history.update(prev => [...prev, assistantMessage]);
        this._isTyping.set(false);

        if (!this._isOpen()) {
          this._unreadCount.update(c => c + 1);
        }
        this.audio.playHighScore();
      },
      error: err => {
        this._isTyping.set(false);
        this._errorMessage.set(err.message ?? 'No se pudo recibir respuesta del asistente.');

        const errorAssistantMsg: ChatMessage = {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: err.message ?? 'Lo siento, ocurrió un error de conexión con el agente.',
          timestamp: timeStr,
          status: 'error'
        };
        this._history.update(prev => [...prev, errorAssistantMsg]);
      }
    });
  }
}
