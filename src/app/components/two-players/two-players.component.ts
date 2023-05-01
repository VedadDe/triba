//cista
import { Component, ElementRef, ViewChild } from '@angular/core';
import { TriangleHelper } from 'src/app/helpers/triangle-operations';
interface Point {
  x: number;
  y: number;
}

@Component({
  selector: 'app-two-players',
  templateUrl: './two-players.component.html',
  styleUrls: ['./two-players.component.scss'],
})
export class TwoPlayersComponent {
  @ViewChild('gameCanvas', { static: true })
  gameCanvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private gridSize: { m: number; n: number } = { m: 8, n: 10 };
  private cellSize: number = 50;
  private selectedPoints: Point[] = [];
  private triangles: Point[][] = [];
  private currentPlayer: number = 1;
  gameOver: boolean = false;

  constructor() {}
  ngOnInit() {
    const context = this.gameCanvas.nativeElement.getContext('2d');
    const pointRadius = 12; // Set the point radius here for easier adjustments

    if (!context) {
      console.error('Failed to get the canvas rendering context.');
      return;
    }

    this.ctx = context;
    this.gameCanvas.nativeElement.width =
      this.gridSize.m * this.cellSize + 2 * pointRadius;
    this.gameCanvas.nativeElement.height =
      this.gridSize.n * this.cellSize + 2 * pointRadius;
    this.drawGrid(pointRadius); // Pass pointRadius to drawGrid method
  }

  drawGrid(pointRadius: number) {
    for (let i = 0; i <= this.gridSize.m; i++) {
      for (let j = 0; j <= this.gridSize.n; j++) {
        this.drawPoint(
          pointRadius + i * this.cellSize,
          pointRadius + j * this.cellSize,
          pointRadius
        );
      }
    }
  }

  drawPoint(x: number, y: number, pointRadius: number) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, pointRadius, 0, Math.PI * 2, true);
    this.ctx.fillStyle = 'black';
    this.ctx.fill();
  }

  onCanvasClick(event: MouseEvent) {
    const pointRadius = 12;
    const rect = this.gameCanvas.nativeElement.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / this.cellSize);
    const y = Math.floor((event.clientY - rect.top) / this.cellSize);

    if (
      TriangleHelper.isSelected({ x, y }, this.selectedPoints) ||
      TriangleHelper.isVertexOfExistingTriangle({ x, y }, this.triangles)
    ) {
      return;
    }

    this.selectedPoints.push({ x, y });
    this.drawPoint(
      pointRadius + x * this.cellSize,
      pointRadius + y * this.cellSize,
      pointRadius
    );

    if (this.selectedPoints.length === 3) {
      if (TriangleHelper.isValidTriangle(this.selectedPoints, this.triangles)) {
        this.triangles.push(this.selectedPoints);
        this.drawTriangle(this.selectedPoints);
      }
      this.selectedPoints = [];
    }
  }

  drawTriangle(points: Point[]) {
    const pointRadius = 12;
    this.ctx.beginPath();
    this.ctx.moveTo(
      pointRadius + points[0].x * this.cellSize,
      pointRadius + points[0].y * this.cellSize
    );
    this.ctx.lineTo(
      pointRadius + points[1].x * this.cellSize,
      pointRadius + points[1].y * this.cellSize
    );
    this.ctx.lineTo(
      pointRadius + points[2].x * this.cellSize,
      pointRadius + points[2].y * this.cellSize
    );
    this.ctx.closePath();
    this.ctx.strokeStyle = this.currentPlayer === 1 ? 'red' : 'blue';
    this.ctx.lineWidth = 5;
    this.ctx.stroke();

    this.switchPlayer();
    if (TriangleHelper.checkGameOver(this.gridSize, this.triangles)) {
      this.showGameOverMessage();
    }
  }

  switchPlayer() {
    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
  }
  showGameOverMessage(): void {
    alert(`Game over! Player ${this.currentPlayer === 1 ? 2 : 1} wins.`);
  }

  changeGridSize(m: number, n: number): void {
    // Update the grid size and redraw the canvas
    this.gridSize.m = m;
    this.gridSize.n = n;
    const pointRadius = 12;
    this.gameCanvas.nativeElement.width =
      this.gridSize.m * this.cellSize + 2 * pointRadius;
    this.gameCanvas.nativeElement.height =
      this.gridSize.n * this.cellSize + 2 * pointRadius;
    this.drawGrid(pointRadius); // Pass the pointRadius value to the drawGrid method
  }
}
