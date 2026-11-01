import type { Prisma } from "@prisma/client";

export async function lockMatchOwner(
  transaction: Prisma.TransactionClient,
  userId: string,
) {
  await transaction.$queryRaw`SELECT pg_advisory_xact_lock(hashtextextended(${userId}, 0))::text`;
}
