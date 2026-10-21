"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getPlayerAvatarUrl } from "@/utils/player-avatar";
import { DEFAULT_COLOR_PALETTE, type ColorPaletteId } from "@/utils/color-palettes";
import clsx from "clsx";
import { useEffect, useState, type FC } from "react";
import styles from "./player-avatar.module.css";

type AvatarSize = "sm" | "md" | "lg" | "xl";

type PlayerAvatarProps = {
  src?: string;
  name: string;
  size?: AvatarSize;
  shape?: "circle" | "square";
  palette?: ColorPaletteId;
};

export const PlayerAvatar: FC<PlayerAvatarProps> = ({
  src,
  name,
  size = "md",
  shape = "square",
  palette = DEFAULT_COLOR_PALETTE,
}) => {
  const [failed, setFailed] = useState<string | undefined>();
  useEffect(() => {
    if (!src) return;
    const probe = new Image();
    const timer = setTimeout(() => setFailed(src), 5000);
    probe.onload = () => clearTimeout(timer);
    probe.onerror = () => { clearTimeout(timer); setFailed(src); };
    probe.src = src;
    return () => { clearTimeout(timer); probe.onload = null; probe.onerror = null; };
  }, [src]);
  const image = src && failed !== src ? src : getPlayerAvatarUrl(name, palette);
  return (
    <Avatar
      className={clsx(
        styles.avatar,
        styles[shape],
        size === "sm" && "h-6 w-6",
        size === "md" && "h-12 w-12",
        size === "lg" && "h-16 w-16",
        size === "xl" && "h-24 w-24"
      )}
    >
      <AvatarImage src={image} onLoadingStatusChange={status => { if (status === "error" && src) setFailed(src); }} alt={`Avatar de ${name}`} />
      <AvatarFallback role="img" aria-label={`Avatar de ${name}`} className={styles.fallback}>
        {Array.from(name.trim())[0]?.toLocaleUpperCase("es") || "?"}
      </AvatarFallback>
    </Avatar>
  );
};
