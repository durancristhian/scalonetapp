import { MATCH_SCHEMA, MATCH_UPDATE_SCHEMA, type MatchSchema, type MatchUpdateSchema } from "@/schemas/match";
import { ERROR_MESSAGES } from "@/utils/error-messages";
import prisma from "@/utils/prisma";
import { auth } from "@clerk/nextjs/server";
import { type Match } from "@prisma/client";
import { getSavedTeamsError } from "@/utils/team-validation";

export const getMatchesQuery: (options?: {
  take: number;
}) => Promise<[Match[], number]> = async (options) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error(ERROR_MESSAGES.unauthorized);
  }

  const take = options?.take || 10;

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

  const match = await prisma.match.findFirst({
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
  });

  return match;
};

export const addMatchQuery: (
  data: MatchSchema,
  userId: string
) => Promise<Match> = async (data, userId) => {
  return await prisma.match.create({
    data: {
      ...MATCH_SCHEMA.parse(data),
      userId,
    },
  });
};

export const editMatchQuery: (
  id: number,
  data: MatchUpdateSchema,
  userId: string
) => Promise<Match> = async (id, data, userId) => {
  const matchData = MATCH_UPDATE_SCHEMA.parse(data);
  const serializedTeams = matchData.teams;
  if (serializedTeams === undefined) {
    return prisma.match.update({ where: { id, userId }, data: matchData });
  }
  return prisma.$transaction(async transaction => {
    const matches = await transaction.$queryRaw<{ id: number }[]>`
      SELECT "id" FROM "Match" WHERE "id" = ${id} AND "userId" = ${userId} FOR UPDATE
    `;
    if (!matches.length) throw new Error(ERROR_MESSAGES.not_found);
    const teams: unknown = JSON.parse(serializedTeams);
    const players = await transaction.player.findMany({ where: { matchId: id }, select: { id: true } });
    const error = getSavedTeamsError(teams, players.map(player => player.id));
    if (error) throw new Error(error);
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
