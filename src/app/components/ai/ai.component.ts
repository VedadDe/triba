import { Component, ElementRef, ViewChild } from '@angular/core';

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
  private gridSize: { m: number; n: number } = { m: 5, n: 5 };
  private cellSize: number = 50;
  private selectedPoints: Point[] = [];
  private triangles: Point[][] = [];
  private currentPlayer: number = 1;
  gameOver: boolean = false;
  private transpositionTable: Map<string, { score: number; depth: number; triangle: Point[] }> = new Map();

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
    if (this.gameOver || this.currentPlayer === 2) {
      return;
    }
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
        this.selectedPoints = [];
  
        // Handle AI move
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
  for (let x1 = 0; x1 < this.gridSize.m + 1; x1++) {
    for (let y1 = 0; y1 < this.gridSize.n + 1; y1++) {
      for (let x2 = 0; x2 < this.gridSize.m + 1; x2++) {
        for (let y2 = 0; y2 < this.gridSize.n + 1; y2++) {
          for (let x3 = 0; x3 < this.gridSize.m + 1; x3++) {
            for (let y3 = 0; y3 < this.gridSize.n + 1; y3++) {
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
aiMove(): Point[] {
  if (this.triangles.length < 4) {
    return this.largestAreaLegalTriangleMove();
  }
  let depth = 1; // Start with a depth of 1
  let bestTriangle: Point[] = [];
  let startTime = Date.now();
  let timeLimit = 1000; // Set a time limit in milliseconds

  // Iterative deepening loop
  while (Date.now() - startTime < timeLimit) {
    this.transpositionTable.clear(); // Clear the transposition table for each depth
    const { triangle } = this.minimax(depth, true, -Infinity, Infinity);
    bestTriangle = triangle;
    depth++;
    console.log("depth", depth)
  }

  return bestTriangle;
}




minimax(depth: number, isMaximizingPlayer: boolean, alpha: number, beta: number): { score: number; triangle: Point[] } {
  if (depth === 0 || this.checkGameOver()) {
    const score = this.evaluateGameState(isMaximizingPlayer);
    return { score, triangle: [] };
  }

  let bestTriangle: Point[] = [];
  let bestScore = isMaximizingPlayer ? -Infinity : Infinity;

  const stateKey = this.generateStateKey();

  // Check if the state has been evaluated before
  if (this.transpositionTable.has(stateKey)) {
    const cached = this.transpositionTable.get(stateKey);
    if (cached && cached.depth >= depth) {
      return { score: cached.score, triangle: cached.triangle };
    }
  }

  const allPossibleTriangles = this.getAllPossibleTriangles();

  for (const triangle of allPossibleTriangles) {
    this.triangles.push(triangle);
    const { score } = this.minimax(depth - 1, !isMaximizingPlayer, alpha, beta);
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

  // Store the evaluated state in the transposition table
  this.transpositionTable.set(stateKey, { score: bestScore, depth, triangle: bestTriangle });

  return { score: bestScore, triangle: bestTriangle };
}


evaluateGameState(isMaximizingPlayer: boolean): number {
  // A more sophisticated evaluation function
  // This example rewards having more triangles and penalizes having fewer potential moves
  const aiTriangles = this.triangles.filter((_, index) => index % 2 === 1).length;
  const humanTriangles = this.triangles.filter((_, index) => index % 2 === 0).length;
  const remainingTriangles = this.getAllPossibleTriangles().length;

  const score = (aiTriangles - humanTriangles) * 10 - remainingTriangles;

  return isMaximizingPlayer ? score : -score;
}
generateStateKey(): string {
  const sortedTriangles = this.triangles.map(triangle =>
    triangle.map(p => `${p.x},${p.y}`).sort().join('-')
  ).sort();
  return sortedTriangles.join('|');
}
getAllPossibleTriangles(): Point[][] {
  const allPossibleTriangles: Point[][] = [];

  const unusedPoints: Point[] = [];
  for (let x = 0; x < this.gridSize.m + 1; x++) {
    for (let y = 0; y < this.gridSize.n + 1; y++) {
      const point: Point = { x, y };
      if (!this.isVertexOfExistingTriangle(point)) {
        unusedPoints.push(point);
      }
    }
  }

  for (let i = 0; i < unusedPoints.length; i++) {
    for (let j = i + 1; j < unusedPoints.length; j++) {
      for (let k = j + 1; k < unusedPoints.length; k++) {
        const triangle = [unusedPoints[i], unusedPoints[j], unusedPoints[k]];

        if (this.isValidTriangle(triangle)) {
          allPossibleTriangles.push(triangle);
        }
      }
    }
  }

  return allPossibleTriangles;
}

largestAreaLegalTriangleMove(): Point[] {
  const allPoints: Point[] = [];
  for (let x = 0; x < this.gridSize.m + 1; x++) {
    for (let y = 0; y < this.gridSize.n + 1; y++) {
      allPoints.push({ x, y });
    }
  }

  let maxArea = -1;
  let bestTriangle: Point[] = [];

  for (let i = 0; i < allPoints.length; i++) {
    for (let j = i + 1; j < allPoints.length; j++) {
      for (let k = j + 1; k < allPoints.length; k++) {
        const triangle = [allPoints[i], allPoints[j], allPoints[k]];

        if (this.isValidTriangle(triangle) &&
            !triangle.some(p => this.isVertexOfExistingTriangle(p))) {
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

}