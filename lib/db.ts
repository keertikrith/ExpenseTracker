import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

// Allow a direct connection string to be used for Prisma if provided.
// This avoids prepared statement issues when using pooled endpoints (e.g., pgbouncer / Supabase pooler).
const prismaUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

const prismaOptions: ConstructorParameters<typeof PrismaClient>[0] = {};
if (prismaUrl) {
  prismaOptions.datasources = { db: { url: prismaUrl } };
}

export const db = globalThis.prisma || new PrismaClient(prismaOptions);

// Backwards compatibility alias
export const prisma = db;

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}
