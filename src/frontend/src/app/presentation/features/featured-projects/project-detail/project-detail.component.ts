import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
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

  protected readonly activeImageIndex = signal<number>(0);
  protected readonly imageErrors = signal<Record<string, boolean>>({});

  protected onClose(): void {
    this.close.emit();
  }

  protected selectImage(index: number): void {
    this.activeImageIndex.set(index);
  }

  protected onImageError(imagePath: string): void {
    this.imageErrors.update(curr => ({ ...curr, [imagePath]: true }));
  }

  protected getCurrentImage(): string | null {
    if (!this.project) return null;
    const images = this.project.images;
    if (images && images.length > this.activeImageIndex()) {
      return images[this.activeImageIndex()];
    }
    return this.project.imageUrl ?? null;
  }
}
