import { PrismaClient } from '@prisma/client';

// This prevents Next.js from creating too many Prisma Client instances in development
// due to its fast refresh feature.
declare global {
  var prisma: PrismaClient | undefined;
}

const client = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalThis.prisma = client;

export default client;
