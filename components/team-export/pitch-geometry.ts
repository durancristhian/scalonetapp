import { EXPORT_LAYOUT } from "./export-layout";

type Point = readonly [number, number];

export function createPitchGeometry(fieldHeight: number) {
  const { width, standHeight } = EXPORT_LAYOUT;
  function project(u: number, v: number) {
    return {
      x: u * width,
      y: standHeight + v * fieldHeight,
    };
  }

  function atHeight(u: number, y: number) {
    return { x: u * width, y };
  }

  function path(points: readonly Point[], close = true) {
    return (
      points
        .map(([u, v], index) => {
          const p = project(u, v);
          return `${index ? "L" : "M"}${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
        })
        .join(" ") + (close ? "Z" : "")
    );
  }

  return {
    width,
    fieldHeight,
    standHeight,
    height: standHeight + fieldHeight,
    project,
    atHeight,
    path,
    fieldPath: path([
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ]),
  };
}

export type PitchGeometry = ReturnType<typeof createPitchGeometry>;
