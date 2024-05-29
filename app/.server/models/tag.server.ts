import { prisma } from '../db';

export async function findPopularTags() {
  return prisma.tag.findMany({
    orderBy: {
      items: {
        _count: 'desc',
      },
    },
    take: 10,
  });
}

export async function findTagsLike(startsWith?: string) {
  return prisma.tag.findMany({
    where: {
      name: {
        startsWith,
      },
    },
    take: 10,
  });
}

export async function findTopTags() {
  return prisma.tag.findMany({
    include: { _count: { select: { items: true } } },
    orderBy: {
      items: {
        _count: 'desc',
      },
    },
  });
}
