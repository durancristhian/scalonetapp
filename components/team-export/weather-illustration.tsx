import { CloudRain, CloudSnow, Sun } from "lucide-react";
import { type ImageExportOptions } from "@/utils/image-export-options";

const weatherIcons = {
  none: { icon: Sun, color: "#C18A27" },
  rain: { icon: CloudRain, color: "#6193AA" },
  snow: { icon: CloudSnow, color: "#80A9B9" },
};

export function WeatherIllustration({ weather }: { weather: ImageExportOptions["weather"] }) {
  const { icon: Icon, color } = weatherIcons[weather];
  return <Icon size={32} strokeWidth={1.5} color={color} aria-hidden="true" focusable="false" />;
}
