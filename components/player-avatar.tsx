import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getPlayerAvatarUrl } from "@/utils/player-avatar";
import clsx from "clsx";
import { type FC } from "react";

type AvatarSize = "sm" | "md" | "lg" | "xl";

type PlayerAvatarProps = {
  name: string;
  size?: AvatarSize;
};

export const PlayerAvatar: FC<PlayerAvatarProps> = ({
  name,
  size = "md",
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
      <AvatarImage src={getPlayerAvatarUrl(name)} alt={`Avatar de ${name}`} />
      <AvatarFallback role="img" aria-label={`Avatar de ${name}`}>
        {Array.from(name.trim())[0]?.toLocaleUpperCase("es") || "?"}
      </AvatarFallback>
    </Avatar>
  );
};
