import { Collection } from '@prisma/client';
import { SerializeFrom } from '@remix-run/node';
import { CollectionCard } from './collection-card';

type CollectionsListProps = {
  username: string;
  collections: SerializeFrom<Collection>[];
};

export function CollectionsList({ collections, username }: CollectionsListProps) {
  return collections.map(collection => (
    <CollectionCard key={collection.slug} username={username} collection={collection} />
  ));
}
