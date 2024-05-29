import bcrypt from 'bcryptjs';
import { prisma } from '../db';
import { safeDbExec } from './helpers.server';

export type { User } from '@prisma/client';

export async function findUser(username: string) {
  return prisma.user.findUnique({ where: { username } });
}

export async function findUsers() {
  return safeDbExec(() => prisma.user.findMany({ include: { rights: true } }));
}

export async function findUserRights(username: string) {
  return prisma.user.findUnique({ where: { username }, include: { rights: true } });
}

export async function findUserWithCollections(username: string) {
  return safeDbExec(() =>
    prisma.user.findUnique({ where: { username }, include: { collections: true } }),
  );
}

export async function findUserWithPassword(username: string) {
  return prisma.user.findUnique({ where: { username }, include: { password: true } });
}

export async function createUser(username: string, password: string) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    return prisma.user.create({
      data: {
        username,
        rights: {
          create: {},
        },
        password: {
          create: {
            hash: hashedPassword,
          },
        },
      },
    });
  } catch (e) {
    console.log(e);
  }
}
