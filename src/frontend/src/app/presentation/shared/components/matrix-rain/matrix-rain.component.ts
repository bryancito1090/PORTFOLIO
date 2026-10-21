import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  NgZone,
  inject
} from '@angular/core';

interface RainColumn {
  x: number;
  y: number;
  speed: number;
  length: number;
  opacity: number;
  characters: string[];
}

const BINARY_CHARS = '01';
const HEX_CHARS = '0123456789ABCDEF';
const KATAKANA_CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
const CODE_CHARS = '{}[]()<>&|/\\:;=+-_*#$%@?!~^';
const TERM_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

@Component({
  selector: 'app-matrix-rain',
  standalone: true,
  templateUrl: './matrix-rain.component.html',
  styleUrl: './matrix-rain.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MatrixRainComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) private readonly canvasRef!: ElementRef<HTMLCanvasElement>;

  private readonly hostRef = inject(ElementRef<HTMLElement>);
  private readonly ngZone = inject(NgZone);

  private readonly columns: RainColumn[] = [];
  private context?: CanvasRenderingContext2D;
  private animationFrameId?: number;
  private intersectionObserver?: IntersectionObserver;
  private resizeObserver?: ResizeObserver;
  private motionQuery?: MediaQueryList;
  private isVisible = false;
  private isReducedMotion = false;
  private lastFrameTime = 0;

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.context = canvas.getContext('2d', { alpha: true }) ?? undefined;
    if (!this.context) return;

    if (typeof window !== 'undefined') {
      this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.isReducedMotion = this.motionQuery.matches;
      this.motionQuery.addEventListener('change', this.onMotionPreferenceChange);
    }

    // Ejecutar fuera de Angular Zone para evitar disparar ciclos de Change Detection en cada frame
    this.ngZone.runOutsideAngular(() => {
      this.resizeObserver = new ResizeObserver(() => this.resizeCanvas());
      this.resizeObserver.observe(this.hostRef.nativeElement);

      this.intersectionObserver = new IntersectionObserver(([entry]) => {
        const wasVisible = this.isVisible;
        this.isVisible = entry.isIntersecting;

        if (this.isVisible && !wasVisible && !this.isReducedMotion) {
          this.lastFrameTime = 0;
          this.startAnimation();
        } else if (!this.isVisible && wasVisible) {
          this.stopAnimation();
        }
      }, { threshold: 0.01 });

      this.intersectionObserver.observe(this.hostRef.nativeElement);
      this.resizeCanvas();
    });
  }

  ngOnDestroy(): void {
    this.stopAnimation();
    this.motionQuery?.removeEventListener('change', this.onMotionPreferenceChange);
    this.intersectionObserver?.disconnect();
    this.resizeObserver?.disconnect();
  }

  private readonly onMotionPreferenceChange = (event: MediaQueryListEvent): void => {
    this.isReducedMotion = event.matches;
    if (this.isReducedMotion) {
      this.stopAnimation();
      this.draw();
    } else if (this.isVisible) {
      this.lastFrameTime = 0;
      this.startAnimation();
    }
  };

  private startAnimation(): void {
    if (this.animationFrameId === undefined && !this.isReducedMotion) {
      this.animationFrameId = requestAnimationFrame(this.animate);
    }
  }

  private stopAnimation(): void {
    if (this.animationFrameId !== undefined) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = undefined;
    }
  }

  private readonly animate = (timestamp: number): void => {
    this.animationFrameId = undefined;
    if (!this.isVisible || this.isReducedMotion) return;

    const elapsed = this.lastFrameTime === 0 ? 0 : Math.min(timestamp - this.lastFrameTime, 50);
    this.lastFrameTime = timestamp;

    this.update(elapsed / 1000);
    this.draw();

    this.animationFrameId = requestAnimationFrame(this.animate);
  };

  private resizeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    const width = window.innerWidth || this.hostRef.nativeElement.clientWidth || 320;
    const height = window.innerHeight || this.hostRef.nativeElement.clientHeight || 600;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.max(1, Math.floor(width * pixelRatio));
    canvas.height = Math.max(1, Math.floor(height * pixelRatio));
    this.context?.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    this.createColumns(width, height);
    this.draw();
  }

  private createColumns(width: number, height: number): void {
    const fontSize = Math.max(13, Math.min(18, width / 64));
    const columnCount = Math.max(30, Math.floor(width / (fontSize * 0.75)));
    this.columns.length = 0;

    for (let index = 0; index < columnCount; index += 1) {
      const length = Math.floor(Math.random() * 26) + 14;
      this.columns.push({
        x: (index / columnCount) * width + Math.random() * fontSize * 0.4,
        y: -Math.random() * (height * 0.95) - length * fontSize,
        speed: Math.floor(Math.random() * 120) + 140,
        length,
        opacity: 0.25 + Math.random() * 0.65,
        characters: Array.from({ length }, () => this.randomCharacter())
      });
    }
  }

  private update(deltaSeconds: number): void {
    const width = window.innerWidth || 320;
    const height = window.innerHeight || 600;
    const fontSize = Math.max(13, Math.min(18, width / 64));

    for (const column of this.columns) {
      column.y += column.speed * deltaSeconds;
      if (column.y - column.length * fontSize > height) {
        column.y = -Math.random() * height * 0.65 - column.length * fontSize;
        column.speed = Math.floor(Math.random() * 120) + 140;
        column.length = Math.floor(Math.random() * 26) + 14;
        column.opacity = 0.25 + Math.random() * 0.65;
        column.characters = Array.from({ length: column.length }, () => this.randomCharacter());
      }
    }
  }

  private draw(): void {
    if (!this.context) return;
    const width = window.innerWidth || 320;
    const height = window.innerHeight || 600;
    const fontSize = Math.max(13, Math.min(18, width / 64));

    this.context.clearRect(0, 0, width, height);
    this.context.font = `${fontSize}px monospace`;
    this.context.textAlign = 'center';
    this.context.textBaseline = 'top';

    for (const column of this.columns) {
      for (let i = 0; i < column.characters.length; i++) {
        const charY = column.y + i * fontSize;
        if (charY < -fontSize || charY > height) continue;

        const isHead = i === 0;
        const isHighlight = i === Math.floor(column.length * 0.3) && column.opacity > 0.4;
        const trailAlpha = column.opacity * (1 - i / (column.length * 1.15));
        const edgeFade = Math.min(1, Math.max(0, (height - charY) / (fontSize * 4)));
        const alpha = Math.max(0, trailAlpha * edgeFade);

        if (alpha <= 0) continue;

        this.context.fillStyle = isHead
          ? `rgba(235, 255, 240, ${Math.min(1, alpha + 0.4)})`
          : isHighlight
            ? `rgba(80, 255, 130, ${alpha})`
            : `rgba(20, 185, 85, ${alpha})`;

        if (isHead || isHighlight) {
          this.context.shadowColor = 'rgba(40, 255, 110, 0.85)';
          this.context.shadowBlur = isHead ? 8 : 4;
        }

        this.context.fillText(column.characters[i], column.x, charY);
        this.context.shadowBlur = 0;
      }
    }
  }

  private randomCharacter(): string {
    const r = Math.random();
    if (r < 0.4) return BINARY_CHARS[Math.floor(Math.random() * BINARY_CHARS.length)];
    if (r < 0.65) return KATAKANA_CHARS[Math.floor(Math.random() * KATAKANA_CHARS.length)];
    if (r < 0.8) return HEX_CHARS[Math.floor(Math.random() * HEX_CHARS.length)];
    if (r < 0.9) return CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
    return TERM_CHARS[Math.floor(Math.random() * TERM_CHARS.length)];
  }
}
