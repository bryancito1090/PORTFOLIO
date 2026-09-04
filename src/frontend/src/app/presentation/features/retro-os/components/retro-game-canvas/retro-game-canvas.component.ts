import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  HostListener
} from '@angular/core';
import { RetroAudioService } from '../../../../../application/services/retro-audio.service';
import { RetroScorePort } from '../../../../../domain/ports/retro-score.port';
import { MinesweeperCell, MinesweeperFace } from '../../../../../domain/models/retro-game.model';
import { I18nService } from '../../../../../application/services/i18n.service';

const ROWS = 9;
const COLS = 9;
const TOTAL_MINES = 10;

@Component({
  selector: 'app-retro-game-canvas',
  standalone: true,
  templateUrl: './retro-game-canvas.component.html',
  styleUrl: './retro-game-canvas.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RetroGameCanvasComponent implements OnInit, OnDestroy {
  private readonly audio = inject(RetroAudioService);
  private readonly scorePort = inject(RetroScorePort);
  protected readonly i18n = inject(I18nService);

  // Estados del juego con Angular Signals
  protected readonly grid = signal<MinesweeperCell[][]>([]);
  protected readonly isPlaying = signal<boolean>(false);
  protected readonly isGameOver = signal<boolean>(false);
  protected readonly isWon = signal<boolean>(false);
  protected readonly face = signal<MinesweeperFace>('idle');
  protected readonly elapsedSeconds = signal<number>(0);
  protected readonly bestTime = signal<number | null>(null);
  protected readonly isFlagMode = signal<boolean>(false); // Para dispositivos táctiles
  protected readonly playerTag = signal<string>('XP');
  protected readonly isScoreSaved = signal<boolean>(false);
  protected readonly showWinDialog = signal<boolean>(false);

  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private minesPlaced = false;

  // Contador de minas restantes (Minas totales - banderas colocadas)
  protected readonly remainingMines = computed<number>(() => {
    let flags = 0;
    const currentGrid = this.grid();
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (currentGrid[r]?.[c]?.isFlagged) {
          flags++;
        }
      }
    }
    return TOTAL_MINES - flags;
  });

  // Contador de minas en formato clásico 3 dígitos LED (ej: "010", "009", "-01")
  protected readonly formattedMines = computed<string>(() => {
    const rem = this.remainingMines();
    if (rem < 0) {
      return `-${Math.abs(rem).toString().padStart(2, '0')}`;
    }
    return Math.min(rem, 999).toString().padStart(3, '0');
  });

  // Contador de tiempo en formato 3 dígitos LED (ej: "000", "042", "999")
  protected readonly formattedTime = computed<string>(() => {
    const sec = this.elapsedSeconds();
    return Math.min(sec, 999).toString().padStart(3, '0');
  });

  ngOnInit(): void {
    this.loadBestTime();
    this.resetGame();
  }

  resetGame(): void {
    this.stopTimer();
    this.minesPlaced = false;
    this.isPlaying.set(false);
    this.isGameOver.set(false);
    this.isWon.set(false);
    this.showWinDialog.set(false);
    this.face.set('idle');
    this.elapsedSeconds.set(0);
    this.isScoreSaved.set(false);

    const newGrid: MinesweeperCell[][] = [];
    for (let r = 0; r < ROWS; r++) {
      const row: MinesweeperCell[] = [];
      for (let c = 0; c < COLS; c++) {
        row.push({
          row: r,
          col: c,
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          adjacentMines: 0,
          isExploded: false
        });
      }
      newGrid.push(row);
    }
    this.grid.set(newGrid);
  }

  onFaceClick(): void {
    this.audio.playClick();
    this.resetGame();
  }

  onFaceMouseDown(): void {
    if (!this.isGameOver() && !this.isWon()) {
      this.face.set('pressed');
    }
  }

  onFaceMouseUp(): void {
    if (!this.isGameOver() && !this.isWon()) {
      this.face.set('idle');
    }
  }

  toggleFlagMode(): void {
    this.audio.playClick();
    this.isFlagMode.update(v => !v);
  }

  onCellClick(row: number, col: number): void {
    if (this.isGameOver() || this.isWon()) {
      this.audio.playClick();
      this.resetGame();
      return;
    }

    if (this.isFlagMode()) {
      this.toggleFlag(row, col);
      return;
    }

    this.revealCell(row, col);
  }

  onCellRightClick(event: MouseEvent, row: number, col: number): void {
    event.preventDefault();
    if (this.isGameOver() || this.isWon()) return;
    this.toggleFlag(row, col);
  }

  onCellMouseDown(cell: MinesweeperCell): void {
    if (this.isGameOver() || this.isWon() || cell.isRevealed || cell.isFlagged) return;
    this.face.set('pressed');
  }

  @HostListener('window:mouseup')
  onGlobalMouseUp(): void {
    if (!this.isGameOver() && !this.isWon()) {
      this.face.set('idle');
    }
  }

  // Doble clic o clic en número descubierto (Chording clásico)
  onCellDblClick(row: number, col: number): void {
    if (this.isGameOver() || this.isWon()) return;
    const currentGrid = this.grid();
    const cell = currentGrid[row]?.[col];
    if (!cell || !cell.isRevealed || cell.adjacentMines === 0) return;

    // Contar banderas adyacentes
    const neighbors = this.getNeighbors(row, col);
    const flaggedCount = neighbors.filter(n => currentGrid[n.r][n.c].isFlagged).length;

    if (flaggedCount === cell.adjacentMines) {
      neighbors.forEach(n => {
        const target = currentGrid[n.r][n.c];
        if (!target.isRevealed && !target.isFlagged) {
          this.revealCell(n.r, n.c);
        }
      });
    }
  }

  private startTimer(): void {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      this.elapsedSeconds.update(s => Math.min(s + 1, 999));
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval !== null) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private generateMines(firstRow: number, firstCol: number): void {
    const currentGrid = this.grid().map(row => row.map(cell => ({ ...cell })));
    let placed = 0;

    // Generar minas asegurando que la casilla inicial y sus 8 vecinas estén limpias
    while (placed < TOTAL_MINES) {
      const r = Math.floor(Math.random() * ROWS);
      const c = Math.floor(Math.random() * COLS);

      const isFirstSafeZone = Math.abs(r - firstRow) <= 1 && Math.abs(c - firstCol) <= 1;

      if (!currentGrid[r][c].isMine && !isFirstSafeZone) {
        currentGrid[r][c].isMine = true;
        placed++;
      }
    }

    // Calcular números adyacentes
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!currentGrid[r][c].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              if (dr === 0 && dc === 0) continue;
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && currentGrid[nr][nc].isMine) {
                count++;
              }
            }
          }
          currentGrid[r][c].adjacentMines = count;
        }
      }
    }

    this.grid.set(currentGrid);
    this.minesPlaced = true;
  }

  private revealCell(row: number, col: number): void {
    const currentGrid = this.grid().map(r => r.map(c => ({ ...c })));
    const cell = currentGrid[row]?.[col];

    if (!cell || cell.isRevealed || cell.isFlagged) return;

    // Primer clic: colocar minas e iniciar cronómetro
    if (!this.minesPlaced) {
      this.generateMines(row, col);
      this.startTimer();
      this.isPlaying.set(true);
      // Re-obtener la celda actualizada tras colocar minas
      const updatedGrid = this.grid().map(r => r.map(c => ({ ...c })));
      this.floodFill(updatedGrid, row, col);
      this.grid.set(updatedGrid);
      this.audio.playCellReveal();
      this.checkWinCondition(updatedGrid);
      return;
    }

    // Si hace clic en una mina: GAME OVER
    if (cell.isMine) {
      cell.isRevealed = true;
      cell.isExploded = true;
      this.grid.set(currentGrid);
      this.handleGameOver(row, col);
      return;
    }

    // Casilla segura: descubrir con flood-fill si está vacía
    this.floodFill(currentGrid, row, col);
    this.grid.set(currentGrid);
    this.audio.playCellReveal();
    this.checkWinCondition(currentGrid);
  }

  private floodFill(grid: MinesweeperCell[][], row: number, col: number): void {
    const cell = grid[row]?.[col];
    if (!cell || cell.isRevealed || cell.isFlagged || cell.isMine) return;

    cell.isRevealed = true;

    // Si no tiene minas adyacentes (casilla vacía '0'), expandir en cascada
    if (cell.adjacentMines === 0) {
      const neighbors = this.getNeighbors(row, col);
      for (const n of neighbors) {
        this.floodFill(grid, n.r, n.c);
      }
    }
  }

  private toggleFlag(row: number, col: number): void {
    const currentGrid = this.grid().map(r => r.map(c => ({ ...c })));
    const cell = currentGrid[row]?.[col];

    if (!cell || cell.isRevealed) return;

    cell.isFlagged = !cell.isFlagged;
    this.grid.set(currentGrid);
    this.audio.playFlagToggle();
  }

  private getNeighbors(r: number, c: number): Array<{ r: number; c: number }> {
    const neighbors: Array<{ r: number; c: number }> = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
          neighbors.push({ r: nr, c: nc });
        }
      }
    }
    return neighbors;
  }

  private handleGameOver(explodedRow: number, explodedCol: number): void {
    this.stopTimer();
    this.isGameOver.set(true);
    this.face.set('dead');
    this.audio.playMineExplosion();

    // Revelar todas las demás minas
    const currentGrid = this.grid().map(r => r.map(c => ({ ...c })));
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = currentGrid[r][c];
        if (cell.isMine && !cell.isFlagged) {
          cell.isRevealed = true;
        }
        // Bandera incorrecta
        if (!cell.isMine && cell.isFlagged) {
          cell.isRevealed = true;
        }
      }
    }
    this.grid.set(currentGrid);
  }

  private checkWinCondition(grid: MinesweeperCell[][]): void {
    let revealedSafeCount = 0;
    const totalSafeCells = ROWS * COLS - TOTAL_MINES;

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!grid[r][c].isMine && grid[r][c].isRevealed) {
          revealedSafeCount++;
        }
      }
    }

    if (revealedSafeCount === totalSafeCells) {
      this.stopTimer();
      this.isWon.set(true);
      this.face.set('won');
      this.showWinDialog.set(true);
      this.audio.playVictory();

      // Auto-marcar todas las minas restantes con banderas
      const finalGrid = grid.map(r => r.map(c => ({
        ...c,
        isFlagged: c.isMine ? true : c.isFlagged
      })));
      this.grid.set(finalGrid);

      const time = this.elapsedSeconds();
      const currentBest = this.bestTime();
      if (currentBest === null || time < currentBest) {
        this.bestTime.set(time);
      }
    }
  }

  closeWinDialog(): void {
    this.audio.playClick();
    this.showWinDialog.set(false);
  }

  submitScoreAndClose(): void {
    this.submitScore();
    this.showWinDialog.set(false);
  }

  submitScore(): void {
    const finalTime = this.elapsedSeconds();
    const tag = (this.playerTag() || 'XP').trim().toUpperCase().slice(0, 4);
    if (finalTime <= 0 || this.isScoreSaved()) return;

    this.scorePort.saveScore({
      playerTag: tag,
      gameCode: 'MINESWEEPER',
      score: finalTime
    }).subscribe({
      next: () => {
        this.isScoreSaved.set(true);
        this.audio.playHighScore();
        this.loadBestTime();
      }
    });
  }

  private loadBestTime(): void {
    this.scorePort.getTopScores('MINESWEEPER', 1).subscribe({
      next: (scores) => {
        if (scores.length > 0) {
          this.bestTime.set(scores[0].score);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }
}
