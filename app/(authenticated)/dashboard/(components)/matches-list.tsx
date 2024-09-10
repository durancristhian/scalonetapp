"use client";

import { MatchItem } from "@/app/(authenticated)/dashboard/(components)/match-item";
import { AnimatedListItem } from "@/components/animated-list-item";
import { EmptyState } from "@/components/empty-state";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { byName } from "@/utils/by-name";
import { Match } from "@prisma/client";
import {
  AlertCircleIcon,
  ArrowDownAZIcon,
  ArrowUpZAIcon,
  ClockArrowDownIcon,
  LucideIcon,
} from "lucide-react";
import { FC, useMemo, useState } from "react";

type SortingOption = {
  label: string;
  icon: LucideIcon;
  value: string;
};

const DEFAULT_SORTING_OPTION = {
  label: "Última actualización (Desc)",
  icon: ClockArrowDownIcon,
  value: "last-update",
};

const SORTING_OPTIONS: SortingOption[] = [
  DEFAULT_SORTING_OPTION,
  {
    label: "Orden alfabético (A -> Z)",
    icon: ArrowDownAZIcon,
    value: "alphabetical",
  },
  {
    label: "Orden alfabético Desc (Z -> A)",
    icon: ArrowUpZAIcon,
    value: "alphabetical-revert",
  },
];

type MatchsListProps = {
  matches: Match[];
};

export const MatchesList: FC<MatchsListProps> = ({ matches }) => {
  const [currSortingOption, setCurrSortingOption] = useState<SortingOption>(
    DEFAULT_SORTING_OPTION
  );

  const Icon = currSortingOption.icon;

  /* We can sort the matches array in the client since we'll always have the entire matches list (Unless we change the query) */
  const list = useMemo(() => {
    if (currSortingOption.value === "alphabetical") {
      return [...matches].sort(byName);
    }

    if (currSortingOption.value === "alphabetical-revert") {
      return [...matches].sort(byName).reverse();
    }

    /* If we're using the default sorting option, we just return the array as it is since is how we're getting the data from Prisma */
    return matches;
  }, [currSortingOption.value, matches]);

  const canListMatches = Array.isArray(list) && list.length;

  return (
    <div className="grid gap-4">
      <div className="flex gap-4 items-center justify-between">
        <h2 className="font-bold text-xl">Tus partidos</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Icon className="h-4 mr-2 text-muted-foreground w-4" />
              {currSortingOption.label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="mr-4">
            {SORTING_OPTIONS.map((sortingOption) => {
              const Icon = sortingOption.icon;

              return (
                <DropdownMenuCheckboxItem
                  key={sortingOption.value}
                  checked={currSortingOption.value === sortingOption.value}
                  onCheckedChange={() => {
                    setCurrSortingOption(sortingOption);
                  }}
                >
                  <Icon className="h-4 mr-2 text-muted-foreground w-4" />
                  {sortingOption.label}
                </DropdownMenuCheckboxItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {canListMatches ? (
        <>
          {list.length >=
          Number(process.env.NEXT_PUBLIC_MAX_MATCHES_PER_USER) ? (
            <Alert variant="destructive">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertTitle>
                ¡Alto ahí, entrenador! ¡Llegaste al límite!
              </AlertTitle>
              <AlertDescription>
                Parece que ya tienes&nbsp;
                {process.env.NEXT_PUBLIC_MAX_MATCHES_PER_USER} partidos creados.
                Antes de añadir otro, te sugerimos despedir a uno de tus
                encuentros más viejitos. ¡Elimina un partido y dale lugar a
                nuevas glorias futbolísticas!
              </AlertDescription>
            </Alert>
          ) : null}
          {list.map((match, idx) => (
            <AnimatedListItem key={match.id} listIndex={idx}>
              <MatchItem match={match} />
            </AnimatedListItem>
          ))}
        </>
      ) : (
        <EmptyState>
          Silencio atroz... hasta que crees un partido y hagas que la hinchada
          ruja. ¡Vamos, empieza ya!
        </EmptyState>
      )}
    </div>
  );
};
