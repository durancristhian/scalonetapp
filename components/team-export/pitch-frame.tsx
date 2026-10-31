import type { PitchGeometry } from "./pitch-geometry";
import styles from "./pitch-frame.module.css";

export function PitchFrame({ geometry }: { geometry: PitchGeometry }) {
  return (
    <g data-export-pitch-frame>
      <path
        className={styles.edge}
        d={geometry.path([
          [0, 0],
          [1, 0],
          [1, 1.012],
          [0, 1.012],
        ])}
      />
      <path
        className={styles.rim}
        d={geometry.path([
          [0.012, 0.018],
          [0.988, 0.018],
          [0.988, 0.99],
          [0.012, 0.99],
        ])}
      />
    </g>
  );
}
