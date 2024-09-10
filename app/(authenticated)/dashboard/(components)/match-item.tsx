"use client";

import { DeleteMatch } from "@/app/(authenticated)/dashboard/(components)/delete-match";
import { EditMatch } from "@/app/(authenticated)/dashboard/(components)/edit-match";
import { Match } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale/es";
import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { FC } from "react";

type MatchItemProps = {
  match: Match;
};

export const MatchItem: FC<MatchItemProps> = ({ match }) => {
  return (
    <div className="flex items-center gap-2">
      <DeleteMatch id={match.id} />
      <EditMatch match={match} />
      <div className="grow">
        <Link href={`/partidos/${match.id}`}>
          <div className="border border-slate-300 hover:bg-slate-100 px-4 py-2 rounded-md transition-colors">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p>{match.name}</p>
                <p className="text-slate-500 text-sm">
                  Última actualización:&nbsp;
                  {formatDistanceToNow(match.updatedAt, {
                    locale: es,
                  })}
                </p>
              </div>
              <ChevronRightIcon className="h-4 text-slate-500 w-4" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};
