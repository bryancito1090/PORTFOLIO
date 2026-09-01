import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { Hero3dComponent } from '../hero-3d/hero-3d.component';
import { RetroOsComponent } from '../retro-os/retro-os.component';
import { TerminalComponent } from '../terminal/terminal.component';
import { FeaturedProjectsComponent } from '../featured-projects/featured-projects/featured-projects.component';
import { ContactSectionComponent } from '../contact-section/contact-section.component';
import { TechnicalProfileComponent } from '../technical-profile/technical-profile.component';
import { I18nService } from '../../../application/services/i18n.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    Hero3dComponent,
    RetroOsComponent,
    TerminalComponent,
    FeaturedProjectsComponent,
    ContactSectionComponent,
    TechnicalProfileComponent
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingComponent implements OnInit, OnDestroy {
  protected readonly i18n = inject(I18nService);
  protected readonly currentYear = signal(new Date().getFullYear());
  protected readonly currentTime = signal<string>('');

  private clockInterval: ReturnType<typeof setInterval> | null = null;
  private readonly timeFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'America/Guayaquil',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  ngOnInit(): void {
    this.updateClock();
    this.clockInterval = setInterval(() => this.updateClock(), 1000);
  }

  private updateClock(): void {
    this.currentTime.set(this.timeFormatter.format(new Date()));
  }

  ngOnDestroy(): void {
    if (this.clockInterval !== null) {
      clearInterval(this.clockInterval);
    }
  }
}
