import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { I18nService } from '../../../application/services/i18n.service';

export interface ProjectCardData {
  readonly id: string;
  readonly code: string;
  readonly title: string;
  readonly subtitle: string;
  readonly institution: string;
  readonly description: string;
  readonly impact: string;
  readonly tags: readonly string[];
  readonly imageUrl?: string;
  readonly accentColor: string;
}

@Component({
  selector: 'app-featured-projects',
  standalone: true,
  templateUrl: './featured-projects.component.html',
  styleUrl: './featured-projects.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeaturedProjectsComponent {
  protected readonly i18n = inject(I18nService);

  // Proyectos extraídos directamente de la hoja de vida (CV) de Bryan Baño con soporte i18n
  protected readonly projects = computed<ProjectCardData[]>(() => {
    const t = this.i18n.t();
    return [
      {
        id: 'siplece',
        code: 'PRJ-01',
        title: 'SIPLECE',
        subtitle: t.prj1Subtitle,
        institution: 'IST Mayor Pedro Traversari',
        description: t.prj1Desc,
        impact: t.prj1Impact,
        tags: ['Angular', '.NET 8', 'MySQL', 'JWT', 'SharePoint'],
        imageUrl: 'assets/images/projects/siplece.webp',
        accentColor: '#7dcfff'
      },
      {
        id: 'vita',
        code: 'PRJ-02',
        title: 'VITA Automotriz',
        subtitle: t.prj2Subtitle,
        institution: t.prj2Institution,
        description: t.prj2Desc,
        impact: t.prj2Impact,
        tags: ['Angular', '.NET 8', 'MySQL', 'REST API'],
        imageUrl: 'assets/images/projects/vita.webp',
        accentColor: '#9ece6a'
      },
      {
        id: 'ammi',
        code: 'PRJ-03',
        title: 'Ammi-Online',
        subtitle: t.prj3Subtitle,
        institution: t.prj3Institution,
        description: t.prj3Desc,
        impact: t.prj3Impact,
        tags: ['Angular', '.NET 8', 'MySQL', 'Clean Arch'],
        imageUrl: 'assets/images/projects/ammi.webp',
        accentColor: '#bb9af7'
      }
    ];
  });

  // Manejo de fallback elegante si el usuario aún no ha colocado los archivos de imagen
  protected readonly imageErrors = signal<Record<string, boolean>>({});

  onImageError(projectId: string): void {
    this.imageErrors.update(curr => ({ ...curr, [projectId]: true }));
  }
}
