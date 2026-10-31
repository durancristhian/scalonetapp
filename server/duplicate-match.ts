import type { DuplicateMatchResult } from "@/types/duplicate-match";
import type { BaseTeam } from "@/types/team";
import { getDuplicatedMatchName } from "@/utils/match-name";
import {
  MAX_PLAYERS_BATCH,
  MAX_PLAYERS_PER_MATCH,
} from "@/utils/player-limits";
import prisma from "@/utils/prisma";
import { getSavedTeamsError } from "@/utils/team-validation";
import { format } from "date-fns";
import { lockMatchOwner } from "@/server/lock-match-owner";

function readTeams(serialized: string, playerIds: number[]): BaseTeam[] {
  try {
    const value: unknown = JSON.parse(serialized);
    if (Array.isArray(value) && !value.length) return [];
    if (!getSavedTeamsError(value, playerIds)) return value as BaseTeam[];
  } catch {
    // Legacy saved teams may be malformed. The current roster can still be copied.
  }
  return [];
}

function playerKey(player: {
  name: string;
  level: number;
  position: string;
  avatar: string;
}): string {
  return JSON.stringify([
    player.name,
    player.level,
    player.position,
    player.avatar,
  ]);
}

export async function duplicateMatch(
  id: number,
  userId: string,
): Promise<DuplicateMatchResult> {
  return prisma.$transaction(async (transaction) => {
    await lockMatchOwner(transaction, userId);
    // Lock this owner's matches in a stable order: concurrent copies must see
    // each other's names/counts. Player additions also lock their parent match.
    await transaction.$queryRaw`
      SELECT "id" FROM "Match" WHERE "userId" = ${userId} ORDER BY "id" FOR UPDATE
    `;
    const source = await transaction.match.findFirst({
      where: { id, userId },
      include: { players: true },
    });
    if (!source) return { ok: false, code: "not_found" };
    if (source.players.length > MAX_PLAYERS_PER_MATCH)
      return { ok: false, code: "player_limit" };

    const matches = await transaction.match.findMany({
      where: { userId },
      select: { name: true },
    });
    if (
      matches.length >=
      Number(process.env.NEXT_PUBLIC_MAX_MATCHES_PER_USER ?? 100)
    ) {
      return { ok: false, code: "match_limit" };
    }
    const names = new Set(matches.map((match) => match.name));
    const timestamp = format(new Date(), "t");
    let name = getDuplicatedMatchName(source.name, timestamp);
    for (let attempt = 1; names.has(name); attempt++) {
      name = getDuplicatedMatchName(source.name, `${timestamp}-${attempt}`);
    }

    const teams = readTeams(
      source.teams,
      source.players.map((player) => player.id),
    );
    const copy = await transaction.match.create({ data: { name, userId } });
    const playerIds = new Map<number, number>();
    for (
      let offset = 0;
      offset < source.players.length;
      offset += MAX_PLAYERS_BATCH
    ) {
      const batch = source.players.slice(offset, offset + MAX_PLAYERS_BATCH);
      const created = await transaction.player.createManyAndReturn({
        data: batch.map(({ name, level, position, avatar }) => ({
          name,
          level,
          position,
          avatar,
          matchId: copy.id,
        })),
        select: {
          id: true,
          name: true,
          level: true,
          position: true,
          avatar: true,
        },
      });
      // RETURNING order is unspecified. Attributes also distinguish legacy duplicate names.
      const idsByPlayer = new Map<string, number[]>();
      for (const player of created) {
        const key = playerKey(player);
        const ids = idsByPlayer.get(key) ?? [];
        ids.push(player.id);
        idsByPlayer.set(key, ids);
      }
      for (const player of batch) {
        const newId = idsByPlayer.get(playerKey(player))?.pop();
        if (newId === undefined)
          throw new Error("Duplicated player mapping is incomplete");
        playerIds.set(player.id, newId);
      }
    }
    if (teams.length) {
      const mappedTeams = teams.map((team) => ({
        ...team,
        players: team.players.map((id) => {
          const newId = playerIds.get(id);
          if (newId === undefined)
            throw new Error("Duplicated team mapping is incomplete");
          return newId;
        }),
      }));
      await transaction.match.update({
        where: { id: copy.id },
        data: { teams: JSON.stringify(mappedTeams) },
      });
    }
    return { ok: true };
  });
}
