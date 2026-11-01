import { getImageExportWeatherUrl } from "@/utils/image-export-background";
import type { ImageExportOptions } from "@/utils/image-export-options";
import type { ExportLayout } from "./export-layout";
import styles from "./export-weather.module.css";

export function ExportWeather({
  weather,
  layout,
}: {
  weather: ImageExportOptions["weather"];
  layout: ExportLayout;
}) {
  if (weather === "none") return null;
  const field = getImageExportWeatherUrl(weather)!;
  const stand = getImageExportWeatherUrl(weather, false)!;
  return (
    <div
      className={styles.weather}
      aria-hidden="true"
      data-export-weather={weather}
    >
      <span
        className={styles.layer}
        style={{
          blockSize: layout.standHeight,
          backgroundImage: `url("${stand}")`,
        }}
      />
      <span
        className={styles.layer}
        style={{
          insetBlockStart: layout.standHeight,
          blockSize: layout.fieldHeight,
          backgroundImage: `url("${field}")`,
        }}
      />
    </div>
  );
}
