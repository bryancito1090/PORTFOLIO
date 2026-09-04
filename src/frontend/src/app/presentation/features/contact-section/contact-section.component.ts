import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  ElementRef,
  ViewChild,
  OnInit,
  AfterViewInit,
  OnDestroy
} from '@angular/core';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators
} from '@angular/forms';
import { I18nService } from '../../../application/services/i18n.service';

interface DigitalRainColumn {
  x: number;
  y: number;
  speed: number;
  length: number;
  opacity: number;
  characters: string[];
}

const BINARY_CHARS = '01';
const HEX_CHARS = '0123456789ABCDEF';
const CODE_CHARS = '{}[]()<>&|/\\:;=+-_*#$%@?!~^';
const TERM_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

@Component({
  selector: 'app-contact-section',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './contact-section.component.html',
  styleUrl: './contact-section.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactSectionComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('rainCanvas') private readonly rainCanvas?: ElementRef<HTMLCanvasElement>;

  protected readonly i18n = inject(I18nService);

  // Estado reactivo del formulario con Signals
  protected readonly isSubmitting = signal(false);
  protected readonly isSuccess = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  // Definición del FormGroup reactivo tipado
  protected readonly contactForm = new FormGroup({
    fullNameOrCompany: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)]
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email]
    }),
    phone: new FormControl('', {
      nonNullable: true
    }),
    serviceType: new FormControl('', {
      nonNullable: true
    }),
    projectDetails: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(10)]
    })
  });

  private readonly columns: DigitalRainColumn[] = [];
  private context?: CanvasRenderingContext2D;
  private animationFrameId?: number;
  private intersectionObserver?: IntersectionObserver;
  private resizeObserver?: ResizeObserver;
  private motionQuery?: MediaQueryList;
  private isVisible = true;
  private isReducedMotion = false;
  private lastFrameTime = 0;

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (!this.rainCanvas) return;

    const canvas = this.rainCanvas.nativeElement;
    this.context = canvas.getContext('2d') ?? undefined;
    if (!this.context) return;

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
    if (!this.rainCanvas) return;

    const canvas = this.rainCanvas.nativeElement;
    const parent = canvas.parentElement;
    const bounds = parent ? parent.getBoundingClientRect() : canvas.getBoundingClientRect();
    const width = Math.max(bounds.width, window.innerWidth || 320);
    const height = Math.max(bounds.height, 700);
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.max(1, Math.floor(width * pixelRatio));
    canvas.height = Math.max(1, Math.floor(height * pixelRatio));
    this.context?.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    this.createColumns(width, height);
    this.draw();
  }

  private createColumns(width: number, height: number): void {
    const fontSize = Math.max(14, Math.min(20, width / 58));
    const columnCount = Math.max(24, Math.floor(width / (fontSize * 0.72)));
    this.columns.length = 0;

    for (let index = 0; index < columnCount; index += 1) {
      const length = Math.floor(Math.random() * 25) + 14;
      this.columns.push({
        x: (index / columnCount) * width + Math.random() * fontSize * 0.6,
        y: -Math.random() * (height * 0.9) - length * fontSize,
        speed: Math.floor(Math.random() * 130) + 150,
        length,
        opacity: 0.25 + Math.random() * 0.65,
        characters: Array.from({ length }, () => this.randomCharacter())
      });
    }
  }

  private update(deltaSeconds: number): void {
    if (!this.rainCanvas) return;
    const parent = this.rainCanvas.nativeElement.parentElement;
    const height = parent ? parent.clientHeight : this.rainCanvas.nativeElement.clientHeight;
    const width = parent ? parent.clientWidth : this.rainCanvas.nativeElement.clientWidth;
    const fontSize = Math.max(14, Math.min(20, width / 58));

    for (const column of this.columns) {
      column.y += column.speed * deltaSeconds;
      if (column.y - column.length * fontSize > height) {
        column.y = -Math.random() * height * 0.75 - column.length * fontSize;
        column.speed = Math.floor(Math.random() * 130) + 150;
        column.length = Math.floor(Math.random() * 25) + 14;
        column.opacity = 0.25 + Math.random() * 0.65;
        column.characters = Array.from({ length: column.length }, () => this.randomCharacter());
      }
    }
  }

  private draw(): void {
    if (!this.rainCanvas || !this.context) return;

    const canvas = this.rainCanvas.nativeElement;
    const parent = canvas.parentElement;
    const width = parent ? parent.clientWidth : canvas.clientWidth;
    const height = parent ? parent.clientHeight : canvas.clientHeight;
    const fontSize = Math.max(14, Math.min(20, width / 58));

    this.context.clearRect(0, 0, width, height);
    this.context.font = `${fontSize}px monospace`;
    this.context.textAlign = 'center';
    this.context.textBaseline = 'top';
    this.context.shadowBlur = 0;

    for (const column of this.columns) {
      for (let i = 0; i < column.characters.length; i++) {
        const charY = column.y + i * fontSize;
        if (charY < -fontSize || charY > height) continue;

        const isHead = i === 0;
        const isHighlight = i === Math.floor(column.length * 0.35) && column.opacity > 0.4;
        const trailAlpha = column.opacity * (1 - i / (column.length * 1.15));
        const edgeFade = Math.min(1, Math.max(0, (height - charY) / (fontSize * 5)));
        const alpha = Math.max(0, trailAlpha * edgeFade);

        if (alpha <= 0) continue;

        this.context.fillStyle = isHead
          ? `rgba(220, 255, 226, ${Math.min(1, alpha + 0.35)})`
          : isHighlight
            ? `rgba(80, 255, 126, ${alpha})`
            : `rgba(18, 174, 78, ${alpha})`;

        if (isHead || isHighlight) {
          this.context.shadowColor = 'rgba(37, 255, 104, 0.85)';
          this.context.shadowBlur = isHead ? 9 : 5;
        }

        this.context.fillText(column.characters[i], column.x, charY);
        this.context.shadowBlur = 0;
      }
    }
  }

  private randomCharacter(): string {
    const r = Math.random();
    const set = r < 0.48 ? BINARY_CHARS : r < 0.68 ? HEX_CHARS : r < 0.72 ? CODE_CHARS : TERM_CHARS;
    return set[Math.floor(Math.random() * set.length)];
  }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      this.errorMessage.set(this.i18n.t().contactFormError);
      return;
    }

    this.errorMessage.set(null);
    this.isSubmitting.set(true);

    setTimeout(() => {
      this.isSubmitting.set(false);
      this.isSuccess.set(true);
    }, 600);
  }

  resetForm(): void {
    this.contactForm.reset();
    this.isSuccess.set(false);
    this.errorMessage.set(null);
  }
}
