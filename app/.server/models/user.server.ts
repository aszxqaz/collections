import bcrypt from 'bcryptjs';
import { prisma } from '../db';

export type { User } from '@prisma/client';

export async function findUser(username: string) {
  return prisma.user.findUnique({ where: { username } });
}

export async function findUserWithCollections(username: string) {
  return prisma.user.findUnique({ where: { username }, include: { collections: true } });
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
