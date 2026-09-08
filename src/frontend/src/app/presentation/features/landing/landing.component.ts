import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, signal, computed, inject, ViewChild, ElementRef } from '@angular/core';
import { Hero3dComponent } from '../hero-3d/hero-3d.component';
import { RetroOsComponent } from '../retro-os/retro-os.component';
import { TerminalComponent } from '../terminal/terminal.component';
import { FeaturedProjectsComponent } from '../featured-projects/featured-projects/featured-projects.component';
import { ContactSectionComponent } from '../contact-section/contact-section.component';
import { TechnicalProfileComponent } from '../technical-profile/technical-profile.component';
import { IncidentSimulatorComponent } from '../incident-simulator/incident-simulator.component';
import { I18nService } from '../../../application/services/i18n.service';

export type LandingSection = 'hero' | 'retro' | 'projects' | 'simulator' | 'terminal' | 'contact';

export const LANDING_SECTIONS: readonly LandingSection[] = [
  'hero',
  'retro',
  'projects',
  'simulator',
  'terminal',
  'contact'
];

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    Hero3dComponent,
    RetroOsComponent,
    TerminalComponent,
    FeaturedProjectsComponent,
    ContactSectionComponent,
    TechnicalProfileComponent,
    IncidentSimulatorComponent
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingComponent implements OnInit, OnDestroy {
  protected readonly i18n = inject(I18nService);
  protected readonly currentYear = signal(new Date().getFullYear());
  protected readonly currentTime = signal<string>('');
  protected readonly activeSection = signal<LandingSection>('hero');
  protected readonly heroEntryPosition = signal<'top' | 'bottom'>('top');
  protected readonly isCurtainVisible = signal<boolean>(false);
  protected readonly transitionTargetSection = signal<LandingSection>('hero');

  protected readonly hasPrevSection = computed(() => {
    return LANDING_SECTIONS.indexOf(this.activeSection()) > 0;
  });

  protected readonly hasNextSection = computed(() => {
    return LANDING_SECTIONS.indexOf(this.activeSection()) < LANDING_SECTIONS.length - 1;
  });

  protected readonly prevSectionName = computed(() => {
    const idx = LANDING_SECTIONS.indexOf(this.activeSection());
    return idx > 0 ? this.getSectionTitle(LANDING_SECTIONS[idx - 1]) : '';
  });

  protected readonly nextSectionName = computed(() => {
    const idx = LANDING_SECTIONS.indexOf(this.activeSection());
    return idx < LANDING_SECTIONS.length - 1 ? this.getSectionTitle(LANDING_SECTIONS[idx + 1]) : '';
  });

  protected readonly transitionTargetTitle = computed(() => {
    return this.getSectionTitle(this.transitionTargetSection());
  });

  private clockInterval: ReturnType<typeof setInterval> | null = null;
  private readonly timeFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'America/Guayaquil',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  @ViewChild('navContainer') private navContainerRef?: ElementRef<HTMLElement>;

  private isTransitioning = false;
  private touchStartY = 0;
  private touchStartX = 0;
  private wheelDeltaAccum = 0;
  private wheelResetTimer: ReturnType<typeof setTimeout> | null = null;
  private transitionTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.updateClock();
    this.clockInterval = setInterval(() => this.updateClock(), 1000);
    this.parseInitialHash();
    this.setupScrollTransitions();
  }

  getSectionTitle(section: LandingSection): string {
    const dict = this.i18n.t();
    switch (section) {
      case 'hero': return dict.navHome;
      case 'retro': return dict.navRetro;
      case 'projects': return dict.navProjects;
      case 'simulator': return dict.navSimulator;
      case 'terminal': return dict.navTerminal;
      case 'contact': return dict.navContact;
    }
  }

  setSection(section: LandingSection, entryPosition: 'top' | 'bottom' = 'top'): void {
    if (this.activeSection() === section || this.isTransitioning) return;
    this.isTransitioning = true;
    this.transitionTargetSection.set(section);
    this.isCurtainVisible.set(true);

    if (this.transitionTimer) clearTimeout(this.transitionTimer);

    // Brief fade-curtain duration before switching section component
    this.transitionTimer = setTimeout(() => {
      if (section === 'hero') {
        this.heroEntryPosition.set(entryPosition);
      }

      this.activeSection.set(section);

      if (typeof window !== 'undefined') {
        const hash = section === 'hero' ? '' : `#${section}`;
        const url = window.location.pathname + window.location.search + hash;
        window.history.replaceState(null, '', url);
        this.scrollActiveNavIntoView(section);

        if (section !== 'hero') {
          if (entryPosition === 'bottom') {
            const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
            window.scrollTo({ top: maxScroll, behavior: 'instant' });
          } else {
            window.scrollTo({ top: 0, behavior: 'instant' });
          }
        }
      }

      // Smoothly hide curtain after DOM mount and scroll placement
      setTimeout(() => {
        this.isCurtainVisible.set(false);
        setTimeout(() => {
          this.isTransitioning = false;
        }, 220);
      }, 120);
    }, 150);
  }

  private setupScrollTransitions(): void {
    if (typeof window === 'undefined') return;
    window.addEventListener('wheel', this.onWheel, { passive: false });
    window.addEventListener('touchstart', this.onTouchStart, { passive: true });
    window.addEventListener('touchend', this.onTouchEnd, { passive: true });
  }

  private onWheel = (e: WheelEvent): void => {
    if (this.isTransitioning) return;

    // Ignorar si el usuario está interactuando con un modal o scroll interno
    const target = e.target as HTMLElement | null;
    if (target?.closest('.project-detail-overlay, .modal-scroll-area')) {
      return;
    }

    const scrollY = window.scrollY || window.pageYOffset;
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const isAtTop = scrollY <= 6;
    const isAtBottom = scrollY >= maxScroll - 6;

    if (e.deltaY > 0 && isAtBottom) {
      this.wheelDeltaAccum += e.deltaY;
      if (this.wheelDeltaAccum > 50) {
        this.wheelDeltaAccum = 0;
        this.goToNextSection();
      }
    } else if (e.deltaY < 0 && isAtTop) {
      this.wheelDeltaAccum += e.deltaY;
      if (this.wheelDeltaAccum < -50) {
        this.wheelDeltaAccum = 0;
        this.goToPrevSection();
      }
    } else {
      this.wheelDeltaAccum = 0;
    }

    if (this.wheelResetTimer) clearTimeout(this.wheelResetTimer);
    this.wheelResetTimer = setTimeout(() => {
      this.wheelDeltaAccum = 0;
    }, 250);
  };

  private onTouchStart = (e: TouchEvent): void => {
    if (e.touches.length > 0) {
      this.touchStartY = e.touches[0].clientY;
      this.touchStartX = e.touches[0].clientX;
    }
  };

  private onTouchEnd = (e: TouchEvent): void => {
    if (this.isTransitioning || e.changedTouches.length === 0) return;

    const target = e.target as HTMLElement | null;
    if (target?.closest('.project-detail-overlay, .modal-scroll-area')) {
      return;
    }

    const touchEndY = e.changedTouches[0].clientY;
    const touchEndX = e.changedTouches[0].clientX;
    const diffY = this.touchStartY - touchEndY;
    const diffX = this.touchStartX - touchEndX;

    if (Math.abs(diffY) > 50 && Math.abs(diffY) > Math.abs(diffX) * 1.3) {
      const scrollY = window.scrollY || window.pageYOffset;
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const isAtTop = scrollY <= 10;
      const isAtBottom = scrollY >= maxScroll - 10;

      if (diffY > 0 && isAtBottom) {
        this.goToNextSection();
      } else if (diffY < 0 && isAtTop) {
        this.goToPrevSection();
      }
    }
  };

  protected goToNextSection(): void {
    const currentIndex = LANDING_SECTIONS.indexOf(this.activeSection());
    if (currentIndex >= 0 && currentIndex < LANDING_SECTIONS.length - 1) {
      const next = LANDING_SECTIONS[currentIndex + 1];
      this.setSection(next, 'top');
    }
  }

  protected goToPrevSection(): void {
    const currentIndex = LANDING_SECTIONS.indexOf(this.activeSection());
    if (currentIndex > 0) {
      const prev = LANDING_SECTIONS[currentIndex - 1];
      this.setSection(prev, 'bottom');
    }
  }

  private scrollActiveNavIntoView(section: LandingSection): void {
    if (typeof window === 'undefined') return;
    setTimeout(() => {
      if (!this.navContainerRef) return;
      const activeEl = this.navContainerRef.nativeElement.querySelector(`[data-nav="${section}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }, 60);
  }

  private parseInitialHash(): void {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash.toLowerCase().replace('#', '');
    let targetSection: LandingSection = 'hero';
    if (hash === 'retro' || hash === 'desktop') {
      targetSection = 'retro';
    } else if (hash === 'projects' || hash === 'proyectos') {
      targetSection = 'projects';
    } else if (hash === 'simulator' || hash === 'simulador') {
      targetSection = 'simulator';
    } else if (hash === 'terminal') {
      targetSection = 'terminal';
    } else if (hash === 'contact' || hash === 'contacto') {
      targetSection = 'contact';
    }
    this.activeSection.set(targetSection);
    this.scrollActiveNavIntoView(targetSection);
  }

  private updateClock(): void {
    this.currentTime.set(this.timeFormatter.format(new Date()));
  }

  ngOnDestroy(): void {
    if (this.clockInterval !== null) {
      clearInterval(this.clockInterval);
    }
    if (this.wheelResetTimer !== null) {
      clearTimeout(this.wheelResetTimer);
    }
    if (this.transitionTimer !== null) {
      clearTimeout(this.transitionTimer);
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('wheel', this.onWheel);
      window.removeEventListener('touchstart', this.onTouchStart);
      window.removeEventListener('touchend', this.onTouchEnd);
    }
  }
}
