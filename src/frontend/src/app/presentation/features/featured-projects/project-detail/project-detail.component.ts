import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { I18nService } from '../../../../application/services/i18n.service';
import { ProjectCardData } from '../featured-projects/featured-projects.component';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectDetailComponent {
  protected readonly i18n = inject(I18nService);

  @Input() project: ProjectCardData | null = null;

  @Output() close = new EventEmitter<void>();

  protected onClose(): void {
    this.close.emit();
  }
}
