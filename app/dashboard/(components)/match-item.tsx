"use client";

import { DeleteMatch } from "@/app/dashboard/(components)/delete-match";
import { EditMatch } from "@/app/dashboard/(components)/edit-match";
import { Match } from "@prisma/client";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { FC } from "react";

type MatchItemProps = {
  match: Match;
};

export const MatchItem: FC<MatchItemProps> = ({ match }) => {
  return (
    <div className="flex items-center gap-2">
      <DeleteMatch matchId={match.id} />
      <EditMatch match={match} />
      <div className="grow">
        <Link href={`/matches/${match.id}`}>
          <div className="border border-slate-300 hover:bg-slate-50 px-4 py-2 rounded-md transition-colors">
            <div className="flex items-center justify-between gap-4">
              <p>{match.name}</p>
              <ArrowRightIcon className="h-4 text-slate-500 w-4" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};
