import { type ImageExportOptions } from "@/utils/image-export-options";
import { getImageExportBackgroundUrl, getImageExportWeatherUrl } from "@/utils/image-export-background";
import styles from "./export-background.module.css";

// Shared by the live preview and PNG canvas.
// The parent provides a positioned box; this decorative layer does not affect layout.
export function ExportBackground({
  background,
  weather,
  outside = false,
}: Pick<ImageExportOptions, "background" | "weather"> & { outside?: boolean }) {
  return (
    <span aria-hidden="true" className={styles.layer}>
      <span className={`${styles.artwork} ${background === "pasto" ? "" : styles.continuous} ${outside ? styles.outsideArtwork : ""}`} style={{
        backgroundImage: `url("${getImageExportBackgroundUrl(background)}")`,
      }} />
      <ExportWeather weather={weather} />
    </span>
  );
}

export function ExportWeather({ weather }: Pick<ImageExportOptions, "weather">) {
  const overlay = getImageExportWeatherUrl(weather);
  return overlay ? <span aria-hidden="true" className={styles.weather} style={{
    backgroundImage: `url("${overlay}")`,
  }} /> : null;
}
