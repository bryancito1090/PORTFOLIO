import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  HostListener
} from '@angular/core';
import { I18nService } from '../../../../application/services/i18n.service';
import { ProjectDetailComponent } from '../project-detail/project-detail.component';

export interface ProjectCardData {
  readonly id: string;
  readonly code: string;
  readonly title: string;
  readonly subtitle: string;
  readonly institution: string;
  readonly description: string;
  readonly impact: string;
  readonly challenge: string;
  readonly solution: string;
  readonly results: readonly string[];
  readonly tags: readonly string[];
  readonly imageUrl?: string;
  readonly images?: readonly string[];
  readonly accentColor: string;
  readonly inDevelopment?: boolean;
}

@Component({
  selector: 'app-featured-projects',
  standalone: true,
  imports: [ProjectDetailComponent],
  templateUrl: './featured-projects.component.html',
  styleUrl: './featured-projects.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeaturedProjectsComponent {
  protected readonly i18n = inject(I18nService);

  // Navegación de cuadrícula limpia con carrusel responsivo
  protected readonly currentIndex = signal<number>(0);
  protected readonly screenCols = signal<number>(
    typeof window !== 'undefined'
      ? window.innerWidth >= 1200
        ? 3
        : window.innerWidth >= 768
          ? 2
          : 1
      : 3
  );

  @HostListener('window:resize')
  onResize(): void {
    if (typeof window === 'undefined') return;
    const w = window.innerWidth;
    const cols = w >= 1200 ? 3 : w >= 768 ? 2 : 1;
    if (this.screenCols() !== cols) {
      this.screenCols.set(cols);
      if (this.currentIndex() > this.maxIndex()) {
        this.currentIndex.set(this.maxIndex());
      }
    }
  }

  // Proyectos reales de Bryan Baño con arquitectura limpia y soporte i18n
  protected readonly projects = computed<ProjectCardData[]>(() => {
    const t = this.i18n.t();
    return [
      {
        id: 'ammi',
        code: 'PRJ-01',
        title: 'Ammi-Online',
        subtitle: t.prj2Subtitle,
        institution: t.prj2Institution,
        description: t.prj2Desc,
        impact: t.prj2Impact,
        challenge: t.prj2Challenge,
        solution: t.prj2Solution,
        results: [t.prj2Result1, t.prj2Result2, t.prj2Result3],
        tags: ['Angular', '.NET 8', 'Clean Arch', 'JWT & RBAC', 'MediatR CQRS'],
        imageUrl: 'assets/images/projects/ammi/ammi1.jpg',
        images: [
          'assets/images/projects/ammi/ammi1.jpg',
          'assets/images/projects/ammi/ammi2.jpg',
          'assets/images/projects/ammi/ammi3.jpg'
        ],
        accentColor: '#9ece6a'
      },
      {
        id: 'vacaciones-rrhh',
        code: 'PRJ-02',
        title: 'Módulo Vacaciones RRHH',
        subtitle: t.prj3Subtitle,
        institution: t.prj3Institution,
        description: t.prj3Desc,
        impact: t.prj3Impact,
        challenge: t.prj3Challenge,
        solution: t.prj3Solution,
        results: [t.prj3Result1, t.prj3Result2, t.prj3Result3],
        tags: ['Angular', '.NET 9', 'Clean Arch', 'JWT & RBAC', 'Algoritmo FIFO', 'Reportes PDF'],
        imageUrl: 'assets/images/projects/vacaciones-rrhh/rrhh1.jpg',
        images: [
          'assets/images/projects/vacaciones-rrhh/rrhh1.jpg',
          'assets/images/projects/vacaciones-rrhh/rrhh2.jpg',
          'assets/images/projects/vacaciones-rrhh/rrhh3.jpg'
        ],
        accentColor: '#e0af68'
      },
      {
        id: 'titulacion',
        code: 'PRJ-03',
        title: 'Sistema de Titulación',
        subtitle: t.prj4Subtitle,
        institution: t.prj4Institution,
        description: t.prj4Desc,
        impact: t.prj4Impact,
        challenge: t.prj4Challenge,
        solution: t.prj4Solution,
        results: [t.prj4Result1, t.prj4Result2, t.prj4Result3],
        tags: ['Angular', '.NET 9', 'Clean Arch', 'JWT & RBAC', 'Gestión de Convocatorias', 'En Desarrollo'],
        imageUrl: 'assets/images/projects/titulacion/tit1.jpg',
        images: [
          'assets/images/projects/titulacion/tit1.jpg',
          'assets/images/projects/titulacion/tit2.jpg',
          'assets/images/projects/titulacion/tit3.jpg'
        ],
        accentColor: '#bb9af7',
        inDevelopment: true
      },
      {
        id: 'siplece',
        code: 'PRJ-04',
        title: 'SIPLECE',
        subtitle: t.prj1Subtitle,
        institution: 'IST Mayor Pedro Traversari',
        description: t.prj1Desc,
        impact: t.prj1Impact,
        challenge: t.prj1Challenge,
        solution: t.prj1Solution,
        results: [t.prj1Result1, t.prj1Result2, t.prj1Result3],
        tags: ['Angular', '.NET 8', 'Clean Arch', 'JWT & RBAC', 'SharePoint'],
        accentColor: '#7dcfff',
        images: [] // Sin imágenes, diseño de ficha de arquitectura
      }
    ];
  });

  // Número de tarjetas visibles según tamaño de pantalla (1 en móvil, 2 en tablet, 3 en desktop)
  protected readonly cardsPerPage = computed(() => this.screenCols());

  // Índice máximo permitido para desplazamiento
  protected readonly maxIndex = computed(() => {
    const total = this.projects().length;
    const perPage = this.cardsPerPage();
    return Math.max(0, total - perPage);
  });

  // Total de páginas / pasos de navegación
  protected readonly totalPages = computed(() => this.maxIndex() + 1);

  // Array de índices para los dots indicadores
  protected readonly pagesArray = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i)
  );

  // Tarjetas visibles en la pantalla en este momento
  protected readonly visibleProjects = computed(() => {
    const start = this.currentIndex();
    const count = this.cardsPerPage();
    return this.projects().slice(start, start + count);
  });

  protected readonly canPrev = computed(() => this.currentIndex() > 0);
  protected readonly canNext = computed(() => this.currentIndex() < this.maxIndex());

  protected prev(): void {
    if (this.canPrev()) {
      this.currentIndex.update(i => i - 1);
    } else {
      this.currentIndex.set(this.maxIndex());
    }
  }

  protected next(): void {
    if (this.canNext()) {
      this.currentIndex.update(i => i + 1);
    } else {
      this.currentIndex.set(0);
    }
  }

  protected goToPage(index: number): void {
    this.currentIndex.set(Math.max(0, Math.min(index, this.maxIndex())));
  }

  protected readonly selectedProjectId = signal<string | null>(null);

  protected readonly selectedProject = computed(() => {
    const selectedId = this.selectedProjectId();
    if (!selectedId) return null;
    return this.projects().find(project => project.id === selectedId) ?? null;
  });

  protected readonly imageErrors = signal<Record<string, boolean>>({});

  protected selectProject(projectId: string): void {
    this.selectedProjectId.set(projectId);
  }

  protected clearSelection(): void {
    this.selectedProjectId.set(null);
  }

  onImageError(imageKey: string): void {
    this.imageErrors.update(curr => ({ ...curr, [imageKey]: true }));
  }
}
