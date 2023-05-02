import { Component, ElementRef, ViewChild } from '@angular/core';
import { TriangleHelper } from 'src/app/helpers/triangle-operations';

interface Point {
  x: number;
  y: number;
}

@Component({
  selector: 'app-ai',
  templateUrl: './ai.component.html',
  styleUrls: ['./ai.component.scss']
})
export class AiComponent {
  
  @ViewChild('gameCanvas', { static: true }) gameCanvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private gridSize: { m: number; n: number } = { m: 6, n: 4 };
  private cellSize: number = 50;
  private selectedPoints: Point[] = [];
  private triangles: Point[][] = [];
  currentPlayer: number = 1;
  gameOver: boolean = false;
  minMaxAfter: number = 2;
  
  constructor() { }
  ngOnInit() {
    const context = this.gameCanvas.nativeElement.getContext('2d');
    const pointRadius = 12; 
  
    if (!context) {
      console.error('Failed to get the canvas rendering context.');
      return;
    }
  
    this.ctx = context;
    this.gameCanvas.nativeElement.width = this.gridSize.m * this.cellSize + 2 * pointRadius;
    this.gameCanvas.nativeElement.height = this.gridSize.n * this.cellSize + 2 * pointRadius;
    this.drawGrid(pointRadius); 
  }
  changeGridSize(m: number, n: number, minMaxStart: number): void {

    this.gridSize.m = m;
    this.gridSize.n = n;
    this.minMaxAfter = minMaxStart;
    const pointRadius = 12;
    this.gameCanvas.nativeElement.width = this.gridSize.m * this.cellSize + 2 * pointRadius;
    this.gameCanvas.nativeElement.height = this.gridSize.n * this.cellSize + 2 * pointRadius;
    this.drawGrid(pointRadius); // Pass the pointRadius value to the drawGrid method
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
    if (this.gameOver || this.currentPlayer === 2) {
      return;
    }
    const pointRadius = 12;
    const rect = this.gameCanvas.nativeElement.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / this.cellSize);
    const y = Math.floor((event.clientY - rect.top) / this.cellSize);
  
    if (TriangleHelper.isSelected({ x, y }, this.selectedPoints) || TriangleHelper.isVertexOfExistingTriangle({ x, y }, this.triangles)) {
      return;
    }
  
    this.selectedPoints.push({ x, y });
    this.drawPoint(pointRadius + x * this.cellSize, pointRadius + y * this.cellSize, pointRadius);
    if (this.selectedPoints.length === 3) {
      if (TriangleHelper.isValidTriangle(this.selectedPoints, this.triangles)) {
        this.triangles.push(this.selectedPoints);
        this.drawTriangle(this.selectedPoints);
        this.selectedPoints = [];
  
        if (!this.gameOver && this.currentPlayer === 2) {
          const aiTriangle = this.aiMove();
          this.triangles.push(aiTriangle);
          this.drawTriangle(aiTriangle);
        }
      } else {
        this.selectedPoints = [];
      }
    }
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
    if (TriangleHelper.checkGameOver(this.gridSize, this.triangles)) {
      this.showGameOverMessage();
    }
  }
  
aiMove(): Point[] {
  if (this.triangles.length < this.minMaxAfter) {
    return this.largestAreaLegalTriangleMove();
  }

  let depth = this.chooseDepth();
  console.log(depth)
  let bestTriangle: Point[] = [];

  const { triangle } = this.alphaBetaPruning(depth, true, -Infinity, Infinity);
  bestTriangle = triangle;

  return bestTriangle;
}

chooseDepth(): number {
  return this.gridSize.m == 6 ? 4 :
  this.gridSize.n == 6 ? 2 :
  this.triangles.length >= 14 ? 4 :
  this.triangles.length >= 12 ? 3 :
  this.triangles.length > 8 ? 2 :
  1;
}

