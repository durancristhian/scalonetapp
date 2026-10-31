import type { PitchGeometry } from "./pitch-geometry";
import styles from "./stadium-lighting.module.css";

export function StadiumLighting({
  geometry,
  id,
}: {
  geometry: PitchGeometry;
  id: string;
}) {
  const bottom = Math.min(290, geometry.height);
  return (
    <g data-export-stadium-lighting>
      <defs>
        <filter id={`${id}-lamp-glow`}>
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <linearGradient id={`${id}-beam`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="var(--export-lamp-color)" stopOpacity=".1" />
          <stop
            offset="1"
            stopColor="var(--export-lamp-color)"
            stopOpacity="0"
          />
        </linearGradient>
        <radialGradient id={`${id}-wash`} cx="50%" cy="0%" r="85%">
          <stop stopColor="var(--export-divider-color)" stopOpacity=".12" />
          <stop
            offset="1"
            stopColor="var(--export-divider-color)"
            stopOpacity="0"
          />
        </radialGradient>
        <linearGradient id={`${id}-shade`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="black" stopOpacity=".14" />
          <stop offset=".35" stopColor="black" stopOpacity="0" />
          <stop offset="1" stopColor="black" stopOpacity=".1" />
        </linearGradient>
      </defs>
      <path d={geometry.fieldPath} fill={`url(#${id}-wash)`} />
      <path d={geometry.fieldPath} fill={`url(#${id}-shade)`} />
      {[18, geometry.width - 82].map((x, index) => (
        <g key={x}>
          <path
            d={`M${x + 32} 34L${index ? geometry.width - 304 : 304} ${bottom}H${index ? geometry.width : 0}Z`}
            fill={`url(#${id}-beam)`}
          />
          <path
            d={`M${x + 32} 36V${geometry.standHeight}`}
            className={styles.pole}
          />
          <ellipse
            cx={x + 32}
            cy="23"
            rx="43"
            ry="14"
            className={styles.glow}
            filter={`url(#${id}-lamp-glow)`}
          />
          <rect
            x={x}
            y="15"
            width="64"
            height="19"
            rx="2"
            className={styles.housing}
          />
          {[0, 1, 2, 3].map((lamp) => (
            <rect
              key={lamp}
              x={x + 5 + lamp * 14}
              y="19"
              width="11"
              height="10"
              rx="1"
              className={styles.lamp}
            />
          ))}
        </g>
      ))}
    </g>
  );
}
