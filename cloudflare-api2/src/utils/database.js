import { PrismaClient } from "@prisma/client";

export async function checkDatabaseHealth(env) {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
  });

  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (e) {
    console.error("Database health check failed:", e);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}
