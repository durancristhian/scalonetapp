import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import clsx from "clsx";
import { MailIcon } from "lucide-react";
import { FC } from "react";

type ShowOffProps = {
  popoverSeparation?: boolean;
};

export const ShowOff: FC<ShowOffProps> = ({ popoverSeparation }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="link">
          Hecho por&nbsp;
          <span className="font-bold">Cristhian Duran</span>
        </Button>
      </PopoverTrigger>
      {/* Margin here helps to detach the menu from the limit of the screen (specially in mobile) */}
      <PopoverContent className={clsx(popoverSeparation && "mr-4")}>
        <div className="flex gap-4">
          <Avatar>
            <AvatarImage
              src="/me.jpg"
              alt="Descansando en Merlo, San Luis, Argentina"
            />
            <AvatarFallback>CD</AvatarFallback>
          </Avatar>
          <div className="grow">
            <div className="space-y-4">
              <div>
                <h4 className="font-bold">Cristhian Duran</h4>
                <p className="text-sm">
                  Programador front-end de Buenos Aires, Argentina.
                </p>
              </div>
              <div className="flex gap-2 items-center">
                <MailIcon className="h-4 text-muted-foreground w-4" />
                <span className="text-muted-foreground text-xs">
                  durancristhian@gmail.com
                </span>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
