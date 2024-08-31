"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import throttle from "lodash.throttle";
import { FC, PropsWithChildren, useState } from "react";

const TOOLTIP_MESSAGES = [
  "ee ke mirá? queré que te cague a trompada?",
  "Te lo dije enserio!, payaso!",
  "No bueno, me estás tomando el pelo? (Aunque no tengo hehe)",
  "No te conozco pero dame tu url y te voy a buscar a ver si te la bancás",
];

export const SpicyTooltips: FC<PropsWithChildren> = ({ children }) => {
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
          <div onMouseEnter={handleMouseEnter}>{children}</div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{TOOLTIP_MESSAGES[tooltipIndex]}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
