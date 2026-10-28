import type { ImageExportBackgroundId } from "@/utils/image-export-backgrounds";
import type { PitchGeometry } from "./pitch-geometry";
import styles from "./pitch-markings.module.css";

export function PitchMarkings({ background, geometry }: { background: ImageExportBackgroundId; geometry: PitchGeometry }) {
  const roughness = { pasto: 0, natural: .001, potrero: .0022 }[background];
  const radius = Math.min(geometry.width * .13, geometry.fieldHeight * .19, 140);
  const center = geometry.project(.5, .5);
  const midfield = Array.from({ length: 41 }, (_, index): [number, number] => [
    .5 + Math.sin(index / 40 * Math.PI * 6) * roughness,
    index / 40,
  ]);
  const circle = Array.from({ length: 81 }, (_, index): [number, number] => {
    const angle = index / 80 * Math.PI * 2;
    return [
      .5 + (radius / geometry.width + Math.sin(angle * 5) * roughness) * Math.cos(angle),
      .5 + radius / geometry.fieldHeight * (1 + Math.sin(angle * 7) * roughness * 10) * Math.sin(angle),
    ];
  });
  return (
    <g className={styles.markings} data-export-pitch-markings>
      <path d={geometry.path(midfield, false)} />
      <path d={geometry.path(circle)} />
      <circle cx={center.x} cy={center.y} r="2.5" className={styles.center} />
    </g>
  );
}
