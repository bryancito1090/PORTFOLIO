import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, signal, computed, inject, ViewChild, ElementRef } from '@angular/core';
import { Hero3dComponent } from '../hero-3d/hero-3d.component';
import { RetroOsComponent } from '../retro-os/retro-os.component';
import { TerminalComponent } from '../terminal/terminal.component';
import { FeaturedProjectsComponent } from '../featured-projects/featured-projects/featured-projects.component';
import { ContactSectionComponent } from '../contact-section/contact-section.component';
import { TechnicalProfileComponent } from '../technical-profile/technical-profile.component';
import { IncidentSimulatorComponent } from '../incident-simulator/incident-simulator.component';
import { ChatBotComponent } from '../chat-bot/chat-bot.component';
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
    IncidentSimulatorComponent,
    ChatBotComponent
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
  private touchStartAtTop = false;
  private touchStartAtBottom = false;
  private wheelDeltaAccum = 0;
  private wheelGestureArmed = false;
  private lastWheelAt = 0;
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

    if (typeof document !== 'undefined') {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    }

    if (this.transitionTimer) clearTimeout(this.transitionTimer);

    // Initial phase: show curtain and animated logo
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

        if (entryPosition === 'bottom') {
          const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
          window.scrollTo({ top: maxScroll, behavior: 'instant' });
        } else {
          window.scrollTo({ top: 0, behavior: 'instant' });
        }
      }

      // Appreciate the animated logo for a full animation cycle before smoothly fading out
      setTimeout(() => {
        this.isCurtainVisible.set(false);
        if (typeof document !== 'undefined') {
          document.documentElement.style.overflow = '';
          document.body.style.overflow = '';
        }

        if (typeof window !== 'undefined') {
          if (entryPosition === 'bottom') {
            const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
            window.scrollTo({ top: maxScroll, behavior: 'instant' });
          } else {
            window.scrollTo({ top: 0, behavior: 'instant' });
          }
        }

        setTimeout(() => {
          this.isTransitioning = false;
        }, 300);
      }, 550);
    }, 220);
  }

  private setupScrollTransitions(): void {
    if (typeof window === 'undefined') return;
    window.addEventListener('wheel', this.onWheel, { passive: false });
    window.addEventListener('touchstart', this.onTouchStart, { passive: true });
    window.addEventListener('touchend', this.onTouchEnd, { passive: true });
  }

  private onWheel = (e: WheelEvent): void => {
    if (this.isTransitioning || this.isCurtainVisible()) {
      e.preventDefault();
      return;
    }

    // Ignorar si el usuario está interactuando con un modal
    const target = e.target as HTMLElement | null;
    if (target?.closest('.project-detail-overlay')) {
      return;
    }

    const now = performance.now();
    const isNewGesture = now - this.lastWheelAt > 160;
    this.lastWheelAt = now;

    const scrollY = window.scrollY || window.pageYOffset;
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const goingDown = e.deltaY > 0;
    const atBoundary = goingDown ? scrollY >= maxScroll - 6 : scrollY <= 6;
    const innerCanScroll = atBoundary && this.canInnerScroll(target, goingDown);

    if (innerCanScroll) {
      this.wheelDeltaAccum = 0;
      this.wheelGestureArmed = false;
      return;
    }

    if (isNewGesture) {
      this.wheelDeltaAccum = 0;
      this.wheelGestureArmed = atBoundary;
    }

    if (!this.wheelGestureArmed || !atBoundary) {
      this.wheelDeltaAccum = 0;
      return;
    }

    this.wheelDeltaAccum += e.deltaY;
    if (Math.abs(this.wheelDeltaAccum) > 160) {
      this.wheelDeltaAccum = 0;
      this.wheelGestureArmed = false;
      if (goingDown) {
        this.goToNextSection();
      } else {
        this.goToPrevSection();
      }
    }
  };

  private canInnerScroll(target: HTMLElement | null, goingDown: boolean): boolean {
    for (let el = target; el && el !== document.documentElement; el = el.parentElement) {
      const overflowY = getComputedStyle(el).overflowY;
      if (overflowY !== 'auto' && overflowY !== 'scroll') continue;
      if (goingDown ? el.scrollTop + el.clientHeight < el.scrollHeight - 1 : el.scrollTop > 0) {
        return true;
      }
    }
    return false;
  }

  private onTouchStart = (e: TouchEvent): void => {
    if (this.isTransitioning || this.isCurtainVisible()) return;
    if (e.touches.length > 0) {
      this.touchStartY = e.touches[0].clientY;
      this.touchStartX = e.touches[0].clientX;

      const scrollY = window.scrollY || window.pageYOffset;
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const target = e.target as HTMLElement | null;
      this.touchStartAtTop = scrollY <= 10 && !this.canInnerScroll(target, false);
      this.touchStartAtBottom = scrollY >= maxScroll - 10 && !this.canInnerScroll(target, true);
    }
  };

  private onTouchEnd = (e: TouchEvent): void => {
    if (this.isTransitioning || this.isCurtainVisible() || e.changedTouches.length === 0) return;

    const target = e.target as HTMLElement | null;
    if (target?.closest('.project-detail-overlay')) {
      return;
    }

    const touchEndY = e.changedTouches[0].clientY;
    const touchEndX = e.changedTouches[0].clientX;
    const diffY = this.touchStartY - touchEndY;
    const diffX = this.touchStartX - touchEndX;

    if (Math.abs(diffY) > 50 && Math.abs(diffY) > Math.abs(diffX) * 1.3) {
      if (diffY > 0 && this.touchStartAtBottom) {
        this.goToNextSection();
      } else if (diffY < 0 && this.touchStartAtTop) {
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
    if (this.transitionTimer !== null) {
      clearTimeout(this.transitionTimer);
    }
    if (typeof document !== 'undefined') {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('wheel', this.onWheel);
      window.removeEventListener('touchstart', this.onTouchStart);
      window.removeEventListener('touchend', this.onTouchEnd);
    }
  }
}
