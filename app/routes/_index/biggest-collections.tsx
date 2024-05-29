import { Stack, Text } from '@mantine/core';
import { AwaitedLoaderData } from '~/.server/utils';
import { DefaultCard } from '~/components';
import { CollectionHeader } from '~/components/CollectionHeader';
import { loader } from './route';

type BiggestCollectionsProps = {
  collections: AwaitedLoaderData<typeof loader, 'collections'>;
};

export function BiggestCollections({ collections }: BiggestCollectionsProps) {
  return (
    <Stack>
      {collections.map((collection, i) => {
        const link = `/${collection.username}/${collection.slug}`;
        return (
          <DefaultCard>
            <Stack>
              <CollectionHeader collection={collection} />
              <Text size="sm" c="dimmed">
                {collection.description}
              </Text>
              <Text>Item count: {collection._count.items}</Text>
            </Stack>
          </DefaultCard>
        );
      })}
    </Stack>
  );
}
