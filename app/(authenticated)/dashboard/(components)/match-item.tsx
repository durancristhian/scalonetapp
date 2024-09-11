"use client";

import { DeleteMatch } from "@/app/(authenticated)/dashboard/(components)/delete-match";
import { EditMatch } from "@/app/(authenticated)/dashboard/(components)/edit-match";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Match } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale/es";
import {
  ChevronRightIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
} from "lucide-react";
import Link from "next/link";
import { FC, useState } from "react";

type MatchItemProps = {
  match: Match;
};

export const MatchItem: FC<MatchItemProps> = ({ match }) => {
  const [dialogId, setDialogId] = useState<"edit" | "delete" | null>(null);

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <EllipsisVerticalIcon className="h-4 text-muted-foreground w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onSelect={() => {
              setDialogId("edit");
            }}
          >
            <PencilIcon className="h-4 mr-2 text-muted-foreground w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
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
          }}
        />
      ) : null}
      {dialogId === "delete" ? (
        <DeleteMatch
          id={match.id}
          onClose={() => {
            setDialogId(null);
          }}
        />
      ) : null}
      <div className="grow">
        <Link href={`/partidos/${match.id}`}>
          <div className="bg-white border border-border hover:bg-accent px-4 py-2 rounded-md transition-colors">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p>{match.name}</p>
                <p className="text-muted-foreground text-sm">
                  Última actualización:&nbsp;
                  {formatDistanceToNow(match.updatedAt, {
                    locale: es,
                  })}
                </p>
              </div>
              <ChevronRightIcon className="h-4 text-muted-foreground w-4" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};
