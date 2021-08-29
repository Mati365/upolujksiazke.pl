import {lerp} from '../lerp';

export class Vector {
  constructor(
    public x: number = 0,
    public y: number = 0,
  ) {}

  static zero() {
    return new Vector(0, 0);
  }

  static from({x, y}: {x?: number, y?: number}) {
    return new Vector(x, y);
  }

  toArray(): [number, number] {
    const {x, y} = this;

    return [x, y];
  }

  clone(): Vector {
    const {x, y} = this;

    return new Vector(x, y);
  }

  static mul(a: Vector, n: number): Vector {
    return new Vector(
      a.x * n,
      a.y * n,
    );
  }

  static sub(a: Vector, b: Vector): Vector {
    return new Vector(
      a.x - b.x,
      a.y - b.y,
    );
  }

  static add(a: Vector, b: Vector): Vector {
    return new Vector(
      a.x + b.x,
      a.y + b.y,
    );
  }

  static len(a: Vector): number {
    return Math.sqrt(
      a.x * a.x + a.y * a.y,
    );
  }

  static lerp(a: Vector, b: Vector, value: number): Vector {
    return new Vector(
      lerp(a.x, b.x, value),
      lerp(a.y, b.y, value),
    );
  }

  static distance(a: Vector, b: Vector): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;

    return Math.sqrt(dx * dx + dy * dy);
  }

  static sumDistances(list: Vector[]): number {
    let acc = 0;

    for (let i = 1; i < list.length; ++i) {
      acc += Vector.distance(
        list[i - 1],
        list[i],
      );
    }

    return acc;
  }
}
