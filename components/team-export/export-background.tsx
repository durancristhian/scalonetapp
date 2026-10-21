import { type ImageExportOptions } from "@/utils/image-export-options";
import { getImageExportBackgroundUrl, getImageExportWeatherUrl } from "@/utils/image-export-background";
import styles from "./export-background.module.css";

// Shared by the live preview and PNG canvas.
// The parent provides a positioned box; this decorative layer does not affect layout.
export function ExportBackground({
  background,
  weather,
}: Pick<ImageExportOptions, "background" | "weather">) {
  const overlay = getImageExportWeatherUrl(weather);
  return (
    <span aria-hidden="true" className={styles.layer}>
      <span className={`${styles.artwork} ${background === "pasto" ? "" : styles.continuous}`} style={{
        backgroundImage: `url("${getImageExportBackgroundUrl(background)}")`,
      }} />
      {overlay ? <span className={styles.weather} style={{
        backgroundImage: `url("${overlay}")`,
      }} /> : null}
    </span>
  );
}
