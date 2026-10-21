import type { PlayerSchema } from "@/schemas/player";
import prisma from "../../utils/prisma.ts";
import { ERROR_MESSAGES } from "../../utils/error-messages.ts";
import { getPlayerAdditionError } from "../../utils/player-limits.ts";
import { removePlayerFromSavedTeams } from "../../utils/remove-player-from-saved-teams.ts";
import type { Player, Prisma } from "@prisma/client";

export class PlayerAdditionError extends Error {}

async function addPlayersAtomically<T>(
  matchId: number,
  userId: string,
  players: PlayerSchema[],
  insert: (transaction: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  return prisma.$transaction(async transaction => {
    // All individual/bulk additions lock the same parent row before counting.
    const matches = await transaction.$queryRaw<{ id: number }[]>`
      SELECT "id" FROM "Match" WHERE "id" = ${matchId} AND "userId" = ${userId} FOR UPDATE
    `;
    if (!matches.length) throw new Error(ERROR_MESSAGES.not_found);

    const count = await transaction.player.count({ where: { matchId } });
    const limitError = getPlayerAdditionError(count, players.length);
    if (limitError) throw new PlayerAdditionError(limitError);

    const names = players.map(player => player.name);
    const existing = await transaction.player.findFirst({ where: { matchId, name: { in: names } }, select: { id: true } });
    if (new Set(names).size !== names.length || existing) {
      throw new PlayerAdditionError(ERROR_MESSAGES.match_players_repeated);
    }
    return insert(transaction);
  }, { isolationLevel: "ReadCommitted" });
}

export const addPlayerQuery: (
  matchId: number,
  data: PlayerSchema,
  userId: string,
) => Promise<Player> = async (matchId, data, userId) => {
  return addPlayersAtomically(matchId, userId, [data], transaction => transaction.player.create({
    data: {
      ...data,
      matchId,
    },
  }));
};

export const addMultiplePlayersQuery: (
  matchId: number,
  data: PlayerSchema[],
  userId: string,
) => Promise<Prisma.BatchPayload> = async (matchId, data, userId) => {
  const nextPlayers = data.map((player) => ({
    ...player,
    matchId,
  }));

  return addPlayersAtomically(matchId, userId, data, transaction => transaction.player.createMany({
    data: nextPlayers,
  }));
};

export const editPlayerQuery: (
  id: number,
  userId: string,
  data: PlayerSchema
) => Promise<Player> = async (id, userId, data) => {
  return await prisma.player.update({
    where: {
      id,
      match: { userId },
    },
    data,
  });
};

export const deletePlayerQuery: (
  id: number,
  userId: string
) => Promise<Player> = async (id, userId) => {
  return prisma.$transaction(async transaction => {
    const player = await transaction.player.findFirst({ where: { id, match: { userId } }, select: { matchId: true } });
    if (!player) throw new Error(ERROR_MESSAGES.not_found);

    // Roster changes and team saves must lock the parent before changing either.
    const [match] = await transaction.$queryRaw<{ id: number; teams: string }[]>`
      SELECT "id", "teams" FROM "Match"
      WHERE "id" = ${player.matchId} AND "userId" = ${userId} FOR UPDATE
    `;
    if (!match) throw new Error(ERROR_MESSAGES.not_found);
    const teams = removePlayerFromSavedTeams(match.teams, id);
    const deleted = await transaction.player.delete({ where: { id, match: { userId } } });
    if (teams !== match.teams) {
      await transaction.match.update({ where: { id: match.id, userId }, data: { teams } });
    }
    return deleted;
  });
};
