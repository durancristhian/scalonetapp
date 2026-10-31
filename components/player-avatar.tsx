"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getPlayerAvatarUrl } from "@/utils/player-avatar";
import {
  DEFAULT_COLOR_PALETTE,
  type ColorPaletteId,
} from "@/utils/color-palettes";
import { cn } from "@/utils/cn";
import { useEffect, useRef, useState, type FC } from "react";

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
  const photoTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    if (!src) return;
    // AvatarImage already preloads the photo. Reuse its loading status below.
    photoTimeout.current = setTimeout(() => setFailed(src), 5000);
    return () => {
      clearTimeout(photoTimeout.current);
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
          if (status === "loaded" || status === "error") {
            clearTimeout(photoTimeout.current);
          }
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
