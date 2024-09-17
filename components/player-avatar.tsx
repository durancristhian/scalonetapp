import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { default as BoringAvatar } from "boring-avatars";
import clsx from "clsx";
import throttle from "lodash.throttle";
import { FC, PropsWithChildren, useState } from "react";

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

const TOOLTIP_MESSAGES = [
  "ee ke mirá? queré que te cague a trompada?",
  "Te lo dije enserio!, payaso!",
  "No bueno, me estás tomando el pelo? (Aunque no tengo hehe)",
  "No te conozco pero dame tu url y te voy a buscar a ver si te la bancás",
];

const SpicyTooltips: FC<PropsWithChildren> = ({ children }) => {
  const [tooltipIndex, setTooltipIndex] = useState(-1);

  const handleMouseEnter = throttle(() => {
    setTooltipIndex(
      tooltipIndex + 1 === TOOLTIP_MESSAGES.length ? 0 : tooltipIndex + 1
    );
  }, 1000);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {/* We need this div here with a listener so we don't pollute children with extra event handlers */}
          <div onMouseEnter={handleMouseEnter}>{children}</div>
        </TooltipTrigger>
        <TooltipContent>{TOOLTIP_MESSAGES[tooltipIndex]}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
