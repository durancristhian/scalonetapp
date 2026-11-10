import { publicContact } from "@/utils/public-content";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import clsx from "clsx";
import { MailIcon } from "lucide-react";
import { type FC } from "react";

type ShowOffProps = {
  popoverSeparation?: boolean;
  className?: string;
};

export const ShowOff: FC<ShowOffProps> = ({ popoverSeparation, className }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="link" className={className}>
          Hecho por&nbsp;
          <span className="font-bold">Cristhian Duran</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={clsx(
          "max-w-[calc(100vw-2rem)]",
          popoverSeparation && "me-4",
        )}
      >
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <Avatar>
              <AvatarImage
                src="/me.jpg"
                alt="Descansando en Merlo, San Luis, Argentina"
              />
              <AvatarFallback>CD</AvatarFallback>
            </Avatar>
            <div className="min-w-0 grow">
              <h4 className="font-bold">Cristhian Duran</h4>
              <p className="text-base">
                Programador front-end de Buenos Aires, Argentina.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MailIcon className="size-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 break-words text-muted-foreground text-sm">
              {publicContact.email}
            </span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
