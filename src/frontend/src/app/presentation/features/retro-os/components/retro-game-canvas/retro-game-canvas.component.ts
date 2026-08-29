import {
  Component,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  viewChild,
  ChangeDetectionStrategy,
  signal,
  inject,
  HostListener
} from '@angular/core';
import { RetroAudioService } from '../../../../../application/services/retro-audio.service';
import { RetroScorePort } from '../../../../../domain/ports/retro-score.port';
import { Direction, Point } from '../../../../../domain/models/retro-game.model';
import { I18nService } from '../../../../../application/services/i18n.service';

const GRID_SIZE = 15;
const CELL_SIZE = 20; // 15 * 20 = 300px
const TICK_RATE_MS = 110;

@Component({
  selector: 'app-retro-game-canvas',
  standalone: true,
  templateUrl: './retro-game-canvas.component.html',
  styleUrl: './retro-game-canvas.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RetroGameCanvasComponent implements AfterViewInit, OnDestroy {
  private readonly audio = inject(RetroAudioService);
  private readonly scorePort = inject(RetroScorePort);
  protected readonly i18n = inject(I18nService);

  protected readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('gameCanvas');
  private ctx: CanvasRenderingContext2D | null = null;

  protected readonly score = signal<number>(0);
  protected readonly highScore = signal<number>(0);
  protected readonly isGameOver = signal<boolean>(false);
  protected readonly isPaused = signal<boolean>(false);
  protected readonly isPlaying = signal<boolean>(false);
  protected readonly playerTag = signal<string>('XP');
  protected readonly isScoreSaved = signal<boolean>(false);

  private snake: Point[] = [{ x: 7, y: 7 }, { x: 7, y: 8 }, { x: 7, y: 9 }];
  private direction: Direction = 'UP';
  private nextDirection: Direction = 'UP';
  private food: Point = { x: 7, y: 3 };

  private animationFrameId: number | null = null;
  private lastTickTime = 0;

  ngAfterViewInit(): void {
    const canvas = this.canvasRef()?.nativeElement;
    if (!canvas) return;
    this.ctx = canvas.getContext('2d');
    if (this.ctx) {
      this.ctx.imageSmoothingEnabled = false;
    }
    this.loadHighScore();
    // Dibujar inmediatamente el tablero con la serpiente y la manzana 100% visibles
    this.resetState();
    this.render();
  }

  resetState(): void {
    this.snake = [{ x: 7, y: 7 }, { x: 7, y: 8 }, { x: 7, y: 9 }];
    this.direction = 'UP';
    this.nextDirection = 'UP';
    this.food = { x: 7, y: 3 };
    this.score.set(0);
    this.isGameOver.set(false);
    this.isPaused.set(false);
    this.isPlaying.set(false);
    this.isScoreSaved.set(false);
  }

  startGame(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.resetState();
    this.spawnFood();
    this.isPlaying.set(true);

    this.audio.playClick();
    this.lastTickTime = performance.now();
    this.loop(performance.now());
  }

  onCanvasClick(): void {
    if (!this.isPlaying()) {
      this.startGame();
    } else if (this.isGameOver()) {
      this.startGame();
    }
  }

  togglePause(): void {
    if (!this.isPlaying() || this.isGameOver()) return;
    this.isPaused.update(p => !p);
    this.audio.playClick();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    const validKeys = [
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      'w', 's', 'a', 'd', 'W', 'S', 'A', 'D', ' ', 'Enter'
    ];

    if (!validKeys.includes(event.key)) return;

    // Prevenir el scroll del navegador con las flechas
    event.preventDefault();

    // Si aún no está jugando, iniciar inmediatamente al pulsar cualquier flecha o tecla de control
    if (!this.isPlaying() || this.isGameOver()) {
      this.startGame();
      if (event.key === 'ArrowDown' || event.key === 's' || event.key === 'S') this.nextDirection = 'DOWN';
      if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') this.nextDirection = 'LEFT';
      if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') this.nextDirection = 'RIGHT';
      return;
    }

    switch (event.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        if (this.direction !== 'DOWN') this.nextDirection = 'UP';
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        if (this.direction !== 'UP') this.nextDirection = 'DOWN';
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        if (this.direction !== 'RIGHT') this.nextDirection = 'LEFT';
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        if (this.direction !== 'LEFT') this.nextDirection = 'RIGHT';
        break;
      case ' ':
        this.togglePause();
        break;
    }
  }

  setDirection(newDir: Direction): void {
    if (!this.isPlaying() || this.isGameOver()) {
      this.startGame();
      this.nextDirection = newDir;
      return;
    }
    if (this.isPaused()) return;
    if (newDir === 'UP' && this.direction !== 'DOWN') this.nextDirection = 'UP';
    if (newDir === 'DOWN' && this.direction !== 'UP') this.nextDirection = 'DOWN';
    if (newDir === 'LEFT' && this.direction !== 'RIGHT') this.nextDirection = 'LEFT';
    if (newDir === 'RIGHT' && this.direction !== 'LEFT') this.nextDirection = 'RIGHT';
  }

  private loop = (timestamp: number): void => {
    if (!this.isPlaying()) return;

    if (!this.isPaused() && !this.isGameOver()) {
      if (timestamp - this.lastTickTime >= TICK_RATE_MS) {
        this.update();
        this.lastTickTime = timestamp;
      }
    }
    this.render();
    if (!this.isGameOver()) {
      this.animationFrameId = requestAnimationFrame(this.loop);
    }
  };

  private update(): void {
    this.direction = this.nextDirection;
    const head = { ...this.snake[0] };

    switch (this.direction) {
      case 'UP': head.y -= 1; break;
      case 'DOWN': head.y += 1; break;
      case 'LEFT': head.x -= 1; break;
      case 'RIGHT': head.x += 1; break;
    }

    // Choque con paredes
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      this.triggerGameOver();
      return;
    }

    // Choque con el propio cuerpo
    if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      this.triggerGameOver();
      return;
    }

    this.snake.unshift(head);

    // Comer fruta
    if (head.x === this.food.x && head.y === this.food.y) {
      const nextScore = this.score() + 10;
      this.score.set(nextScore);
      if (nextScore > this.highScore()) {
        this.highScore.set(nextScore);
      }
      this.audio.playSnakeEat();
      this.spawnFood();
    } else {
      this.snake.pop();
    }
  }

  private triggerGameOver(): void {
    this.isGameOver.set(true);
    this.audio.playGameOver();
    this.render(); // Renderizar el estado de choque final
  }

  private spawnFood(): void {
    let valid = false;
    let newX = 0;
    let newY = 0;
    while (!valid) {
      newX = Math.floor(Math.random() * GRID_SIZE);
      newY = Math.floor(Math.random() * GRID_SIZE);
      valid = !this.snake.some(s => s.x === newX && s.y === newY);
    }
    this.food = { x: newX, y: newY };
  }

  private render(): void {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const width = GRID_SIZE * CELL_SIZE; // 300
    const height = GRID_SIZE * CELL_SIZE; // 300

    // Tablero estilo Arcade clásico con cuadrícula nítida
    ctx.fillStyle = '#1c2833';
    ctx.fillRect(0, 0, width, height);

    // Cuadrícula suave de casillas
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if ((r + c) % 2 === 0) {
          ctx.fillStyle = '#212f3d';
          ctx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      }
    }

    // Borde exterior
    ctx.strokeStyle = '#34495e';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, width - 2, height - 2);

    // 1. DIBUJAR FRUTA (Manzana roja con tallo y hoja)
    const fx = this.food.x * CELL_SIZE + CELL_SIZE / 2;
    const fy = this.food.y * CELL_SIZE + CELL_SIZE / 2;

    ctx.save();
    // Brillo de la manzana
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(fx, fy, 8, 0, Math.PI * 2);
    ctx.fill();

    // Tallo marrón y hoja verde
    ctx.fillStyle = '#795548';
    ctx.fillRect(fx - 1, fy - 10, 2, 4);
    ctx.fillStyle = '#2ecc71';
    ctx.beginPath();
    ctx.ellipse(fx + 3, fy - 8, 3, 1.5, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. DIBUJAR SERPIENTE (Verde brillante y con ojos claramente visibles)
    this.snake.forEach((seg, i) => {
      const isHead = i === 0;
      const px = seg.x * CELL_SIZE;
      const py = seg.y * CELL_SIZE;

      ctx.save();
      if (isHead) {
        // Cabeza verde lima destacada
        ctx.fillStyle = this.isGameOver() ? '#e74c3c' : '#2ecc71';
        ctx.fillRect(px + 1, py + 1, CELL_SIZE - 2, CELL_SIZE - 2);

        // Ojos blancos con pupilas negras
        ctx.fillStyle = '#ffffff';
        if (this.direction === 'UP' || this.direction === 'DOWN') {
          ctx.fillRect(px + 3, py + 4, 4, 4);
          ctx.fillRect(px + 13, py + 4, 4, 4);
          ctx.fillStyle = '#000000';
          ctx.fillRect(px + 4, py + (this.direction === 'UP' ? 4 : 6), 2, 2);
          ctx.fillRect(px + 14, py + (this.direction === 'UP' ? 4 : 6), 2, 2);
        } else {
          ctx.fillRect(px + 4, py + 3, 4, 4);
          ctx.fillRect(px + 4, py + 13, 4, 4);
          ctx.fillStyle = '#000000';
          ctx.fillRect(px + (this.direction === 'LEFT' ? 4 : 6), py + 4, 2, 2);
          ctx.fillRect(px + (this.direction === 'LEFT' ? 4 : 6), py + 14, 2, 2);
        }
      } else {
        // Cuerpo verde esmeralda con borde
        ctx.fillStyle = '#27ae60';
        ctx.fillRect(px + 2, py + 2, CELL_SIZE - 4, CELL_SIZE - 4);
        ctx.strokeStyle = '#1e8449';
        ctx.lineWidth = 1;
        ctx.strokeRect(px + 2, py + 2, CELL_SIZE - 4, CELL_SIZE - 4);
      }
      ctx.restore();
    });
  }

  submitScore(): void {
    const finalScore = this.score();
    const tag = (this.playerTag() || 'XP').trim().toUpperCase().slice(0, 4);
    if (finalScore <= 0 || this.isScoreSaved()) return;

    this.scorePort.saveScore({
      playerTag: tag,
      gameCode: 'ZEN_SNAKE',
      score: finalScore
    }).subscribe({
      next: () => {
        this.isScoreSaved.set(true);
        this.audio.playHighScore();
        this.loadHighScore();
      }
    });
  }

  private loadHighScore(): void {
    this.scorePort.getTopScores('ZEN_SNAKE', 1).subscribe({
      next: (scores) => {
        if (scores.length > 0 && scores[0].score > this.highScore()) {
          this.highScore.set(scores[0].score);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.isPlaying.set(false);
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}
