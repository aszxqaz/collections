import { Collection, Item, ItemProp, ItemPropScheme } from '@prisma/client';
import { prisma } from '../db';

export type { Collection } from '@prisma/client';

export function findCollectionsByUser(username: string) {
  return prisma.collection.findMany({
    where: { user: { username } },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function findCollection(username: string, slug: string) {
  const collection = await prisma.collection.findUnique({
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
  });
  return collection;
}

type CreatePropertyDto = Pick<ItemProp, 'value' | 'schemeId'>;
type CreateItemDto = Pick<Item, 'name'> & {
  props: CreatePropertyDto[];
};

export async function createItems(username: string, slug: string, items: CreateItemDto[]) {
  const itemsCreated = [];
  for (const item of items) {
    const created = await prisma.item.create({
      data: {
        username,
        slug,
        name: item.name,
        properties: {
          createMany: {
            data: item.props,
          },
        },
      },
      include: {
        properties: true,
      },
    });
    itemsCreated.push(created);
  }
  return itemsCreated;
}

type CreateCollectionDto = Pick<Collection, 'name' | 'description' | 'slug'>;

export async function createCollection(
  username: string,
  category: string,
  { name, description, slug }: CreateCollectionDto,
  schemes: Pick<ItemPropScheme, 'name' | 'type'>[],
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
