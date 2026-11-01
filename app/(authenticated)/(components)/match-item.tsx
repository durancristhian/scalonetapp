"use client";

import { DeleteMatch } from "@/app/(authenticated)/(components)/delete-match";
import { DuplicateMatch } from "@/app/(authenticated)/(components)/duplicate-match";
import { EditMatch } from "@/app/(authenticated)/(components)/edit-match";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type Match } from "@prisma/client";
import { formatDistanceToNowStrict } from "date-fns";
import { es } from "date-fns/locale/es";
import {
  CopyIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
} from "lucide-react";
import Link from "next/link";
import { type FC, useRef, useState } from "react";

type MatchItemProps = {
  disableDuplication: boolean;
  match: Match;
};

export const MatchItem: FC<MatchItemProps> = ({
  match,
  disableDuplication,
}) => {
  const [menuOpened, setMenuOpened] = useState(false);
  const [dialogId, setDialogId] = useState<
    "duplicate" | "edit" | "delete" | null
  >(null);

  const pendingDialog = useRef<typeof dialogId>(null);
  const menuTrigger = useRef<HTMLButtonElement>(null);
  const restoreFocus = (event: Event) => {
    event.preventDefault();
    menuTrigger.current?.focus();
  };

  return (
    <Card className="relative hover:bg-accent transition-colors">
      <Link
        href={`/partidos/${match.id}`}
        className="block rounded-[inherit] p-4"
      >
        <div className="min-h-8 pe-12">
          <CardTitle
            className="line-clamp-2 [overflow-wrap:anywhere]"
            title={match.name}
          >
            {match.name}
          </CardTitle>
        </div>
        <CardDescription className="[margin-block-start:theme(spacing.1)]">
          Última actualización:{" "}
          {formatDistanceToNowStrict(match.updatedAt, {
            locale: es,
          })}
        </CardDescription>
      </Link>
      <div className="absolute end-2 [inset-block-start:theme(spacing.2)]">
        <DropdownMenu open={menuOpened} onOpenChange={setMenuOpened}>
          <DropdownMenuTrigger asChild>
            <Button
              ref={menuTrigger}
              variant="ghost"
              size="icon"
              aria-label={`Acciones de ${match.name}`}
            >
              <EllipsisVerticalIcon className="h-4 text-muted-foreground w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="mr-4"
            onCloseAutoFocus={() => {
              const nextDialog = pendingDialog.current;
              pendingDialog.current = null;
              if (nextDialog) setDialogId(nextDialog);
            }}
          >
            <DropdownMenuItem
              onSelect={() => {
                pendingDialog.current = "duplicate";
              }}
              disabled={disableDuplication}
            >
              <CopyIcon className="h-4 mr-2 text-muted-foreground w-4" />
              Duplicar
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                pendingDialog.current = "edit";
              }}
            >
              <PencilIcon className="h-4 mr-2 text-muted-foreground w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                pendingDialog.current = "delete";
              }}
            >
              <TrashIcon className="h-4 mr-2 text-destructive w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {dialogId === "duplicate" ? (
          <DuplicateMatch
            id={match.id}
            onCloseAutoFocus={restoreFocus}
            onClose={() => {
              setDialogId(null);
              setMenuOpened(false);
            }}
          />
        ) : null}
        {dialogId === "edit" ? (
          <EditMatch
            match={match}
            onCloseAutoFocus={restoreFocus}
            onClose={() => {
              setDialogId(null);
              setMenuOpened(false);
            }}
          />
        ) : null}
        {dialogId === "delete" ? (
          <DeleteMatch
            id={match.id}
            onCloseAutoFocus={restoreFocus}
            onClose={() => {
              setDialogId(null);
              setMenuOpened(false);
            }}
          />
        ) : null}
      </div>
    </Card>
  );
};
