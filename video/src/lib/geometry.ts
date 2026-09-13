export const DEG = Math.PI / 180;

export type Point = { x: number; y: number };

// Rotates a segment of `length` around `origin`. angleDeg=0 points straight
// down, sweeping toward +x as the angle increases toward 180 (straight up).
export function rotatePoint(
  origin: Point,
  length: number,
  angleDeg: number,
): Point {
  const rad = angleDeg * DEG;
  return {
    x: origin.x + length * Math.sin(rad),
    y: origin.y + length * Math.cos(rad),
  };
}
