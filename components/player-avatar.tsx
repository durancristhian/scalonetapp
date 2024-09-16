import { SpicyTooltips } from "@/components/spicy-tooltips";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { default as BoringAvatar } from "boring-avatars";
import clsx from "clsx";
import { FC } from "react";

type AvatarSize = "sm" | "md" | "lg";

const AVATAR_SIZE: Record<AvatarSize, number> = {
  sm: 24,
  md: 48,
  lg: 64,
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
        size === "sm" && "h-6 w-6",
        size === "md" && "h-12 w-12",
        size === "lg" && "h-16 w-16"
      )}
    >
      <AvatarImage src={src} alt={`Avatar de ${name}`} />
      <AvatarFallback>
        <SpicyTooltips>
          <BoringAvatar variant="beam" name={name} size={AVATAR_SIZE[size]} />
        </SpicyTooltips>
      </AvatarFallback>
    </Avatar>
  );
};
