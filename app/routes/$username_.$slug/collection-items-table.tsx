import { CardProps, Stack } from '@mantine/core';
import { SerializeFrom } from '@remix-run/node';
import { Await, useLoaderData } from '@remix-run/react';
import { Suspense } from 'react';
import { DefaultCard } from '~/components';
import { TextNoContent } from '~/components/TextNoContent';
import { ItemWithProperties } from '~/types/models';
import { DefaultSkeleton } from '../components/default-skeleton';
import { CollectionItemsTableImpl } from './collection-items-table-impl';
import { loader } from './route';

type CollectionItemsTableProps = {
  items?: SerializeFrom<ItemWithProperties>[];
} & CardProps;

export function CollectionItemsTable({ items, ...cardProps }: CollectionItemsTableProps) {
  const { collection } = useLoaderData<typeof loader>();
  return (
    <DefaultCard {...cardProps} style={{ overflow: 'visible' }}>
      <Suspense fallback={<CollectionItemsTableFallback />}>
        <Await resolve={collection}>
          {collection => {
            if (!collection) return null;
            if (!items) return <CollectionItemsTableFallback />;
            return items.length ? (
              <CollectionItemsTableImpl collection={collection} items={items} />
            ) : (
              <TextNoContent>No items</TextNoContent>
            );
          }}
        </Await>
      </Suspense>
    </DefaultCard>
  );
}

function CollectionItemsTableFallback() {
  return (
    <Stack>
      <DefaultSkeleton mt="xs" mb="md" width="20%" />
      {Array(6)
        .fill(0)
        .map((_, i) => (
          <DefaultSkeleton key={i} />
        ))}
    </Stack>
  );
}
