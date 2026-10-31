import { useId, type ReactNode } from "react";
import type { ImageExportOptions } from "@/utils/image-export-options";
import type { ExportLayout } from "./export-layout";
import { createPitchGeometry } from "./pitch-geometry";
import { PitchFrame } from "./pitch-frame";
import { PitchSurface } from "./pitch-surface";
import { PitchMarkings } from "./pitch-markings";
import { StadiumStand } from "./stadium-stand";
import { StadiumLighting } from "./stadium-lighting";
import { ExportWeather } from "./export-weather";
import styles from "./pitch-scene.module.css";

type Props = {
  options: ImageExportOptions;
  layout: ExportLayout;
  children: ReactNode;
};

export function PitchScene({ options, layout, children }: Props) {
  const id = `pitch-${useId().replace(/:/g, "")}`;
  const geometry = createPitchGeometry(layout.fieldHeight);
  return (
    <div className={styles.scene} data-export-pitch-scene>
      <svg
        className={styles.illustration}
        viewBox={`0 0 ${geometry.width} ${geometry.height}`}
        width={geometry.width}
        height={geometry.height}
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <clipPath id={`${id}-field`}>
            <path d={geometry.fieldPath} />
          </clipPath>
        </defs>
        <StadiumStand geometry={geometry} />
        <g clipPath={`url(#${id}-field)`}>
          <PitchSurface
            background={options.background}
            geometry={geometry}
            id={id}
          />
          <PitchMarkings background={options.background} geometry={geometry} />
        </g>
        <PitchFrame geometry={geometry} />
        <StadiumLighting geometry={geometry} id={id} />
      </svg>
      <ExportWeather weather={options.weather} layout={layout} />
      <div className={styles.players}>{children}</div>
    </div>
  );
}
