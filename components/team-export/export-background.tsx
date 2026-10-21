import { type ImageExportOptions } from "@/utils/image-export-options";
import {
  getImageExportBackgroundUrl,
  getImageExportWeatherUrl,
} from "@/utils/image-export-background";
import { cn } from "@/utils/cn";

// Shared by the live preview and PNG canvas.
// The parent provides a positioned box; this decorative layer does not affect layout.
export function ExportBackground({
  background,
  weather,
  outside = false,
}: Pick<ImageExportOptions, "background" | "weather"> & { outside?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-clip"
    >
      <span
        className={cn(
          "absolute inset-0",
          // Stripes retain their spacing; organic patches fill the field once.
          background === "pasto" ? "bg-repeat" : "bg-no-repeat",
          background === "pasto" || outside
            ? "[background-size:1280px_640px]"
            : "[background-size:100%_100%]",
          outside && "[filter:brightness(0.7)_saturate(0.75)_contrast(0.85)]",
        )}
        style={{
          backgroundImage: `url("${getImageExportBackgroundUrl(background)}")`,
        }}
      />
      <ExportWeather weather={weather} />
    </span>
  );
}

export function ExportWeather({
  weather,
  snowAccumulation = true,
}: Pick<ImageExportOptions, "weather"> & { snowAccumulation?: boolean }) {
  const overlay = getImageExportWeatherUrl(weather, snowAccumulation);
  return overlay ? (
    <span
      aria-hidden="true"
      className="absolute inset-0 bg-repeat [background-size:1280px_960px]"
      style={{
        backgroundImage: `url("${overlay}")`,
      }}
    />
  ) : null;
}
