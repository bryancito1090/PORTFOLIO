import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
  signal,
  inject,
  NgZone,
  input
} from '@angular/core';
import { I18nService } from '../../../application/services/i18n.service';

const TOTAL_FRAMES = 240;
const LERP_FACTOR = 0.09;

@Component({
  selector: 'app-hero-3d',
  standalone: true,
  templateUrl: './hero-3d.component.html',
  styleUrl: './hero-3d.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Hero3dComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly initialPosition = input<'top' | 'bottom'>('top');

  @ViewChild('scrollContainer') private containerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('canvas') private canvasRef!: ElementRef<HTMLCanvasElement>;

  protected readonly i18n = inject(I18nService);
  private readonly ngZone = inject(NgZone);

  // Señales reactivas: Fase activa de tarjetas laterales y estado de carga
  protected readonly activePhase = signal<number>(1);
  protected readonly loadProgress = signal<number>(0);
  protected readonly isLoaded = signal<boolean>(false);

  private ctx: CanvasRenderingContext2D | null = null;
  private readonly images: HTMLImageElement[] = new Array(TOTAL_FRAMES + 1);
  private targetFrame = 1;
  private currentInterpolatedFrame = 1;
  private lastRenderedFrame = 0;
  private isVisible = true;
  private isReducedMotion = false;
  private isLoopRunning = false;
  private animationFrameId: number | null = null;
  private intersectionObserver?: IntersectionObserver;
  private mediaQueryList?: MediaQueryList;

  ngOnInit(): void {
    if (this.initialPosition() === 'bottom') {
      this.targetFrame = TOTAL_FRAMES;
      this.currentInterpolatedFrame = TOTAL_FRAMES;
      this.lastRenderedFrame = TOTAL_FRAMES;
      this.activePhase.set(3);
    }

    this.checkReducedMotion();
    if (typeof window !== 'undefined' && window.innerWidth <= 900) {
      this.isLoaded.set(true);
    } else {
      this.preloadImages();
    }
  }

  ngAfterViewInit(): void {
    if (!this.canvasRef || !this.containerRef) {
      this.isLoaded.set(true);
      return;
    }

    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d', { alpha: false });

    this.intersectionObserver = new IntersectionObserver(([entry]) => {
      this.isVisible = entry.isIntersecting;
      if (this.isVisible && !this.isReducedMotion && typeof window !== 'undefined' && window.innerWidth > 900) {
        this.startAnimationLoop();
      } else if (this.animationFrameId !== null) {
        cancelAnimationFrame(this.animationFrameId);
        this.isLoopRunning = false;
      }
    }, { threshold: 0.02 });

    this.intersectionObserver.observe(this.containerRef.nativeElement);

    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.onScroll, { passive: true });
      window.addEventListener('resize', this.onResize, { passive: true });
    });

    if (typeof window !== 'undefined' && window.innerWidth > 900) {
      const container = this.containerRef.nativeElement;
      const scrollableDistance = container.offsetHeight - window.innerHeight;

      if (this.initialPosition() === 'bottom' && scrollableDistance > 0) {
        window.scrollTo({ top: scrollableDistance, behavior: 'instant' });
        this.targetFrame = TOTAL_FRAMES;
        this.currentInterpolatedFrame = TOTAL_FRAMES;
        this.lastRenderedFrame = TOTAL_FRAMES;
        this.activePhase.set(3);
      } else if (this.initialPosition() === 'top') {
        window.scrollTo({ top: 0, behavior: 'instant' });
        this.targetFrame = 1;
        this.currentInterpolatedFrame = 1;
        this.lastRenderedFrame = 1;
        this.activePhase.set(1);
      }

      this.onResize();
      this.renderFrame(Math.round(this.currentInterpolatedFrame));
    }
  }

  private checkReducedMotion(): void {
    this.mediaQueryList = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.isReducedMotion = this.mediaQueryList.matches;

    this.mediaQueryList.addEventListener('change', (e) => {
      this.isReducedMotion = e.matches;
      if (this.isReducedMotion) {
        if (this.animationFrameId !== null) {
          cancelAnimationFrame(this.animationFrameId);
          this.isLoopRunning = false;
        }
        this.renderFrame(1);
      } else if (typeof window !== 'undefined' && window.innerWidth > 900) {
        this.startAnimationLoop();
      }
    });
  }

  private preloadImages(): void {
    let loaded = 0;
    const startFrame = this.initialPosition() === 'bottom' ? TOTAL_FRAMES : 1;

    const firstImg = new Image();
    firstImg.src = this.getFramePath(startFrame);
    firstImg.onload = () => {
      this.images[startFrame] = firstImg;
      loaded++;
      this.renderFrame(startFrame);

      for (let i = 1; i <= TOTAL_FRAMES; i++) {
        if (i === startFrame) continue;
        const img = new Image();
        img.src = this.getFramePath(i);
        img.onload = () => {
          this.images[i] = img;
          loaded++;
          if (loaded % 12 === 0 || loaded === TOTAL_FRAMES) {
            const pct = Math.round((loaded / TOTAL_FRAMES) * 100);
            this.loadProgress.set(pct);
            if (loaded === TOTAL_FRAMES) {
              this.isLoaded.set(true);
            }
          }
        };
        img.onerror = () => {
          loaded++;
        };
      }
    };
  }

  private getFramePath(index: number): string {
    const padded = String(index).padStart(3, '0');
    return `/assets/images/thinkpad-sequence/ezgif-frame-${padded}.jpg`;
  }

  private onScroll = (): void => {
    if (typeof window !== 'undefined' && window.innerWidth <= 900) return;
    if (!this.isVisible || !this.containerRef || this.isReducedMotion) return;

    const container = this.containerRef.nativeElement;
    const rect = container.getBoundingClientRect();
    const scrollableDistance = container.offsetHeight - window.innerHeight;

    if (scrollableDistance <= 0) return;

    const rawProgress = -rect.top / scrollableDistance;
    const progress = Math.min(Math.max(rawProgress, 0), 1);
    this.targetFrame = Math.min(Math.max(1, 1 + progress * (TOTAL_FRAMES - 1)), TOTAL_FRAMES);

    // Si ocurre un salto grande de posición inicial, sincronizar frame directamente sin animación forzada
    const jumpDiff = Math.abs(this.targetFrame - this.currentInterpolatedFrame);
    if (jumpDiff > 40 && !this.isLoopRunning) {
      this.currentInterpolatedFrame = this.targetFrame;
      this.renderFrame(Math.round(this.targetFrame));
      this.updateActivePhase(this.targetFrame);
      return;
    }

    this.startAnimationLoop();
  };

  private onResize = (): void => {
    if (typeof window !== 'undefined' && window.innerWidth <= 900) {
      if (this.animationFrameId !== null) {
        cancelAnimationFrame(this.animationFrameId);
        this.isLoopRunning = false;
      }
      return;
    }
    this.resizeCanvas();
    this.renderFrame(Math.round(this.currentInterpolatedFrame));
  };

  private startAnimationLoop(): void {
    if (this.isLoopRunning || !this.isVisible || this.isReducedMotion) return;
    this.isLoopRunning = true;

    this.ngZone.runOutsideAngular(() => {
      const loop = () => {
        if (!this.isVisible || this.isReducedMotion) {
          this.isLoopRunning = false;
          return;
        }

        const diff = this.targetFrame - this.currentInterpolatedFrame;
        if (Math.abs(diff) > 0.005) {
          this.currentInterpolatedFrame += diff * LERP_FACTOR;
        } else {
          this.currentInterpolatedFrame = this.targetFrame;
        }

        const frameToDraw = Math.round(this.currentInterpolatedFrame);

        if (frameToDraw !== this.lastRenderedFrame) {
          this.renderFrame(frameToDraw);
          this.lastRenderedFrame = frameToDraw;
          this.updateActivePhase(this.currentInterpolatedFrame);
        }

        if (Math.abs(this.targetFrame - this.currentInterpolatedFrame) > 0.01) {
          this.animationFrameId = requestAnimationFrame(loop);
        } else {
          this.isLoopRunning = false;
        }
      };

      this.animationFrameId = requestAnimationFrame(loop);
    });
  }

  private updateActivePhase(currentFrame: number): void {
    const progress = (currentFrame - 1) / (TOTAL_FRAMES - 1);
    let phase = 1;

    if (progress < 0.32) {
      phase = 1;
    } else if (progress < 0.65) {
      phase = 2;
    } else if (progress < 0.94) {
      phase = 3;
    } else {
      phase = 0; // Desvanecimiento completo al final del scroll
    }

    if (this.activePhase() !== phase) {
      this.activePhase.set(phase);
    }
  }

  private resizeCanvas(): void {
    if (!this.canvasRef || !this.ctx) return;
    const canvas = this.canvasRef.nativeElement;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const targetW = Math.round(window.innerWidth * dpr);
    const targetH = Math.round(window.innerHeight * dpr);

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }
  }

  private getBestFrame(targetIndex: number): HTMLImageElement | null {
    const rounded = Math.min(Math.max(1, Math.round(targetIndex)), TOTAL_FRAMES);
    if (this.images[rounded]?.complete) return this.images[rounded];

    for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
      const prev = rounded - offset;
      if (prev >= 1 && this.images[prev]?.complete) return this.images[prev];
      const next = rounded + offset;
      if (next <= TOTAL_FRAMES && this.images[next]?.complete) return this.images[next];
    }
    return this.images[1]?.complete ? this.images[1] : null;
  }

  private renderFrame(targetIndex: number): void {
    if (!this.ctx || !this.canvasRef) return;
    this.resizeCanvas();

    const img = this.getBestFrame(targetIndex);
    if (!img || !img.complete) return;

    const canvas = this.canvasRef.nativeElement;
    const ctx = this.ctx;

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const imgAspect = 16 / 9;
    const screenAspect = canvas.width / canvas.height;
    let drawW: number;
    let drawH: number;
    let offsetX = 0;
    let offsetY = 0;

    if (screenAspect > imgAspect) {
      drawW = canvas.width;
      drawH = canvas.width / imgAspect;
      offsetY = (canvas.height - drawH) / 2;
    } else {
      drawW = canvas.width;
      drawH = canvas.width / imgAspect;
      offsetX = 0;
      offsetY = (canvas.height - drawH) / 2;
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onResize);
    this.intersectionObserver?.disconnect();
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}
