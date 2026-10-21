import { type ImageExportOptions } from "@/utils/image-export-options";
import { ExportWeather } from "./export-background";
import styles from "./match-grandstand.module.css";

const bannerOutlines = {
  pasto: "M2 2Q288 6 576 2T1150 2L1150 106Q864 111 576 108T2 106Z",
  natural: "M3 3Q280 8 576 3T1149 5L1151 105Q880 112 576 107T2 108Z",
  potrero: "M6 4Q280 11 575 3L847 6 1147 2 1150 43 1146 72 1151 106Q875 111 577 106T4 109L7 75 2 40Z",
};

export function MatchGrandstand({
  name,
  background,
  weather,
}: Pick<ImageExportOptions, "background" | "weather"> & { name: string }) {
  return (
    <header className={`${styles.grandstand} ${styles[background]}`} data-match-grandstand>
      <svg className={styles.terraces} viewBox="0 0 1280 160" aria-hidden="true">
        {/* Treads and risers widen toward the field to give the frontal stand depth. */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((row) => {
          const y = row * 20;
          const inset = 44 - row * 6;
          return <g key={row}>
            <path className={styles.tread} d={`M${inset} ${y}H${1280 - inset}l6 10H${inset - 6}Z`} />
            <path className={styles.riser} d={`M${inset - 6} ${y + 10}H${1286 - inset}v10H${inset - 6}Z`} />
            <path className={styles.edge} d={`M${inset - 6} ${y + 10}H${1286 - inset}`} />
          </g>;
        })}
        <path className={styles.aisle} d="M603 0H677L690 160H590Z" />
        <path className={styles.joints} d="M160 0L120 160M1120 0L1160 160" />
        {background === "natural" ? <path className={styles.wear} d="M58 28l20 2m1100 16-12 3M31 109l17-2m1180 34-24-1M96 7l25 1" /> : null}
        {background === "potrero" ? <path className={styles.grain} d="M50 6q65-5 118 0m939 18q70 4 111-1M26 65q60-4 104 0m1005 20q60-5 111-1M12 127q70 6 120 0m1004 18q53-4 119 0" /> : null}
      </svg>
      <ExportWeather weather={weather} />
      <div className={styles.banner} data-match-banner>
        <svg className={styles.fabric} viewBox="0 0 1152 112" preserveAspectRatio="none" aria-hidden="true">
          <path className={styles.cloth} d={bannerOutlines[background]} />
          <path className={styles.hem} d="M12 12Q290 17 576 12T1140 13M12 98Q290 105 576 99T1140 97" />
          <path className={styles.folds} d="M28 6q-8 48 0 98M1124 5q8 48 0 98M279 6q-6 48 0 99M873 5q6 48 0 100" />
          <path className={styles.foldLight} d="M33 6q-8 48 0 98M1119 5q8 48 0 98M284 6q-6 48 0 99M868 5q6 48 0 100" />
          {background === "potrero" ? <g className={styles.patch}>
            <path d="M1040 78l38-3 3 27-39 2Z" />
            <path className={styles.stitches} d="M1047 79v6m9-7v6m9-6v6m9-6v6m-25 14v6m9-7v6m9-6v6" />
          </g> : null}
          <g className={styles.eyelets}>
            <circle cx="13" cy="13" r="3" /><circle cx="1139" cy="13" r="3" />
          </g>
        </svg>
        <h1 className={styles.title} title={name}>{name}</h1>
      </div>
    </header>
  );
}
