import type { PitchGeometry } from "./pitch-geometry";
import styles from "./stadium-stand.module.css";

export function StadiumStand({ geometry }: { geometry: PitchGeometry }) {
  const edge = (u: number, y: number, lift: number) => {
    const point = geometry.atHeight(u, y);
    return `${point.x.toFixed(2)} ${(point.y - lift).toFixed(2)}`;
  };
  return (
    <g data-export-stadium-stand>
      <rect
        width={geometry.width}
        height={geometry.standHeight}
        className={styles.back}
      />
      {[
        [8, 18],
        [21, 33],
        [36, 48],
        [51, 62],
      ].map(([far, near], index) => {
        const lift = 5 - index;
        const a = edge(-0.05, far, lift),
          b = edge(1.05, far, lift);
        const c = edge(1.05, near, lift),
          d = edge(-0.05, near, lift);
        return (
          <g key={far}>
            <path d={`M${a}L${b}L${c}L${d}Z`} className={styles.tread} />
            <path d={`M${d}L${c}`} className={styles.riser} />
            <path d={`M${a}L${b}`} className={styles.highlight} />
          </g>
        );
      })}
      <path
        d={`M0 ${geometry.standHeight - 2}H${geometry.width}`}
        className={styles.rail}
      />
    </g>
  );
}
