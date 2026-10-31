import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prismaClientSingleton = () => {
  return new PrismaClient({
    adapter: {
      provider: "postgres",
      adapterName: "@prisma/adapter-pg",
      async connect() {
        const connectionString = process.env.POSTGRES_PRISMA_URL;
        if (!connectionString)
          throw new Error("POSTGRES_PRISMA_URL is required");
        return new PrismaPg({
          connectionString,
          connectionTimeoutMillis: 5000,
        }).connect();
      },
    },
  });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}
