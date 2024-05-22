import { prisma } from '../db';

export type { Category } from '@prisma/client';

export function findCategories() {
  return prisma.category.findMany();
}
