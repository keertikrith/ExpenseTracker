import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Allow an unpooled connection string to be used for Prisma if provided.
// This avoids prepared statement issues when using pooled endpoints (e.g., pgbouncer / Supabase pooler).
const prismaUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

const prismaOptions: any = {};
if (prismaUrl) {
  prismaOptions.datasources = { db: { url: prismaUrl } };
}

export const db = globalThis.prisma || new PrismaClient(prismaOptions);

// Backwards compatibility alias
export const prisma = db;

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}
