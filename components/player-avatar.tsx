import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { default as BoringAvatar } from "boring-avatars";
import clsx from "clsx";
import { FC } from "react";

type AvatarSize = "sm" | "md" | "lg" | "xl";

const AVATAR_SIZE: Record<AvatarSize, number> = {
  sm: 24,
  md: 48,
  lg: 64,
  xl: 96,
};

type PlayerAvatarProps = {
  name: string;
  size?: AvatarSize;
  src: string;
};

export const PlayerAvatar: FC<PlayerAvatarProps> = ({
  name,
  size = "md",
  src,
}) => {
  return (
    <Avatar
      className={clsx(
        "ring-1 ring-black/5 shadow-md",
        size === "sm" && "h-6 w-6",
        size === "md" && "h-12 w-12",
        size === "lg" && "h-16 w-16",
        size === "xl" && "h-24 w-24"
      )}
    >
      <AvatarImage src={src} alt={`Avatar de ${name}`} />
      <AvatarFallback>
        <BoringAvatar variant="beam" name={name} size={AVATAR_SIZE[size]} />
      </AvatarFallback>
    </Avatar>
  );
};
