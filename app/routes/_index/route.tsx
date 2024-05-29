import { Container, Divider, Stack, Title } from '@mantine/core';
import { defer, type MetaFunction } from '@remix-run/node';
import { Await, useLoaderData } from '@remix-run/react';
import { Suspense } from 'react';
import { findItemsLastAdded, findTopCollections } from '~/.server/models/collection.server';
import { findTopTags } from '~/.server/models/tag.server';
import { DefaultCard } from '~/components';
import { TextNoContent } from '~/components/TextNoContent';
import { RepeatSkeleton } from '../components/default-skeleton';
import { BiggestCollections } from './biggest-collections';
import { LastAddedItems } from './last-added-items';
import { TagCloud } from './tag-cloud';

export const meta: MetaFunction = () => {
  return [{ title: 'Collections App' }, { name: 'description', content: 'Collections App' }];
};

export function loader() {
  const collections = findTopCollections();
  const items = findItemsLastAdded();
  const tags = findTopTags();
  return defer({ collections, items, tags });
}

export default function Index() {
  const { collections, items, tags } = useLoaderData<typeof loader>();
  return (
    <Container>
      <Stack>
        <Title>Popular tags</Title>
        <Suspense
          fallback={
            <DefaultCard>
              <RepeatSkeleton count={3} />
            </DefaultCard>
          }
        >
          <Await resolve={tags}>
            {tags => {
              if (!tags) return null;
              return !tags.length ? (
                <TextNoContent>No tags yet</TextNoContent>
              ) : (
                <TagCloud tags={tags} />
              );
            }}
          </Await>
        </Suspense>
        <Divider my="lg" />
        <Title>Biggest Collections</Title>
        <Suspense
          fallback={
            <Stack>
              <DefaultCard>
                <RepeatSkeleton count={3} />
              </DefaultCard>
              <DefaultCard>
                <RepeatSkeleton count={3} />
              </DefaultCard>
              <DefaultCard>
                <RepeatSkeleton count={3} />
              </DefaultCard>
            </Stack>
          }
        >
          <Await resolve={collections}>
            {collections => {
              if (!collections) return null;
              return !collections.length ? (
                <TextNoContent>No collections yet</TextNoContent>
              ) : (
                <BiggestCollections collections={collections} />
              );
            }}
          </Await>
        </Suspense>
        <Divider my="lg" />
        <Title>Last added items</Title>
        <Suspense
          fallback={
            <Stack>
              <DefaultCard>
                <RepeatSkeleton count={3} />
              </DefaultCard>
              <DefaultCard>
                <RepeatSkeleton count={3} />
              </DefaultCard>
              <DefaultCard>
                <RepeatSkeleton count={3} />
              </DefaultCard>
            </Stack>
          }
        >
          <Await resolve={items}>
            {items => {
              if (!items) return null;
              return !items.length ? (
                <TextNoContent>No items yet</TextNoContent>
              ) : (
                <LastAddedItems items={items} />
              );
            }}
          </Await>
        </Suspense>
      </Stack>
    </Container>
  );
}
