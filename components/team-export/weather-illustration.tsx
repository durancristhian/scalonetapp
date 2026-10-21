import { CloudRain, CloudSnow, Sun } from "lucide-react";
import { type ImageExportOptions } from "@/utils/image-export-options";

const weatherIcons = {
  none: Sun,
  rain: CloudRain,
  snow: CloudSnow,
};

export function WeatherIllustration({
  weather,
}: {
  weather: ImageExportOptions["weather"];
}) {
  const Icon = weatherIcons[weather];
  return (
    <Icon
      className="size-6 text-muted-foreground"
      aria-hidden="true"
      focusable="false"
    />
  );
}
