import { PrismaClient } from '@prisma/client';
import invariant from 'tiny-invariant';
import { singleton } from './singleton';

const prisma = singleton('prisma', getPrismaClient);

function getPrismaClient() {
  const { DATABASE_URL } = process.env;
  invariant(typeof DATABASE_URL === 'string', 'DATABASE_URL not set');
  const databaseUrl = new URL(DATABASE_URL);
  const client = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl.toString(),
      },
    },
  });
  client.$connect();
  return client;
}

export { prisma };
