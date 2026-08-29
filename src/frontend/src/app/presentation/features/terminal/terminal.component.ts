import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  viewChild,
  ElementRef,
  AfterViewInit,
  effect
} from '@angular/core';
import { TerminalExecutorService } from '../../../application/services/terminal-executor.service';
import { I18nService } from '../../../application/services/i18n.service';

export interface TerminalEntry {
  readonly id: string;
  readonly type: 'input' | 'output' | 'error' | 'success' | 'banner' | 'ascii';
  readonly command?: string;
  readonly content?: string;
}

@Component({
  selector: 'app-terminal',
  standalone: true,
  templateUrl: './terminal.component.html',
  styleUrl: './terminal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TerminalComponent implements AfterViewInit {
  private readonly executor = inject(TerminalExecutorService);
  protected readonly i18n = inject(I18nService);

  private readonly terminalBodyRef = viewChild<ElementRef<HTMLDivElement>>('terminalBody');
  private readonly cmdInputRef = viewChild<ElementRef<HTMLInputElement>>('cmdInput');

  protected readonly currentInput = signal<string>('');
  protected readonly commandHistory = signal<string[]>([]);
  protected readonly historyIndex = signal<number>(-1);

  // Autosugerencia estilo Fish Shell en texto atenuado
  protected readonly suggestion = computed(() =>
    this.executor.getSuggestions(this.currentInput())
  );

  protected readonly entries = signal<TerminalEntry[]>([
    {
      id: 'init-banner',
      type: 'banner',
      content: this.i18n.t().terminalBanner
    },
    {
      id: 'init-hint',
      type: 'output',
      content: this.i18n.t().terminalHint
    }
  ]);

  constructor() {
    effect(() => {
      const t = this.i18n.t();
      this.entries.update(prev =>
        prev.map(e => {
          if (e.id === 'init-banner') {
            return { ...e, content: t.terminalBanner };
          }
          if (e.id === 'init-hint') {
            return { ...e, content: t.terminalHint };
          }
          return e;
        })
      );
    });
  }

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

  focusInput(): void {
    this.cmdInputRef()?.nativeElement.focus();
  }

  onKeyDown(event: KeyboardEvent): void {
    // 1. Aceptar autocompletado de Fish con Tab o Flecha Derecha al final
    if (event.key === 'Tab' || (event.key === 'ArrowRight' && this.isCursorAtEnd())) {
      const suggest = this.suggestion();
      if (suggest) {
        event.preventDefault();
        this.currentInput.update(val => val + suggest);
        return;
      }
    }

    // 2. Limpiar con Ctrl + L
    if (event.ctrlKey && event.key.toLowerCase() === 'l') {
      event.preventDefault();
      this.clear();
      return;
    }

    // 3. Historial hacia atrás (Flecha Arriba)
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      const history = this.commandHistory();
      if (history.length === 0) return;

      const newIndex = Math.min(this.historyIndex() + 1, history.length - 1);
      this.historyIndex.set(newIndex);
      this.currentInput.set(history[history.length - 1 - newIndex]);
      return;
    }

    // 4. Historial hacia adelante (Flecha Abajo)
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const history = this.commandHistory();
      if (this.historyIndex() <= 0) {
        this.historyIndex.set(-1);
        this.currentInput.set('');
        return;
      }

      const newIndex = this.historyIndex() - 1;
      this.historyIndex.set(newIndex);
      this.currentInput.set(history[history.length - 1 - newIndex]);
      return;
    }
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    const raw = this.currentInput();
    const trimmed = raw.trim();

    if (!trimmed) {
      // Línea vacía con solo prompt
      this.entries.update(prev => [
        ...prev,
        { id: crypto.randomUUID(), type: 'input', command: '' }
      ]);
      this.scrollToBottom();
      return;
    }

    // Guardar en historial
    this.commandHistory.update(prev => [...prev, raw]);
    this.historyIndex.set(-1);

    // Entrada del comando
    this.entries.update(prev => [
      ...prev,
      { id: crypto.randomUUID(), type: 'input', command: raw }
    ]);

    // Ejecutar lógica
    const result = this.executor.execute(raw);

    if (result.type === 'clear') {
      this.entries.set([]);
    } else {
      const entry: TerminalEntry = {
        id: crypto.randomUUID(),
        type: result.type,
        content: result.content
      };
      this.entries.update(prev => [...prev, entry]);
    }

    this.currentInput.set('');
    this.scrollToBottom();
  }

  clear(): void {
    this.entries.set([]);
    this.currentInput.set('');
  }

  private isCursorAtEnd(): boolean {
    const input = this.cmdInputRef()?.nativeElement;
    if (!input) return true;
    return input.selectionStart === input.value.length;
  }

  private scrollToBottom(): void {
    requestAnimationFrame(() => {
      const el = this.terminalBodyRef()?.nativeElement;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    });
  }
}
