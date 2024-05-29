import { Stack, Table, Text } from '@mantine/core';
import { Await, useLoaderData } from '@remix-run/react';
import { Suspense, useMemo } from 'react';
import { LoaderData } from '~/.server/utils';
import { DefaultCard } from '~/components';
import { CollectionName } from '~/components/CollectionHeader';
import { TextNoContent } from '~/components/TextNoContent';
import { getContentByPropertyType } from '~/content';
import { DefaultSkeleton } from '../components/default-skeleton';
import { loader } from './route';

type CollectionInfoProps = {};

export function CollectionInfo({}: CollectionInfoProps) {
  const { collection } = useLoaderData<typeof loader>();
  return (
    <DefaultCard>
      <Suspense fallback={<CollectionInfoFallback />}>
        <Await resolve={collection}>
          {collection => {
            if (!collection) return null;
            return (
              <Stack>
                <CollectionName collection={collection} />
                <Text c="dimmed">{collection?.description}</Text>
                {collection.schemes.length ? (
                  <ItemPropSchemeTable collection={collection} />
                ) : (
                  <TextNoContent>No additional properties</TextNoContent>
                )}
              </Stack>
            );
          }}
        </Await>
      </Suspense>
    </DefaultCard>
  );
}

type ItemPropSchemeTableProps = {
  collection: NonNullable<Awaited<LoaderData<typeof loader>['collection']>>;
};

function ItemPropSchemeTable({ collection }: ItemPropSchemeTableProps) {
  const { schemes } = collection;
  const data = useMemo(
    () => ({
      caption: 'Collection item properties',
      head: ['#', 'Type', 'Name'],
      body: schemes.map((property, i) => [
        i + 1,
        getContentByPropertyType(property.type),
        property.name,
      ]),
    }),
    [schemes],
  );
  return <Table data={data} />;
}

function CollectionInfoFallback() {
  return (
    <Stack>
      <DefaultSkeleton mt="xs" mb="md" width="20%" />
      {Array(3)
        .fill(0)
        .map((_, i) => (
          <DefaultSkeleton key={i} />
        ))}
    </Stack>
  );
}
