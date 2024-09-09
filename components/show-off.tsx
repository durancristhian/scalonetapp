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
        <Button variant="link">
          Hecho por&nbsp;
          <span className="font-bold">Cristhian Duran</span>
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="text-left w-80">
        <div className="flex gap-4">
          <Avatar>
            <AvatarImage
              src="/me.jpg"
              alt="Mi foto de perfil descansando en Merlo, San Luis, Argentina"
            />
            <AvatarFallback>CD</AvatarFallback>
          </Avatar>
          <div className="grow">
            <div className="flex flex-col gap-1">
              <h4 className="font-semibold">Cristhian Duran</h4>
              <p className="text-sm">
                Programador front-end de Buenos Aires, Argentina.
              </p>
              <div className="flex gap-2 items-center mt-4">
                <MailIcon className="h-4 text-slate-700 w-4" />
                <span className="text-xs text-muted-foreground text-slate-700">
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
