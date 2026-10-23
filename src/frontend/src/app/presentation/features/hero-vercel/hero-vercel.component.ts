import { Component, ChangeDetectionStrategy, output, inject } from '@angular/core';
import { I18nService } from '../../../application/services/i18n.service';
import { TechStackStripComponent } from '../../shared/components/tech-stack-strip/tech-stack-strip.component';

@Component({
  selector: 'app-hero-vercel',
  standalone: true,
  imports: [TechStackStripComponent],
  templateUrl: './hero-vercel.component.html',
  styleUrl: './hero-vercel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroVercelComponent {
  protected readonly i18n = inject(I18nService);

  readonly explore = output<void>();
  readonly terminal = output<void>();
  readonly contact = output<void>();
}
