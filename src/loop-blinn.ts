export interface Point {
  x: number;
  y: number;
}

function dotCrossCubic(p0: Point, p1: Point, p2: Point): number {
  const xComp = p0.x * (p1.y - p2.y);
  const yComp = p0.y * (p2.x - p1.x);
  const wComp = p1.x * p2.y - p1.y * p2.x;
  return xComp + yComp + wComp;
}

function normalize(x: number, y: number, z: number): number[] {
  const invScale = x * x + y * y + z * z;
  if (invScale == 0) {
    return [0, 0, 0];
  }
  const scale = 1 / Math.sqrt(invScale);
  const nx = x * scale;
  const ny = y * scale;
  const nz = z * scale;
  if (isNaN(nx) || isNaN(ny) || isNaN(nz)) {
    return [0, 0, 0];
  }
  return [nx, ny, nz];
}

function snapToZero(x: number): number {
  return Math.abs(x) < 2.441406e-4 ? 0 : x;
}

export enum Type {
  kSerpentine = "Serpentine",
  kLoop = "Loop",
  kCusp = "Cusp",
  kQuadratic = "Quadratic",
  kLineOrPoint = "LineOrPoint",
}

export interface Classification {
  type: Type;
  d1: number;
  d2: number;
  d3: number;
}

export function classify(
  p0: Point,
  p1: Point,
  p2: Point,
  p3: Point
): Classification {
  const a1 = dotCrossCubic(p0, p3, p2);
  const a2 = dotCrossCubic(p1, p0, p3);
  const a3 = dotCrossCubic(p2, p1, p0);

  let d3 = 3 * a3;
  let d2 = d3 - a2;
  let d1 = d2 - a2 + a1;

  const nd = normalize(d1, d2, d3);
  d1 = snapToZero(nd[0]);
  d2 = snapToZero(nd[1]);
  d3 = snapToZero(nd[2]);

  if (d3 == 0 && d2 == 0) {
    if (d1 > 0) {
      d1 = 1;
    } else if (d1 < 0) {
      d1 = -1;
    }
  }
  if (d1 == d2 && d1 == d3) {
    if (d1 > 0) {
      d3 = 1;
      d2 = 1;
      d1 = 1;
    } else if (d1 < 0) {
      d3 = -1;
      d2 = -1;
      d1 = -1;
    }
  }

  const term0 = snapToZero(3 * d2 * d2 - 4 * d1 * d3);
  const discr = snapToZero(d1 * d1 * term0);

  if (discr > 0) {
    // NOLINT
    return { type: Type.kSerpentine, d1, d2, d3 };
  } else if (discr < 0) {
    // NOLINT
    return { type: Type.kLoop, d1, d2, d3 };
  } else if (d1 == 0 && d2 == 0) {
    if (d3 == 0) {
      return { type: Type.kLineOrPoint, d1, d2, d3 };
    } else {
      return { type: Type.kQuadratic, d1, d2, d3 };
    }
  } else if (d1 == 0) {
    return { type: Type.kCusp, d1, d2, d3 };
  } else if (term0 < 0) {
    return { type: Type.kLoop, d1, d2, d3 };
  } else {
    return { type: Type.kSerpentine, d1, d2, d3 };
  }
}

export function computeQlQm(classification: Classification): number[] {
  const s = 4 * classification.d1 * classification.d3 - 3 * classification.d2 * classification.d2;
  const t1 = s > 0 ? Math.sqrt(s) : 0;
  const ls = classification.d2 - t1;
  const lt = 2 * classification.d1;
  const ms = classification.d2 + t1;
  const mt = lt;
  const ql = ls / lt;
  const qm = ms / mt;
  return [ql, qm];
}
