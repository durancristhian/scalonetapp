import { MATCH_SCHEMA, MATCH_UPDATE_SCHEMA, type MatchSchema, type MatchUpdateSchema } from "@/schemas/match";
import { ERROR_MESSAGES } from "@/utils/error-messages";
import prisma from "@/utils/prisma";
import { auth } from "@clerk/nextjs/server";
import { type Match } from "@prisma/client";
import { getSavedTeamsError } from "@/utils/team-validation";
import { ExpectedActionError } from "@/server/expected-action-error";
import { lockMatchOwner } from "@/server/lock-match-owner";

export const getMatchesQuery: (options?: {
  take: number;
}) => Promise<[Match[], number]> = async (options) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error(ERROR_MESSAGES.unauthorized);
  }

  const take = options?.take;

  return await prisma.$transaction([
    prisma.match.findMany({
      where: {
        userId: {
          equals: userId,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        players: true,
      },
      take,
    }),
    prisma.match.count({
      where: {
        userId: {
          equals: userId,
        },
      },
    }),
  ]);
};

export const getMatchByIdQuery = async (id: number) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error(ERROR_MESSAGES.unauthorized);
  }

  const match = await prisma.$transaction(transaction => transaction.match.findFirst({
    where: {
      id: {
        equals: id,
      },
      userId: {
        equals: userId,
      },
    },
    include: {
      players: true,
    },
  }), { isolationLevel: "RepeatableRead" });

  return match;
};

export const addMatchQuery: (
  data: MatchSchema,
  userId: string
) => Promise<Match> = async (data, userId) => {
  const matchData = MATCH_SCHEMA.parse(data);
  return prisma.$transaction(async transaction => {
    await lockMatchOwner(transaction, userId);
    const count = await transaction.match.count({ where: { userId } });
    if (count >= Number(process.env.NEXT_PUBLIC_MAX_MATCHES_PER_USER ?? 100)) throw new ExpectedActionError(ERROR_MESSAGES.match_limit_reached);
    const repeated = await transaction.match.findFirst({ where: { userId, name: matchData.name } });
    if (repeated) throw new ExpectedActionError(ERROR_MESSAGES.match_name_repeated);
    return transaction.match.create({ data: { ...matchData, userId } });
  });
};

export const editMatchQuery: (
  id: number,
  data: MatchUpdateSchema,
  userId: string
) => Promise<Match> = async (id, data, userId) => {
  const { expectedTeams, ...matchData } = MATCH_UPDATE_SCHEMA.parse(data);
  const serializedTeams = matchData.teams;
  return prisma.$transaction(async transaction => {
    if (matchData.name !== undefined) await lockMatchOwner(transaction, userId);
    const [match] = await transaction.$queryRaw<Match[]>`
      SELECT * FROM "Match" WHERE "id" = ${id} AND "userId" = ${userId} FOR UPDATE
    `;
    if (!match) throw new ExpectedActionError(ERROR_MESSAGES.not_found);
    if (matchData.name !== undefined) {
      const repeated = await transaction.match.findFirst({ where: { userId, name: matchData.name, id: { not: id } } });
      if (repeated) throw new ExpectedActionError(ERROR_MESSAGES.match_name_repeated);
    }
    if (serializedTeams !== undefined) {
      if (match.teams !== serializedTeams && match.teams !== expectedTeams) {
        throw new ExpectedActionError(ERROR_MESSAGES.match_teams_changed);
      }
      let teams: unknown;
      try { teams = JSON.parse(serializedTeams); }
      catch { throw new ExpectedActionError(ERROR_MESSAGES.match_teams_invalid); }
      const players = await transaction.player.findMany({ where: { matchId: id }, select: { id: true } });
      const error = getSavedTeamsError(teams, players.map(player => player.id));
      if (error) throw new ExpectedActionError(error);
    }
    if ((matchData.name === undefined || matchData.name === match.name)
      && (serializedTeams === undefined || serializedTeams === match.teams)) return match;
    return transaction.match.update({ where: { id, userId }, data: matchData });
  });
};

export const deleteMatchQuery: (
  id: number,
  userId: string
) => Promise<Match> = async (id, userId) => {
  return await prisma.match.delete({
    where: {
      id,
      userId,
    },
  });
};
