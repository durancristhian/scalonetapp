import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { MailIcon } from "lucide-react";

export const ShowOff = () => {
  return (
    <HoverCard>
      <HoverCardTrigger>
        <Button variant="link" className="text-foreground">
          Hecho por&nbsp;
          <span className="font-bold">Cristhian Duran</span>
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="text-left w-80">
        <div className="flex gap-4">
          <Avatar>
            <AvatarImage
              src="/me.jpg"
              alt="Descansando en Merlo, San Luis, Argentina"
            />
            <AvatarFallback>CD</AvatarFallback>
          </Avatar>
          <div className="grow">
            <div className="flex flex-col gap-1">
              <h4 className="font-bold">Cristhian Duran</h4>
              <p className="text-sm">
                Programador front-end de Buenos Aires, Argentina.
              </p>
              <div className="flex gap-2 items-center mt-4">
                <MailIcon className="h-4 text-muted-foreground w-4" />
                <span className="text-muted-foreground text-xs">
                  durancristhian@gmail.com
                </span>
              </div>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
