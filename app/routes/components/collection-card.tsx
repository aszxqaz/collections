import { Card, Group } from '@mantine/core';
import { Collection } from '@prisma/client';
import { SerializeFrom } from '@remix-run/node';
import { Link } from '@remix-run/react';

type CollectionProps = {
  username: string;
  collection: SerializeFrom<Collection>;
};

export function CollectionCard({ collection, username }: CollectionProps) {
  return (
    <Card mb="md" shadow="sm" padding="lg" radius="md" withBorder>
      <Group justify="space-between">
        <Link to={`/${username}/${collection.slug}`}>{collection.name}</Link>
      </Group>
    </Card>
  );
}
