"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getPlayerAvatarUrl } from "@/utils/player-avatar";
import {
  DEFAULT_COLOR_PALETTE,
  type ColorPaletteId,
} from "@/utils/color-palettes";
import { cn } from "@/utils/cn";
import { useEffect, useState, type FC } from "react";

type AvatarSize = "sm" | "md" | "lg" | "xl";

type PlayerAvatarProps = {
  src?: string;
  name: string;
  size?: AvatarSize;
  shape?: "circle" | "square";
  palette?: ColorPaletteId;
  className?: string;
};

export const PlayerAvatar: FC<PlayerAvatarProps> = ({
  src,
  name,
  size = "md",
  shape = "square",
  palette = DEFAULT_COLOR_PALETTE,
  className,
}) => {
  const [failed, setFailed] = useState<string | undefined>();
  useEffect(() => {
    if (!src) return;
    const probe = new Image();
    const timer = setTimeout(() => setFailed(src), 5000);
    probe.onload = () => clearTimeout(timer);
    probe.onerror = () => {
      clearTimeout(timer);
      setFailed(src);
    };
    probe.src = src;
    return () => {
      clearTimeout(timer);
      probe.onload = null;
      probe.onerror = null;
    };
  }, [src]);
  const image = src && failed !== src ? src : getPlayerAvatarUrl(name, palette);
  return (
    <Avatar
      className={cn(
        "border border-border shadow-sm",
        shape === "square" ? "rounded-md" : "rounded-full",
        size === "sm" && "size-6",
        size === "md" && "size-12",
        size === "lg" && "size-16",
        size === "xl" && "size-24",
        className,
      )}
    >
      <AvatarImage
        src={image}
        onLoadingStatusChange={(status) => {
          if (status === "error" && src) setFailed(src);
        }}
        alt={`Avatar de ${name}`}
      />
      <AvatarFallback
        role="img"
        aria-label={`Avatar de ${name}`}
        className="rounded-[inherit]"
      >
        {Array.from(name.trim())[0]?.toLocaleUpperCase("es") || "?"}
      </AvatarFallback>
    </Avatar>
  );
};
