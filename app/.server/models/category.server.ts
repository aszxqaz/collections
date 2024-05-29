import { prisma } from '../db';
import { safeDbExec } from './helpers.server';

export type { Category } from '@prisma/client';

export function findCategories() {
  return safeDbExec(() => prisma.category.findMany());
}
