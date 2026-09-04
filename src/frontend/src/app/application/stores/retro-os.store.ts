import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { WindowId, RetroWindow, DesktopIcon, ZenOsTheme, ZenOsConfig, WindowPosition, WindowSize, OsPowerState } from '../../domain/models/retro-os.model';
import { RetroAudioService } from '../services/retro-audio.service';
import { I18nService } from '../services/i18n.service';

const INITIAL_WINDOWS: Record<WindowId, RetroWindow> = {
  games: {
    id: 'games',
    title: 'Buscaminas - Juegos Clásicos',
    icon: 'minesweeper',
    isOpen: false,
    isMinimized: false,
    position: { x: 70, y: 20 },
    size: { width: 270, height: 360 },
    zIndex: 10,
    minSize: { width: 260, height: 340 }
  },
  cv: {
    id: 'cv',
    title: 'Curriculum Vitae - Bryan Baño',
    icon: 'document',
    isOpen: false,
    isMinimized: false,
    isMaximized: true,
    position: { x: 25, y: 15 },
    size: { width: 450, height: 420 },
    zIndex: 11,
    minSize: { width: 320, height: 300 }
  },
  scores: {
    id: 'scores',
    title: 'Tabla de Récords - Salón de la Fama',
    icon: 'trophy',
    isOpen: false,
    isMinimized: false,
    position: { x: 120, y: 50 },
    size: { width: 340, height: 380 },
    zIndex: 12,
    minSize: { width: 280, height: 300 }
  },
  settings: {
    id: 'settings',
    title: 'Panel de Control',
    icon: 'gear',
    isOpen: false,
    isMinimized: false,
    position: { x: 140, y: 65 },
    size: { width: 320, height: 320 },
    zIndex: 13,
    minSize: { width: 280, height: 260 }
  }
};

@Injectable({ providedIn: 'root' })
export class RetroOsStore {
  private readonly audio = inject(RetroAudioService);
  private readonly i18n = inject(I18nService);

  private readonly _powerState = signal<OsPowerState>('off');
  private readonly _windows = signal<Record<WindowId, RetroWindow>>(INITIAL_WINDOWS);
  private readonly _activeWindowId = signal<WindowId | null>(null);
  private readonly _topZIndex = signal<number>(20);

  private readonly _theme = signal<ZenOsTheme>(this.getSavedTheme());
  private readonly _scanlines = signal<boolean>(this.getSavedBoolean('zenos_scanlines', true));
  private readonly _soundEnabled = signal<boolean>(this.getSavedBoolean('zenos_sound', true));

  readonly powerState = this._powerState.asReadonly();

  readonly desktopIcons = computed<DesktopIcon[]>(() => {
    const t = this.i18n.t();
    return [
      { id: 'icon-games', label: t.retroIconGames, windowId: 'games', iconType: 'minesweeper' },
      { id: 'icon-cv', label: t.retroIconCv, windowId: 'cv', iconType: 'document' },
      { id: 'icon-scores', label: t.retroIconScores, windowId: 'scores', iconType: 'trophy' },
      { id: 'icon-settings', label: t.retroIconSettings, windowId: 'settings', iconType: 'gear' }
    ];
  });
  readonly windows = this._windows.asReadonly();
  readonly activeWindowId = this._activeWindowId.asReadonly();
  readonly theme = this._theme.asReadonly();
  readonly scanlines = this._scanlines.asReadonly();
  readonly soundEnabled = this._soundEnabled.asReadonly();

  readonly openWindows = computed(() =>
    Object.values(this._windows()).filter(w => w.isOpen)
  );

  readonly activeWindow = computed(() => {
    const id = this._activeWindowId();
    return id ? this._windows()[id] : null;
  });

  constructor() {
    this.applyThemeToDocument(this._theme());
    this.audio.setMuted(!this._soundEnabled());

    effect(() => {
      const t = this.i18n.t();
      this._windows.update(prev => ({
        ...prev,
        games: { ...prev.games, title: t.retroWinGames },
        cv: { ...prev.cv, title: t.retroWinCv },
        scores: { ...prev.scores, title: t.retroWinScores },
        settings: { ...prev.settings, title: t.retroWinSettings }
      }));
    });
  }

