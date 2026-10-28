import type { PitchGeometry } from "./pitch-geometry";
import styles from "./pitch-frame.module.css";

// The pitch's outline and thickness live here, separately from its surface.
export function PitchFrame({ geometry }: { geometry: PitchGeometry }) {
  return (
    <g data-export-pitch-frame>
      <path className={styles.edge} d={geometry.path([[0, 0], [1, 0], [1, 1.012], [0, 1.012]])} />
      <path className={styles.rim} d={geometry.path([[.012, .018], [.988, .018], [.988, .99], [.012, .99]])} />
    </g>
  );
}
