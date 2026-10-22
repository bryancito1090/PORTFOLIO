import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  AfterViewInit,
  OnDestroy,
  signal,
  inject,
  ElementRef,
  ViewChild
} from '@angular/core';
import { Hero3dComponent } from '../hero-3d/hero-3d.component';
import { RetroOsComponent } from '../retro-os/retro-os.component';
import { TerminalComponent } from '../terminal/terminal.component';
import { FeaturedProjectsComponent } from '../featured-projects/featured-projects/featured-projects.component';
import { ContactSectionComponent } from '../contact-section/contact-section.component';
import { TechnicalProfileComponent } from '../technical-profile/technical-profile.component';
import { IncidentSimulatorComponent } from '../incident-simulator/incident-simulator.component';
import { ChatBotComponent } from '../chat-bot/chat-bot.component';
import { TelemetryHudComponent } from '../telemetry-hud/telemetry-hud.component';
import { MatrixRainComponent } from '../../shared/components/matrix-rain/matrix-rain.component';
import { HeroVercelComponent } from '../hero-vercel/hero-vercel.component';
import { TechStackStripComponent } from '../../shared/components/tech-stack-strip/tech-stack-strip.component';
import { I18nService } from '../../../application/services/i18n.service';
import { ThemeService } from '../../../application/services/theme.service';

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
    ChatBotComponent,
    TelemetryHudComponent,
    MatrixRainComponent,
    HeroVercelComponent,
    TechStackStripComponent
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingComponent implements OnInit, AfterViewInit, OnDestroy {
  protected readonly i18n = inject(I18nService);
  protected readonly themeService = inject(ThemeService);
  protected readonly currentYear = signal(new Date().getFullYear());
  protected readonly currentTime = signal<string>('');
  protected readonly activeSection = signal<LandingSection>('hero');

  private clockInterval: ReturnType<typeof setInterval> | null = null;
  private sectionObserver?: IntersectionObserver;
  private isUserClickScrolling = false;
  private clickScrollTimer: ReturnType<typeof setTimeout> | null = null;

  @ViewChild('navContainer') private navContainerRef?: ElementRef<HTMLElement>;

  ngOnInit(): void {
    this.updateClock();
    this.clockInterval = setInterval(() => this.updateClock(), 1000);
  }

  ngAfterViewInit(): void {
    this.setupIntersectionObserver();
    this.parseInitialHash();
  }

  ngOnDestroy(): void {
    if (this.clockInterval) clearInterval(this.clockInterval);
    if (this.clickScrollTimer) clearTimeout(this.clickScrollTimer);
    if (this.sectionObserver) {
      this.sectionObserver.disconnect();
    }
  }

  scrollToSection(section: LandingSection): void {
    this.activeSection.set(section);
    this.isUserClickScrolling = true;
    if (this.clickScrollTimer) clearTimeout(this.clickScrollTimer);
    this.clickScrollTimer = setTimeout(() => {
      this.isUserClickScrolling = false;
    }, 900);

    if (typeof window === 'undefined') return;

    if (section === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById(section);
      if (el) {
        const headerOffset = 64;
        const elementPosition = el.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }
    }

    const hash = section === 'hero' ? '' : `#${section}`;
    const url = window.location.pathname + window.location.search + hash;
    window.history.replaceState(null, '', url);
    this.scrollActiveNavIntoView(section);
  }

  private setupIntersectionObserver(): void {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    this.sectionObserver = new IntersectionObserver((entries) => {
      if (this.isUserClickScrolling) return;

      for (const entry of entries) {
        if (entry.isIntersecting) {
          const id = entry.target.id as LandingSection;
          if (LANDING_SECTIONS.includes(id)) {
            this.activeSection.set(id);
            const hash = id === 'hero' ? '' : `#${id}`;
            window.history.replaceState(null, '', window.location.pathname + window.location.search + hash);
            this.scrollActiveNavIntoView(id);
          }
        }
      }
    }, {
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    });

    LANDING_SECTIONS.forEach(id => {
      const el = document.getElementById(id);
      if (el) this.sectionObserver?.observe(el);
    });
  }

  private parseInitialHash(): void {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash.replace('#', '') as LandingSection;
    if (LANDING_SECTIONS.includes(hash)) {
      setTimeout(() => this.scrollToSection(hash), 120);
    }
  }

  private scrollActiveNavIntoView(section: LandingSection): void {
    if (!this.navContainerRef) return;
    const navEl = this.navContainerRef.nativeElement;
    const activeBtn = navEl.querySelector(`[data-nav="${section}"]`) as HTMLElement | null;
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }

  private updateClock(): void {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'America/Guayaquil',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    this.currentTime.set(formatter.format(new Date()));
  }
}