  openWindow(id: WindowId): void {
    this.audio.playClick();
    const nextZ = this._topZIndex() + 1;
    this._topZIndex.set(nextZ);
    this._activeWindowId.set(id);

    this._windows.update(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        isOpen: true,
        isMinimized: false,
        isMaximized: id === 'cv' ? true : prev[id].isMaximized,
        zIndex: nextZ
      }
    }));
  }

  toggleMaximize(id: WindowId): void {
    this.audio.playClick();
    this._windows.update(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        isMaximized: !prev[id].isMaximized
      }
    }));
  }

  closeWindow(id: WindowId): void {
    this.audio.playClick();
    this._windows.update(prev => ({
      ...prev,
      [id]: { ...prev[id], isOpen: false }
    }));

    if (this._activeWindowId() === id) {
      const remaining = this.openWindows().filter(w => w.id !== id && !w.isMinimized);
      const nextActive = remaining.sort((a, b) => b.zIndex - a.zIndex)[0];
      this._activeWindowId.set(nextActive ? nextActive.id : null);
    }
  }

  minimizeWindow(id: WindowId): void {
    this.audio.playClick();
    this._windows.update(prev => ({
      ...prev,
      [id]: { ...prev[id], isMinimized: true }
    }));

    if (this._activeWindowId() === id) {
      const remaining = this.openWindows().filter(w => w.id !== id && !w.isMinimized);
      const nextActive = remaining.sort((a, b) => b.zIndex - a.zIndex)[0];
      this._activeWindowId.set(nextActive ? nextActive.id : null);
    }
  }

  focusWindow(id: WindowId): void {
    if (this._activeWindowId() === id) return;
    this.audio.playClick();
    const nextZ = this._topZIndex() + 1;
    this._topZIndex.set(nextZ);
    this._activeWindowId.set(id);

    this._windows.update(prev => ({
      ...prev,
      [id]: { ...prev[id], isMinimized: false, zIndex: nextZ }
    }));
  }

  moveWindow(id: WindowId, position: WindowPosition): void {
    this._windows.update(prev => ({
      ...prev,
      [id]: { ...prev[id], position }
    }));
  }

  setTheme(theme: ZenOsTheme): void {
    this.audio.playClick();
    this._theme.set(theme);
    this.applyThemeToDocument(theme);
    try {
      localStorage.setItem('zenos_theme', theme);
    } catch {
      // Ignorar fallo de almacenamiento
    }
  }

  toggleScanlines(): void {
    this.audio.playClick();
    this._scanlines.update(v => {
      const next = !v;
      try {
        localStorage.setItem('zenos_scanlines', String(next));
      } catch {
        // Ignorar
      }
      return next;
    });
  }

  toggleSound(): void {
    this._soundEnabled.update(v => {
      const next = !v;
      this.audio.setMuted(!next);
      if (next) this.audio.playClick();
      try {
        localStorage.setItem('zenos_sound', String(next));
      } catch {
        // Ignorar
      }
      return next;
    });
  }

  startBootSequence(): void {
    if (this._powerState() !== 'off') return;
    this._powerState.set('booting');

    // Transición directa de barra de carga XP a escritorio
    setTimeout(() => {
      if (this._powerState() === 'booting') {
        this.audio.playStartup();
        this._powerState.set('desktop');
      }
    }, 2400);
  }

  forceDesktop(): void {
    this._powerState.set('desktop');
  }

  resetToOff(): void {
    this._powerState.set('off');
    this._windows.set(INITIAL_WINDOWS);
    this._activeWindowId.set(null);
  }

  private applyThemeToDocument(theme: ZenOsTheme): void {
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }

  private getSavedTheme(): ZenOsTheme {
    try {
      const saved = localStorage.getItem('zenos_theme');
      if (saved === 'zen-dark' || saved === 'retro-amber' || saved === 'matrix-green') {
        return saved;
      }
    } catch {
      // Fallback
    }
    return 'zen-dark';
  }

  private getSavedBoolean(key: string, fallback: boolean): boolean {
    try {
      const saved = localStorage.getItem(key);
      if (saved !== null) return saved === 'true';
    } catch {
      // Fallback
    }
    return fallback;
  }
}
