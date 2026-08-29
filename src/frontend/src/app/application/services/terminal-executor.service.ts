import { Injectable, inject } from '@angular/core';
import { I18nService } from './i18n.service';

export type CommandExecutionResult =
  | { readonly type: 'clear'; readonly content?: string }
  | { readonly type: 'output' | 'error' | 'success' | 'ascii'; readonly content: string };

@Injectable({ providedIn: 'root' })
export class TerminalExecutorService {
  private readonly i18n = inject(I18nService);

  private readonly availableCommands = [
    'help',
    'clear',
    'fetch skills',
    'cat skills.json',
    'guestbook sign "',
    'leaderboard --game snake',
    'about',
    'whoami'
  ];

  getSuggestions(partial: string): string {
    const trimmed = partial.trimStart();
    if (!trimmed) return '';

    const match = this.availableCommands.find(cmd =>
      cmd.toLowerCase().startsWith(trimmed.toLowerCase())
    );

    if (match && match.length > trimmed.length) {
      return match.slice(trimmed.length);
    }

    return '';
  }

  execute(rawInput: string): CommandExecutionResult {
    const trimmed = rawInput.trim();
    if (!trimmed) {
      return { type: 'output', content: '' };
    }

    const [cmd, ...args] = trimmed.split(/\s+/);
    const lowerCmd = cmd.toLowerCase();
    const fullCommand = trimmed.toLowerCase();
    const t = this.i18n.t();

    // 1. Comando CLEAR
    if (lowerCmd === 'clear') {
      return { type: 'clear', content: '' };
    }

    // 2. Comando HELP
    if (lowerCmd === 'help') {
      return {
        type: 'output',
        content: t.terminalHelpContent
      };
    }

    // 3. Comandos de Skills (cat skills.json / fetch skills)
    if (fullCommand === 'cat skills.json' || fullCommand === 'fetch skills') {
      return {
        type: 'output',
        content: `{
  "developer": "Bryan Baño",
  "backend": {
    "framework": ".NET 8 / .NET 9",
    "patterns": ["Clean Architecture", "CQRS", "MediatR", "Domain-Driven Design"],
    "data": ["Entity Framework Core", "MySQL", "PostgreSQL", "Redis"],
    "quality": ["FluentValidation", "TDD", "xUnit", "ProblemDetails RFC 7807"]
  },
  "frontend": {
    "framework": "Angular 19/20",
    "reactivity": ["Signals", "computed", "effect", "OnPush 60FPS"],
    "architecture": ["Ports & Adapters (Hexagonal)", "Feature Slicing"],
    "multimedia": ["HTML5 Canvas 2D", "Web Audio API", "Three.js / WebGL"]
  },
  "devops_cloud": ["Docker", "Linux / Arch", "Nginx", "GitHub Actions CI/CD"]
}`
      };
    }

    // 4. Comando Guestbook
    if (lowerCmd === 'guestbook') {
      const subAction = args[0]?.toLowerCase();
      if (subAction === 'sign') {
        const messageMatch = trimmed.match(/sign\s+["']?([^"']+)["']?/i);
        const message = messageMatch ? messageMatch[1] : args.slice(1).join(' ');
        if (!message) {
          return {
            type: 'error',
            content: t.terminalGuestbookSignUsage
          };
        }
        return {
          type: 'success',
          content: t.terminalGuestbookSuccess.replace('{msg}', message)
        };
      }
      return {
        type: 'error',
        content: t.terminalGuestbookGenericUsage
      };
    }

    // 5. Comando Leaderboard (Tabla ASCII de récords)
    if (lowerCmd === 'leaderboard') {
      const isEs = this.i18n.currentLang() === 'es';
      const playerCol = isEs ? 'JUGADOR            ' : 'PLAYER             ';
      const gameCol = isEs ? 'JUEGO              ' : 'GAME               ';
      const note = isEs
        ? '(4 filas consultadas - Listo para enlazar con GET /api/v1/scores)'
        : '(4 rows retrieved - Ready to bind with GET /api/v1/scores)';

      return {
        type: 'output',
        content: `+------+---------------------+-------+---------------------+
| POS  | ${playerCol}| PTS   | ${gameCol}|
+------+---------------------+-------+---------------------+
| 1    | Bryan Baño          | 9,840 | Zen Snake CRT       |
| 2    | Neo_Arch            | 8,420 | Zen Snake CRT       |
| 3    | KintsugiDev         | 6,150 | Zen Snake CRT       |
| 4    | Guest_404           | 3,800 | Zen Snake CRT       |
+------+---------------------+-------+---------------------+
${note}`
      };
    }

    // 6. Comando About
    if (lowerCmd === 'about') {
      return {
        type: 'output',
        content: t.terminalAbout
      };
    }

    // 7. Comando Whoami
    if (lowerCmd === 'whoami') {
      return {
        type: 'output',
        content: 'bryan@archlinux (terminal-guest, uid=1000, groups=wheel,developers)'
      };
    }

    // Comando no reconocido
    return {
      type: 'error',
      content: t.terminalUnknownCmd.replace('{cmd}', cmd)
    };
  }
}
