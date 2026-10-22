import { Injectable, signal, computed } from '@angular/core';

export type ThemeMode = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'portfolio_theme_mode';

  readonly themeMode = signal<ThemeMode>(this.getInitialTheme());
  readonly isLightMode = computed(() => this.themeMode() === 'light');
  readonly isDarkMode = computed(() => this.themeMode() === 'dark');

  constructor() {
    this.applyTheme(this.themeMode());
  }

  toggleTheme(): void {
    const next: ThemeMode = this.themeMode() === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
  }

  setTheme(mode: ThemeMode): void {
    this.themeMode.set(mode);
    this.applyTheme(mode);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEY, mode);
      }
    } catch {
      // Fallback si localStorage no está disponible
    }
  }

  private applyTheme(mode: ThemeMode): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const body = document.body;

    if (mode === 'light') {
      root.setAttribute('data-theme', 'zen-light');
      body.classList.remove('theme-dark');
      body.classList.add('theme-light');
    } else {
      root.setAttribute('data-theme', 'zen-dark');
      body.classList.remove('theme-light');
      body.classList.add('theme-dark');
    }
  }

  private getInitialTheme(): ThemeMode {
    if (typeof window === 'undefined') return 'dark';

    try {
      const saved = localStorage.getItem(this.STORAGE_KEY) as ThemeMode | null;
      if (saved === 'dark' || saved === 'light') return saved;

      // Por defecto iniciamos en dark mode como pide el diseño Cyber-Zen
      return 'dark';
    } catch {
      return 'dark';
    }
  }
}
