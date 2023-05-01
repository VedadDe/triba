//cista
import { Component, ElementRef, ViewChild } from '@angular/core';

interface Point {
  x: number;
  y: number;
}



@Component({
  selector: 'app-two-players',
  templateUrl: './two-players.component.html',
  styleUrls: ['./two-players.component.scss']
})
export class TwoPlayersComponent {

  @ViewChild('gameCanvas', { static: true }) gameCanvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private gridSize: { m: number; n: number } = { m: 8, n: 10 };
  private cellSize: number = 50;
  private selectedPoints: Point[] = [];
  private triangles: Point[][] = [];
  private currentPlayer: number = 1;
  gameOver: boolean = false;

  constructor() { }
  ngOnInit() {
    const context = this.gameCanvas.nativeElement.getContext('2d');
    const pointRadius = 12; // Set the point radius here for easier adjustments
  
    if (!context) {
      console.error('Failed to get the canvas rendering context.');
      return;
    }
  
    this.ctx = context;
    this.gameCanvas.nativeElement.width = this.gridSize.m * this.cellSize + 2 * pointRadius;
    this.gameCanvas.nativeElement.height = this.gridSize.n * this.cellSize + 2 * pointRadius;
    this.drawGrid(pointRadius); // Pass pointRadius to drawGrid method
  }
  
  

  drawGrid(pointRadius: number) {
    for (let i = 0; i <= this.gridSize.m; i++) {
      for (let j = 0; j <= this.gridSize.n; j++) {
        this.drawPoint(pointRadius + i * this.cellSize, pointRadius + j * this.cellSize, pointRadius);
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
  
    if (this.isSelected({ x, y }) || this.isVertexOfExistingTriangle({ x, y })) {
      return;
    }
  
    this.selectedPoints.push({ x, y });
    this.drawPoint(pointRadius + x * this.cellSize, pointRadius + y * this.cellSize, pointRadius);
  
    if (this.selectedPoints.length === 3) {
      if (this.isValidTriangle(this.selectedPoints)) {
        this.triangles.push(this.selectedPoints);
        this.drawTriangle(this.selectedPoints);
      }
      this.selectedPoints = [];
    }
  }
  

  isSelected(point: Point): boolean {
    return this.selectedPoints.some(p => p.x === point.x && p.y === point.y);
  }
  isVertexOfExistingTriangle(point: Point): boolean {
    return this.triangles.some(triangle => triangle.some(p => p.x === point.x && p.y === point.y));
  }

  isValidTriangle(points: Point[]): boolean {
    const [p1, p2, p3] = points;
    // Check if points are collinear
    if ((p2.y - p1.y) * (p3.x - p1.x) === (p3.y - p1.y) * (p2.x - p1.x)) {
      return false;
    }

    // Check if the new triangle intersects any existing triangle
    return !this.triangles.some(triangle => this.trianglesIntersect(triangle, points));
  }

  trianglesIntersect(triangle1: Point[], triangle2: Point[]): boolean {
    // Check if any edge of triangle1 intersects any edge of triangle2
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (this.linesIntersect(
          triangle1[i], triangle1[(i + 1) % 3],
          triangle2[j], triangle2[(j + 1) % 3]
        )) {
          return true;
        }
      }
    }
    return false;
  }

  linesIntersect(p1: Point, p2: Point, p3: Point, p4: Point): boolean {
    const ua = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) /
              ((p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y));
    const ub = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) /
              ((p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y));

    return (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1);
  }

  drawTriangle(points: Point[]) {
    const pointRadius = 12;
    this.ctx.beginPath();
    this.ctx.moveTo(pointRadius + points[0].x * this.cellSize, pointRadius + points[0].y * this.cellSize);
    this.ctx.lineTo(pointRadius + points[1].x * this.cellSize, pointRadius + points[1].y * this.cellSize);
    this.ctx.lineTo(pointRadius + points[2].x * this.cellSize, pointRadius + points[2].y * this.cellSize);
    this.ctx.closePath();
    this.ctx.strokeStyle = this.currentPlayer === 1 ? 'red' : 'blue';
    this.ctx.lineWidth = 5;
    this.ctx.stroke();
  
    this.switchPlayer();
    if (this.checkGameOver()) {
      this.showGameOverMessage();
    }
  }
  

  switchPlayer() {
    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
  }
  showGameOverMessage(): void {
    alert(`Game over! Player ${this.currentPlayer === 1 ? 2 : 1} wins.`);
  
}

checkGameOver(): boolean {
  for (let x1 = 0; x1 < this.gridSize.m+1; x1++) {
    for (let y1 = 0; y1 < this.gridSize.n+1; y1++) {
      for (let x2 = 0; x2 < this.gridSize.m+1; x2++) {
        for (let y2 = 0; y2 < this.gridSize.n+1; y2++) {
          for (let x3 = 0; x3 < this.gridSize.m+1; x3++) {
            for (let y3 = 0; y3 < this.gridSize.n+1; y3++) {
              const point1: Point = { x: x1, y: y1 };
              const point2: Point = { x: x2, y: y2 };
              const point3: Point = { x: x3, y: y3 };

              const triangle = [point1, point2, point3];

              if (this.isValidTriangle(triangle) && !this.isVertexOfExistingTriangle(point1) &&
                  !this.isVertexOfExistingTriangle(point2) && !this.isVertexOfExistingTriangle(point3)) {
                return false;
              }
            }
          }
        }
      }
    }
  }
  this.gameOver = true;
  return true;
}
changeGridSize(m: number, n: number): void {
  // Update the grid size and redraw the canvas
  this.gridSize.m = m;
  this.gridSize.n = n;
  const pointRadius = 12;
  this.gameCanvas.nativeElement.width = this.gridSize.m * this.cellSize + 2 * pointRadius;
  this.gameCanvas.nativeElement.height = this.gridSize.n * this.cellSize + 2 * pointRadius;
  this.drawGrid(pointRadius); // Pass the pointRadius value to the drawGrid method
}

}