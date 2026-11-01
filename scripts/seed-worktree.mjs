import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { verifyDatabase } from "./worktree-database.mjs";

const teams = [
  {
    name: "Argentina Celeste",
    captain: "Lionel Messi",
    players: [
      ["Emiliano Martínez", "goa"],
      ["Javier Zanetti", "def"],
      ["Roberto Ayala", "def"],
      ["Nicolás Otamendi", "def"],
      ["Fernando Redondo", "mid"],
      ["Juan Román Riquelme", "mid"],
      ["Rodrigo De Paul", "mid"],
      ["Lionel Messi", "for"],
      ["Gabriel Batistuta", "for"],
      ["Ángel Di María", "for"],
    ],
  },
  {
    name: "Argentina Blanca",
    captain: "Diego Maradona",
    players: [
      ["Ubaldo Fillol", "goa"],
      ["Daniel Passarella", "def"],
      ["Oscar Ruggeri", "def"],
      ["Walter Samuel", "def"],
      ["Diego Maradona", "mid"],
      ["Juan Sebastián Verón", "mid"],
      ["Javier Mascherano", "mid"],
      ["Mario Kempes", "for"],
      ["Hernán Crespo", "for"],
      ["Sergio Agüero", "for"],
    ],
  },
];

export async function seedWorktree(root, env) {
  if (
    env.NODE_ENV !== "development" ||
    (env.VERCEL_ENV && env.VERCEL_ENV !== "development") ||
    !env.CLERK_SECRET_KEY?.startsWith("sk_test_") ||
    !env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith("pk_test_") ||
    !/^user_[a-zA-Z0-9]+$/.test(env.CLERK_AGENT_USER_ID ?? "")
  )
    throw new Error(
      "Configure the verified Clerk Development agent ID before seeding.",
    );
  verifyDatabase(root, env.POSTGRES_PRISMA_URL);
  verifyDatabase(root, env.POSTGRES_URL_NON_POOLING);
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: env.POSTGRES_PRISMA_URL }),
  });
  try {
    return await prisma.$transaction(async (transaction) => {
      await transaction.$queryRaw`SELECT pg_advisory_xact_lock(94, 1)::text`;
      if (await transaction.match.count()) return false;
      const match = await transaction.match.create({
        data: {
          name: "Argentina Celeste vs. Argentina Blanca",
          userId: env.CLERK_AGENT_USER_ID,
          players: {
            create: teams.flatMap((team) =>
              team.players.map(([name, position]) => ({
                name,
                position,
                level: 5,
              })),
            ),
          },
        },
        include: { players: true },
      });
      const ids = new Map(
        match.players.map((player) => [player.name, player.id]),
      );
      const saved = teams.map((team) => {
        const players = team.players.map(([name]) => ids.get(name));
        return {
          id: randomUUID(),
          name: team.name,
          players,
          defaultCaptainId: ids.get(team.captain),
        };
      });
      await transaction.match.update({
        where: { id: match.id },
        data: { teams: JSON.stringify(saved) },
      });
      return true;
    });
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const created = await seedWorktree(process.cwd(), process.env);
    console.log(
      created
        ? "Seeded Argentina Celeste vs. Argentina Blanca: two teams of 10."
        : "Existing matches preserved; initial seed skipped.",
    );
  } catch {
    console.error(
      "Cannot seed the owned Development database. Check the Development configuration and CLERK_AGENT_USER_ID.",
    );
    process.exitCode = 1;
  }
}
