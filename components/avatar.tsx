"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { default as BoringAvatar } from "boring-avatars";
import throttle from "lodash.throttle";
import { FC, useState } from "react";

const TOOLTIP_MESSAGES = [
  "ee ke mirá? queré que te cague a trompada?",
  "Te lo dije enserio!, payaso!",
  "No bueno, me estás tomando el pelo? (Aunque no tengo hehe)",
  "No te conozco pero dame tu url y te voy a buscar a ver si te la bancás",
];

type AvatarProps = {
  name: string;
  size?: number;
};

export const Avatar: FC<AvatarProps> = ({ name, size = 48 }) => {
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
          {/* This div here is necessary since the BoringAvatar component doesn't spread the ref AND we need an element to attach an event listener so we can display different tooltip messages */}
          <div onMouseEnter={handleMouseEnter}>
            <BoringAvatar name={name} variant="beam" size={size} />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{TOOLTIP_MESSAGES[tooltipIndex]}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
