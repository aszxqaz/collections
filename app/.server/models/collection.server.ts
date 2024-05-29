import { Collection, Item, Property, Scheme } from '@prisma/client';
import slugify from 'slugify';
import { prisma } from '../db';
import { safeDbExec } from './helpers.server';

export type { Collection } from '@prisma/client';

export function findCollectionsByUser(username: string) {
  return prisma.collection.findMany({
    where: { user: { username } },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function findCollection(username: string, slug: string) {
  return safeDbExec(() =>
    prisma.collection.findUnique({
      where: { username_slug: { username, slug } },
      include: {
        schemes: {
          orderBy: { id: 'asc' },
        },
        items: {
          orderBy: { id: 'asc' },
          include: {
            properties: true,
          },
        },
      },
    }),
  );
}

export async function deleteCollection(username: string, slug: string) {
  return safeDbExec(() =>
    prisma.collection.delete({
      where: { username_slug: { username, slug } },
    }),
  );
}

type CreatePropertyDto = Pick<Property, 'value' | 'schemeId'>;
type CreateItemDto = Pick<Item, 'name'> & {
  tags: string[];
  props: CreatePropertyDto[];
};

export async function createItems(username: string, collSlug: string, items: CreateItemDto[]) {
  const itemsCreated = [];
  let errors: { index: number; message: string }[] | null = null;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const result = await safeDbExec(() =>
      prisma.item.create({
        data: {
          username,
          name: item.name,
          slug: slugify(item.name),
          collSlug,
          properties: {
            createMany: {
              data: item.props,
            },
          },
          tags: {
            connectOrCreate: item.tags.map(name => {
              return {
                where: { name },
                create: { name },
              };
            }),
          },
        },
        include: {
          properties: true,
        },
      }),
    );
    if (result.ok) {
      itemsCreated.push(result.data);
    } else {
      errors = [...(errors || []), { index: i, message: 'Slug duplication, rename the item' }];
    }
  }
  return [itemsCreated, errors] as const;
}

type CreateCollectionDto = Pick<Collection, 'name' | 'description' | 'slug'>;

export async function createCollection(
  username: string,
  category: string,
  { name, description, slug }: CreateCollectionDto,
  schemes: Pick<Scheme, 'name' | 'type'>[],
) {
  return prisma.collection.create({
    data: {
      name,
      description,
      slug,
      category,
      username,
      schemes: {
        createMany: { data: schemes },
      },
    },
  });
}

export async function findTopCollections() {
  return prisma.collection.findMany({
    include: { _count: { select: { items: true } }, user: true },
    orderBy: {
      items: { _count: 'desc' },
    },
    take: 5,
  });
}

export async function findItemsLastAdded() {
  return prisma.item.findMany({
    orderBy: {
      id: 'desc',
    },
    include: {
      properties: true,
      tags: true,
      collection: {
        include: {
          schemes: true,
          user: true,
        },
      },
    },
    take: 3,
  });
}

export async function findItem(username: string, collSlug: string, slug: string) {
  return prisma.item.findUnique({
    where: {
      username_collSlug_slug: {
        username,
        collSlug,
        slug,
      },
    },
    include: {
      collection: true,
      likers: true,
      comments: {
        include: {
          user: true,
        },
      },
      properties: true,
      schemes: true,
      tags: true,
    },
  });
}
