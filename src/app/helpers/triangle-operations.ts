import { Component, ElementRef, ViewChild } from '@angular/core';

interface Point {
  x: number;
  y: number;
}

export class TriangleHelper {
  static isSelected(point: Point, selectedPoints: Point[]): boolean {
    return selectedPoints.some((p) => p.x === point.x && p.y === point.y);
  }

  static isVertexOfExistingTriangle(
    point: Point,
    triangles: Point[][]
  ): boolean {
    return triangles.some((triangle) =>
      triangle.some((p) => p.x === point.x && p.y === point.y)
    );
  }

  static isValidTriangle(points: Point[], triangles: Point[][]): boolean {
    const [p1, p2, p3] = points;
    if ((p2.y - p1.y) * (p3.x - p1.x) === (p3.y - p1.y) * (p2.x - p1.x)) {
      return false;
    }
    return !triangles.some((triangle) =>
      this.trianglesIntersect(triangle, points)
    );
  }

  static trianglesIntersect(triangle1: Point[], triangle2: Point[]): boolean {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (
          this.linesIntersect(
            triangle1[i],
            triangle1[(i + 1) % 3],
            triangle2[j],
            triangle2[(j + 1) % 3]
          )
        ) {
          return true;
        }
      }
    }
    return false;
  }

  static linesIntersect(p1: Point, p2: Point, p3: Point, p4: Point): boolean {
    const ua =
      ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) /
      ((p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y));
    const ub =
      ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) /
      ((p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y));

    return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
  }

  static checkGameOver(
    gridSize: { m: number; n: number },
    triangles: Point[][]
  ): boolean {
    const totalPoints = (gridSize.m + 1) * (gridSize.n + 1);
  
    for (let i = 0; i < totalPoints; i++) {
      const x1 = i % (gridSize.m + 1);
      const y1 = Math.floor(i / (gridSize.m + 1));
  
      for (let j = i + 1; j < totalPoints; j++) {
        const x2 = j % (gridSize.m + 1);
        const y2 = Math.floor(j / (gridSize.m + 1));
  
        for (let k = j + 1; k < totalPoints; k++) {
          const x3 = k % (gridSize.m + 1);
          const y3 = Math.floor(k / (gridSize.m + 1));
  
          const point1: Point = { x: x1, y: y1 };
          const point2: Point = { x: x2, y: y2 };
          const point3: Point = { x: x3, y: y3 };
  
          const triangle = [point1, point2, point3];
  
          if (
            this.isValidTriangle(triangle, triangles) &&
            !this.isVertexOfExistingTriangle(point1, triangles) &&
            !this.isVertexOfExistingTriangle(point2, triangles) &&
            !this.isVertexOfExistingTriangle(point3, triangles)
          ) {
            return false;
          }
        }
      }
    }
    return true;
  }
  
}
