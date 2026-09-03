import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  OnDestroy,
  OnInit,
  signal,
  ViewChild
} from '@angular/core';
import { I18nService } from '../../../application/services/i18n.service';

interface DigitalRainColumn {
  x: number;
  y: number;
  speed: number;
  length: number;
  opacity: number;
  characters: string[];
}

const BINARY_CHARACTERS = '01';
const HEX_CHARACTERS = '0123456789ABCDEF';
const CODE_CHARACTERS = '{}[]()<>&|/\\:;=+-_*#$%@?!~^';
const TERMINAL_CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

@Component({
  selector: 'app-technical-profile',
  standalone: true,
  templateUrl: './technical-profile.component.html',
  styleUrl: './technical-profile.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TechnicalProfileComponent implements AfterViewInit, OnDestroy, OnInit {
  @ViewChild('rainCanvas') private readonly rainCanvas?: ElementRef<HTMLCanvasElement>;

  protected readonly i18n = inject(I18nService);
  readonly showProfile = input(true);
  readonly showMatrix = input(true);
  protected readonly asciiArt = signal('');
  protected readonly asciiLoadError = signal(false);
  protected readonly aboutParagraphs = computed(() =>
    this.i18n.t().tpAboutDescription.split('\n\n').filter((p) => p.trim().length > 0)
  );
  private readonly columns: DigitalRainColumn[] = [];
  private context?: CanvasRenderingContext2D;
  private animationFrameId?: number;
  private intersectionObserver?: IntersectionObserver;
  private resizeObserver?: ResizeObserver;
  private motionQuery?: MediaQueryList;
  private isVisible = true;
  private isReducedMotion = false;
  private lastFrameTime = 0;

  ngOnInit(): void {
    if (!this.showProfile()) {
      return;
    }

    this.loadTextAsset('assets/portfolio.txt')
      .then((portrait) => this.asciiArt.set(portrait))
      .catch(() => this.asciiLoadError.set(true));
  }

  private loadTextAsset(path: string): Promise<string> {
    return fetch(path).then((response) => {
      if (!response.ok) {
        throw new Error(`ASCII asset request failed: ${response.status}`);
      }

      return response.text();
    });
  }

  ngAfterViewInit(): void {
    if (!this.showMatrix() || !this.rainCanvas) {
      return;
    }

    const canvas = this.rainCanvas.nativeElement;
    this.context = canvas.getContext('2d') ?? undefined;
    if (!this.context) {
      return;
    }

    this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.isReducedMotion = this.motionQuery.matches;
    this.motionQuery.addEventListener('change', this.onMotionPreferenceChange);

    this.resizeObserver = new ResizeObserver(() => this.resizeCanvas());
    this.resizeObserver.observe(canvas.parentElement ?? canvas);

    this.intersectionObserver = new IntersectionObserver(([entry]) => {
      this.isVisible = entry.isIntersecting;
      if (this.isVisible && !this.isReducedMotion && this.animationFrameId === undefined) {
        this.lastFrameTime = 0;
        this.animationFrameId = requestAnimationFrame(this.animate);
      }
    }, { threshold: 0.05 });
    this.intersectionObserver.observe(canvas);

    this.resizeCanvas();
    if (!this.isReducedMotion) {
      this.animationFrameId = requestAnimationFrame(this.animate);
    }
  }

  ngOnDestroy(): void {
    if (this.animationFrameId !== undefined) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.motionQuery?.removeEventListener('change', this.onMotionPreferenceChange);
    this.intersectionObserver?.disconnect();
    this.resizeObserver?.disconnect();
  }

  private readonly onMotionPreferenceChange = (event: MediaQueryListEvent): void => {
    this.isReducedMotion = event.matches;
    if (this.isReducedMotion) {
      if (this.animationFrameId !== undefined) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = undefined;
      }
      this.draw();
      return;
    }

    if (this.isVisible && this.animationFrameId === undefined) {
      this.lastFrameTime = 0;
      this.animationFrameId = requestAnimationFrame(this.animate);
    }
  };

  private readonly animate = (timestamp: number): void => {
    this.animationFrameId = undefined;
    if (!this.isVisible || this.isReducedMotion) {
      return;
    }

    const elapsed = this.lastFrameTime === 0 ? 0 : Math.min(timestamp - this.lastFrameTime, 50);
    this.lastFrameTime = timestamp;
    this.update(elapsed / 1000);
    this.draw();
    this.animationFrameId = requestAnimationFrame(this.animate);
  };

  private resizeCanvas(): void {
    if (!this.rainCanvas) {
      return;
    }

    const canvas = this.rainCanvas.nativeElement;
    const bounds = canvas.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(bounds.width * pixelRatio));
    canvas.height = Math.max(1, Math.floor(bounds.height * pixelRatio));
    this.context?.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    this.createColumns(bounds.width, bounds.height);
    this.draw();
  }

  private createColumns(width: number, height: number): void {
    const fontSize = Math.max(14, Math.min(20, width / 58));
    const columnCount = Math.max(24, Math.floor(width / (fontSize * 0.72)));
    this.columns.length = 0;

    for (let index = 0; index < columnCount; index += 1) {
      const length = this.randomInteger(14, 38);
      this.columns.push({
        x: (index / columnCount) * width + Math.random() * fontSize * 0.6,
        y: Math.random() * height * 1.4 - height,
        speed: this.randomInteger(150, 280),
        length,
        opacity: 0.16 + Math.random() * 0.68,
        characters: Array.from({ length }, () => this.randomCharacter())
      });
    }
  }

  private update(deltaSeconds: number): void {
    if (!this.rainCanvas) {
      return;
    }

    const height = this.rainCanvas.nativeElement.clientHeight;
    const fontSize = Math.max(14, Math.min(20, this.rainCanvas.nativeElement.clientWidth / 58));

    for (const column of this.columns) {
      column.y += column.speed * deltaSeconds;
      if (column.y - column.length * fontSize > height) {
        column.y = -Math.random() * height * 0.75 - column.length * fontSize;
        column.speed = this.randomInteger(150, 280);
        column.length = this.randomInteger(14, 38);
        column.opacity = 0.16 + Math.random() * 0.68;
        column.characters = Array.from({ length: column.length }, () => this.randomCharacter());
      }
    }
  }

  private draw(): void {
    if (!this.rainCanvas) {
      return;
    }

    const canvas = this.rainCanvas.nativeElement;
    const context = this.context;
    if (!context) {
      return;
    }

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const fontSize = Math.max(14, Math.min(20, width / 58));
    context.clearRect(0, 0, width, height);
    context.font = `${fontSize}px ${getComputedStyle(canvas).fontFamily}`;
    context.textAlign = 'center';
    context.textBaseline = 'top';
    context.shadowBlur = 0;

    for (const column of this.columns) {
      for (let index = 0; index < column.characters.length; index += 1) {
        const characterY = column.y + index * fontSize;
        if (characterY < -fontSize || characterY > height) {
          continue;
        }

        const isHead = index === 0;
        const isHighlight = index === Math.floor(column.length * 0.35) && column.opacity > 0.5;
        const trailAlpha = column.opacity * (1 - index / (column.length * 1.15));
        const edgeFade = Math.min(1, Math.max(0, (height - characterY) / (fontSize * 5)));
        const alpha = Math.max(0, trailAlpha * edgeFade);
        if (alpha === 0) {
          continue;
        }
        context.fillStyle = isHead
          ? `rgba(220, 255, 226, ${Math.min(1, alpha + 0.3)})`
          : isHighlight
            ? `rgba(80, 255, 126, ${alpha})`
            : `rgba(18, 174, 78, ${alpha})`;
        if (isHead || isHighlight) {
          context.shadowColor = 'rgba(37, 255, 104, 0.8)';
          context.shadowBlur = isHead ? 9 : 5;
        }
        context.fillText(column.characters[index], column.x, characterY);
        context.shadowBlur = 0;
      }
    }
  }

  private randomCharacter(): string {
    const characterSet = Math.random() < 0.48
      ? BINARY_CHARACTERS
      : Math.random() < 0.68
        ? HEX_CHARACTERS
        : Math.random() < 0.72
          ? CODE_CHARACTERS
          : TERMINAL_CHARACTERS;

    return characterSet[Math.floor(Math.random() * characterSet.length)];
  }

  private randomInteger(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
