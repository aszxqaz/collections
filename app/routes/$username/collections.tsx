import { Button, Card, Divider, Stack, StackProps, Text } from '@mantine/core';
import { Await, useNavigate } from '@remix-run/react';
import { IconPlus } from '@tabler/icons-react';
import { Suspense } from 'react';
import { CollectionName } from '~/components/CollectionHeader';
import { TextNoContent } from '~/components/TextNoContent';
import { getDateFromNow } from '~/dayjs';
import { useRootLoaderData } from '../../root';
import { RepeatSkeleton } from '../components/default-skeleton';
import { useCurrentLoaderData } from './route';

type CollectionsPanelProps = {} & StackProps;

export function CollectionsPanel({ ...stackProps }: CollectionsPanelProps) {
  const { user } = useCurrentLoaderData();
  const rootLoaderData = useRootLoaderData();
  return (
    <Stack {...stackProps}>
      <Suspense fallback={<RepeatSkeleton count={7} />}>
        <Await resolve={user}>
          {user => {
            if (!user) return null;
            const { collections, username } = user;
            const navigate = useNavigate();
            const canCreate =
              rootLoaderData?.user?.username == username || rootLoaderData?.user?.rights?.isAdmin;
            return (
              <>
                {!collections.length ? (
                  <TextNoContent>No collections yet</TextNoContent>
                ) : (
                  collections.map(collection => (
                    <Card
                      key={collection.slug}
                      mb="md"
                      shadow="sm"
                      padding="lg"
                      radius="md"
                      withBorder
                    >
                      <Stack>
                        <CollectionName collection={collection} />
                        <Text c="dimmed">Created {getDateFromNow(collection.createdAt)}</Text>
                      </Stack>
                    </Card>
                  ))
                )}
                <Divider />
                {canCreate && (
                  <Button
                    ml="auto"
                    leftSection={<IconPlus />}
                    onClick={() => navigate(`/${username}/collections/new`)}
                  >
                    Create
                  </Button>
                )}
              </>
            );
          }}
        </Await>
      </Suspense>
    </Stack>
  );
}

// export function CollectionsList({ collections, username }: CollectionsListProps) {
//   return collections.map(collection => (
//     <CollectionCard key={collection.slug} username={username} collection={collection} />
//   ));
// }

// export function CollectionCard({ collection, username }: CollectionProps) {
//   return (
//     <Card mb="md" shadow="sm" padding="lg" radius="md" withBorder>
//       <Group justify="space-between">
//         <Link to={`/${username}/${collection.slug}`}>{collection.name}</Link>
//       </Group>
//     </Card>
//   );
// }
