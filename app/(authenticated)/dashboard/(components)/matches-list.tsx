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
  ArrowUpAZIcon,
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
  label: "Última actualización",
  icon: ClockArrowDownIcon,
  value: "last-update",
};

const SORTING_OPTIONS: SortingOption[] = [
  DEFAULT_SORTING_OPTION,
  {
    label: "Orden A > Z",
    icon: ArrowDownAZIcon,
    value: "alphabetical",
  },
  {
    label: "Orden Z > A",
    icon: ArrowUpAZIcon,
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
        {/* We put this element with specific height here so we don't have a layout shift when the button (dropdown trigger) is not rendered */}
        <div className="h-9">
          {canListMatches ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Icon className="h-4 mr-2 text-muted-foreground w-4" />
                  {currSortingOption.label}
                </Button>
              </DropdownMenuTrigger>
              {/* margin-right here helps to detach the menu from the right limit of the screen (specially in mobile) */}
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
          ) : null}
        </div>
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
                Ya tienes {process.env.NEXT_PUBLIC_MAX_MATCHES_PER_USER}{" "}
                partidos creados. Te sugerimos despedir a uno de tus encuentros
                más viejitos para darle lugar a nuevas glorias futbolísticas!
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
          Silencio atroz... hasta que crees tu primer partido. ¡Vamos, empieza
          ya!
        </EmptyState>
      )}
    </div>
  );
};
