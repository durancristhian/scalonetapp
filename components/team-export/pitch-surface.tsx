import { getImageExportBackgroundUrl } from "@/utils/image-export-background";
import type { ImageExportBackgroundId } from "@/utils/image-export-backgrounds";
import type { PitchGeometry } from "./pitch-geometry";
import styles from "./pitch-surface.module.css";

type Props = { background: ImageExportBackgroundId; geometry: PitchGeometry; id: string };

export function PitchSurface({ background, geometry, id }: Props) {
  const bands = Math.max(9, Math.ceil(geometry.fieldHeight / 88));
  return (
    <g data-export-pitch-surface data-surface={background}>
      <defs>
        <pattern id={`${id}-texture`} width={geometry.width} height="960" patternUnits="userSpaceOnUse">
          <image href={getImageExportBackgroundUrl(background)} width={geometry.width} height="960" preserveAspectRatio="none" />
        </pattern>
        <pattern id={`${id}-grain`} width="91" height="79" patternUnits="userSpaceOnUse">
          <circle cx="8" cy="18" r=".7" fill="white" opacity=".07" />
          <circle cx="43" cy="58" r=".7" fill="black" opacity=".12" />
          <circle cx="77" cy="30" r=".5" fill="white" opacity=".08" />
        </pattern>
      </defs>
      <path d={geometry.fieldPath} className={styles.base} />
      {background === "pasto" ? Array.from({ length: bands }, (_, index) => (
        <path key={index} className={index % 2 ? styles.stripe : styles.base} d={geometry.path([[0, index / bands], [1, index / bands], [1, (index + 1) / bands], [0, (index + 1) / bands]])} />
      )) : null}
      <path d={geometry.fieldPath} fill={`url(#${id}-texture)`} className={styles.texture} />
      <path d={geometry.fieldPath} fill={`url(#${id}-grain)`} />
    </g>
  );
}
