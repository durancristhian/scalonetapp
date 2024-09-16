import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MailIcon } from "lucide-react";

export const ShowOff = () => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="link">
          Hecho por&nbsp;
          <span className="font-bold">Cristhian Duran</span>
        </Button>
      </PopoverTrigger>
      {/* margin here helps to detach the menu from the limit of the screen (specially in mobile) */}
      <PopoverContent className="mr-4">
        <div className="space-y-4">
          <Avatar>
            <AvatarImage
              src="/me.jpg"
              alt="Descansando en Merlo, San Luis, Argentina"
            />
            <AvatarFallback>CD</AvatarFallback>
          </Avatar>
          <div className="grow">
            <div className="space-y-1">
              <h4 className="font-bold">Cristhian Duran</h4>
              <p className="text-sm">
                Programador front-end de Buenos Aires, Argentina.
              </p>
              <div className="mt-4 space-x-2">
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
