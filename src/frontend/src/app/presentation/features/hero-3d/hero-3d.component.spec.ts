import { TestBed } from '@angular/core/testing';
import { ThemeService } from '../../../application/services/theme.service';
import { Hero3dComponent } from './hero-3d.component';

describe('Hero3dComponent theme sequences', () => {
  it('keeps the canvas when switching themes and finishes loading after a failed frame', async () => {
    const width = window.innerWidth;
    const savedTheme = localStorage.getItem('portfolio_theme_mode');
    const sources: string[] = [];
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1440 });
    spyOn(window, 'Image').and.callFake(function () { return {
      get src() { return ''; },
      set src(value: string) { sources.push(value); },
      naturalWidth: 0,
      decode: () => sources.length === 1 ? Promise.reject(new Error('Failed frame')) : Promise.resolve()
    } as HTMLImageElement; });

    try {
      await TestBed.configureTestingModule({ imports: [Hero3dComponent] }).compileComponents();
      const theme = TestBed.inject(ThemeService);
      theme.setTheme('light');
      const fixture = TestBed.createComponent(Hero3dComponent);
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      const canvas = fixture.nativeElement.querySelector('canvas');
      expect(sources.length).toBe(240);
      expect(sources.every(src => src.includes('/thinkpad-sequence-light/'))).toBeTrue();
      expect(fixture.nativeElement.querySelector('.zen-loader-pill')).toBeNull();

      theme.setTheme('dark');
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(sources.length).toBe(480);
      expect(sources.slice(240).every(src => src.includes('/thinkpad-sequence/'))).toBeTrue();
      expect(fixture.nativeElement.querySelector('canvas')).toBe(canvas);
      expect(fixture.nativeElement.querySelector('.zen-loader-pill')).toBeNull();
      fixture.destroy();
    } finally {
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: width });
      TestBed.inject(ThemeService).setTheme(savedTheme === 'light' ? 'light' : 'dark');
      if (savedTheme === null) localStorage.removeItem('portfolio_theme_mode');
    }
  });
});
