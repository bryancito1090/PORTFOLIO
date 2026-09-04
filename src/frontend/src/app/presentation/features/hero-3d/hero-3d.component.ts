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
  NgZone
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
    this.checkReducedMotion();
    this.preloadImages();
  }

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d', { alpha: false });

    this.intersectionObserver = new IntersectionObserver(([entry]) => {
      this.isVisible = entry.isIntersecting;
      if (this.isVisible && !this.isReducedMotion) {
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

    this.onResize();
    this.onScroll();
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
      } else {
        this.startAnimationLoop();
      }
    });
  }

  private preloadImages(): void {
    let loaded = 0;

    const firstImg = new Image();
    firstImg.src = this.getFramePath(1);
    firstImg.onload = () => {
      this.images[1] = firstImg;
      loaded++;
      this.renderFrame(1);

      for (let i = 2; i <= TOTAL_FRAMES; i++) {
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
    if (!this.isVisible || !this.containerRef || this.isReducedMotion) return;

    const container = this.containerRef.nativeElement;
    const rect = container.getBoundingClientRect();
    const scrollableDistance = container.offsetHeight - window.innerHeight;

    if (scrollableDistance <= 0) return;

    const rawProgress = -rect.top / scrollableDistance;
    const progress = Math.min(Math.max(rawProgress, 0), 1);
    this.targetFrame = Math.min(Math.max(1, 1 + progress * (TOTAL_FRAMES - 1)), TOTAL_FRAMES);

    this.startAnimationLoop();
  };

  private onResize = (): void => {
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
