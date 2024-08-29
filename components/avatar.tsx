import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { default as BoringAvatar } from "boring-avatars";
import { FC } from "react";

type AvatarProps = {
  name: string;
  size?: number;
};

export const Avatar: FC<AvatarProps> = ({ name, size = 48 }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {/* This div here is necessary since the BoringAvatar component doesn't spread the ref. */}
          <div>
            <BoringAvatar name={name} variant="beam" size={size} />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>ee ke mirá? queré que te cague a trompada?</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
