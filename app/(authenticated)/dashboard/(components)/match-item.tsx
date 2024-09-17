"use client";

import { DeleteMatch } from "@/app/(authenticated)/dashboard/(components)/delete-match";
import { EditMatch } from "@/app/(authenticated)/dashboard/(components)/edit-match";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Match } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale/es";
import { EllipsisVerticalIcon, PencilIcon, TrashIcon } from "lucide-react";
import Link from "next/link";
import { FC, useState } from "react";

type MatchItemProps = {
  match: Match;
};

export const MatchItem: FC<MatchItemProps> = ({ match }) => {
  const [menuOpened, setMenuOpened] = useState(false);
  /* This is not great at all but enough for now due to the small amout of options we have in the dropdown menu */
  const [dialogId, setDialogId] = useState<"edit" | "delete" | null>(null);

  return (
    <Card className="hover:bg-accent transition-colors">
      <div className="flex items-center justify-between">
        <div className="grow">
          <Link href={`/partidos/${match.id}`}>
            <div className="p-4 space-y-1">
              <CardTitle>{match.name}</CardTitle>
              <CardDescription>
                Última actualización:{" "}
                {formatDistanceToNow(match.updatedAt, {
                  locale: es,
                })}
              </CardDescription>
            </div>
          </Link>
        </div>
        <div className="flex-shrink-0">
          <DropdownMenu open={menuOpened} onOpenChange={setMenuOpened}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <EllipsisVerticalIcon className="h-4 text-muted-foreground w-4" />
              </Button>
            </DropdownMenuTrigger>
            {/* margin here helps to detach the menu from the limit of the screen (specially in mobile) */}
            <DropdownMenuContent className="mr-4">
              <DropdownMenuItem
                onClick={() => {
                  setDialogId("edit");
                }}
              >
                <PencilIcon className="h-4 mr-2 text-muted-foreground w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setDialogId("delete");
                }}
              >
                <TrashIcon className="h-4 mr-2 text-destructive w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {dialogId === "edit" ? (
            <EditMatch
              match={match}
              onClose={() => {
                setDialogId(null);
                setMenuOpened(false);
              }}
            />
          ) : null}
          {dialogId === "delete" ? (
            <DeleteMatch
              id={match.id}
              onClose={() => {
                setDialogId(null);
                setMenuOpened(false);
              }}
            />
          ) : null}
        </div>
      </div>
    </Card>
  );
};
