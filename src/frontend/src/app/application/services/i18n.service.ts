import { Injectable, signal, computed } from '@angular/core';
import { Language, TranslationDictionary } from '../../domain/models/i18n.model';
import { ES_TRANSLATIONS } from '../i18n/translations/es';
import { EN_TRANSLATIONS } from '../i18n/translations/en';

export type { Language, TranslationDictionary };

const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  es: ES_TRANSLATIONS,
  en: EN_TRANSLATIONS
};

@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly currentLang = signal<Language>(this.getSavedLanguage());
  readonly t = computed(() => TRANSLATIONS[this.currentLang()]);

  toggleLanguage(): void {
    this.currentLang.update(lang => {
      const next: Language = lang === 'es' ? 'en' : 'es';
      try {
        localStorage.setItem('portfolio_lang', next);
      } catch {
        // Fallback si localStorage no está disponible
      }
      return next;
    });
  }

  setLanguage(lang: Language): void {
    this.currentLang.set(lang);
    try {
      localStorage.setItem('portfolio_lang', lang);
    } catch {
      // Fallback
    }
  }

  private getSavedLanguage(): Language {
    try {
      const saved = localStorage.getItem('portfolio_lang');
      if (saved === 'es' || saved === 'en') return saved;
    } catch {
      // Fallback
    }
    return 'es';
  }
}
