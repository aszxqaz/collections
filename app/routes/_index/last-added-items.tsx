import { Stack } from '@mantine/core';
import { Link } from '@remix-run/react';
import { AwaitedLoaderData } from '~/.server/utils';
import { DefaultCard } from '~/components';
import { CollectionHeader } from '~/components/CollectionHeader';
import { ItemsTable } from '~/components/ItemsTable';
import { loader } from './route';

type LastAddedItemsProps = {
  items: AwaitedLoaderData<typeof loader, 'items'>;
};

export function LastAddedItems({ items }: LastAddedItemsProps) {
  return (
    <Stack>
      {items.map((item, i) => {
        const { collection } = item;
        const link = `/${collection.username}/${collection.slug}`;
        return (
          <Link key={item.id} to={link}>
            <DefaultCard>
              <Stack>
                <CollectionHeader collection={collection} />
                <ItemsTable items={[item]} schemes={collection.schemes} />
              </Stack>
            </DefaultCard>
          </Link>
        );
      })}
    </Stack>
  );
}