alphaBetaPruning(depth: number, isMaximizingPlayer: boolean, alpha: number, beta: number): { score: number; triangle: Point[] } {
  //reference: https://www.javatpoint.com/ai-alpha-beta-pruning
  //https://www.freecodecamp.org/news/simple-chess-ai-step-by-step-1d55a9266977/
  if (depth === 0 || TriangleHelper.checkGameOver(this.gridSize, this.triangles)) {
    const score = this.evaluateGameState();
    return { score, triangle: [] };
  }

  let bestTriangle: Point[] = [];
  let bestScore = isMaximizingPlayer ? -Infinity : Infinity;

  const allPossibleTriangles = this.getAllPossibleTriangles();

  for (const triangle of allPossibleTriangles) {
    this.triangles.push(triangle);
    const { score } = this.alphaBetaPruning(depth - 1, !isMaximizingPlayer, alpha, beta);
    this.triangles.pop();

    if (isMaximizingPlayer) {
      if (score > bestScore) {
        bestScore = score;
        bestTriangle = triangle;
      }
      alpha = Math.max(alpha, bestScore);
    } else {
      if (score < bestScore) {
        bestScore = score;
        bestTriangle = triangle;
      }
      beta = Math.min(beta, bestScore);
    }
    if (beta <= alpha) break;
  }

  return { score: bestScore, triangle: bestTriangle };
}

evaluateGameState(): number {
  //reference: https://stackoverflow.com/questions/1291377/how-to-create-a-good-evaluation-function-for-a-game
  //https://stackoverflow.com/questions/3002167/minimax-algorithm-cost-evaluation-function
  const aiTriangles = this.triangles.filter((_, index) => index % 2 === 1).length;
  const humanTriangles = this.triangles.filter((_, index) => index % 2 === 0).length;

  const opponentRemainingTriangles = Math.floor(this.getAllPossibleTriangles().length / 2);

  const potentialAiMoves = this.getAllPossibleTriangles().length;

  const score = (aiTriangles - humanTriangles) * 20
                - opponentRemainingTriangles * 8
                + potentialAiMoves * 8;

  return score;
}

getAllPossibleTriangles(): Point[][] {
  const allPossibleTriangles: Point[][] = [];

  const unusedPoints: Point[] = [];
  for (let x = 0; x < this.gridSize.m + 1; x++) {
    for (let y = 0; y < this.gridSize.n + 1; y++) {
      const point: Point = { x, y };
      if (!TriangleHelper.isVertexOfExistingTriangle(point, this.triangles)) {
        unusedPoints.push(point);
      }
    }
  }

  for (let i = 0; i < unusedPoints.length; i++) {
    for (let j = i + 1; j < unusedPoints.length; j++) {
      for (let k = j + 1; k < unusedPoints.length; k++) {
        const triangle = [unusedPoints[i], unusedPoints[j], unusedPoints[k]];

        if (TriangleHelper.isValidTriangle(triangle, this.triangles)) {
          allPossibleTriangles.push(triangle);
        }
      }
    }
  }

  return allPossibleTriangles;
}

largestAreaLegalTriangleMove(): Point[] {
  const allPoints: Point[] = [];
  for (let x = 0; x <= this.gridSize.m ; x++) {
    for (let y = 0; y <= this.gridSize.n; y++) {
      allPoints.push({ x, y });
    }
  }

  let maxArea = -Infinity;
  let bestTriangle: Point[] = [];

  for (let i = 0; i < allPoints.length; i++) {
    for (let j = i + 1; j < allPoints.length; j++) {
      for (let k = j + 1; k < allPoints.length; k++) {
        const triangle = [allPoints[i], allPoints[j], allPoints[k]];

        if (TriangleHelper.isValidTriangle(triangle, this.triangles) &&
            !triangle.some(p => TriangleHelper.isVertexOfExistingTriangle(p, this.triangles))) {
          const area = this.calculateTriangleArea(triangle);
          if (area > maxArea) {
            maxArea = area;
            bestTriangle = triangle;
          }
        }
      }
    }
  }

  return bestTriangle;
}

calculateTriangleArea(triangle: Point[]): number {
  const [p1, p2, p3] = triangle;
  const area = Math.abs((p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y)) / 2);
  return area;
}
restartGame(){
  window.location.reload();
}
switchPlayer() {
  this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
}
showGameOverMessage(): void {
  this.gameOver=true  
}
}