import { ActionIcon, Container, Flex, Group, Space, Stack, Text } from '@mantine/core';
import { ActionFunctionArgs, LoaderFunctionArgs, defer, json } from '@remix-run/node';
import { Await, Form, useLoaderData } from '@remix-run/react';
import { IconHeart } from '@tabler/icons-react';
import { Suspense } from 'react';
import { zfd } from 'zod-form-data';
import { findItem } from '~/.server/models/collection.server';
import { createComment, likeItem, unlikeItem } from '~/.server/models/item.server';
import { getUser } from '~/.server/session';
import { createCommentSchema, likeItemSchema } from '~/common/schemas';
import { DefaultCard } from '~/components';
import { Breadcrumbs } from '~/components/Breadcrumbs';
import { CollectionHeader } from '~/components/CollectionHeader';
import { ItemComment } from '~/components/Comment';
import { ItemsTable } from '~/components/ItemsTable';
import { TextNoContent } from '~/components/TextNoContent';
import { useOptionalUser } from '~/utils';
import { RepeatSkeleton } from '../components/default-skeleton';
import { CreateItemCommentForm } from './create-comment-form';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { username, slug, itemSlug } = params;
  const item = findItem(username!, slug!, itemSlug!);
  return defer({ item });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get('intent');
  const user = await getUser(request);
  if (!user) return json({ status: 401 });
  const { username } = user;
  switch (intent) {
    case 'createComment': {
      const schema = zfd.formData(createCommentSchema);
      const { success, data } = schema.safeParse(formData);
      if (!success || !data) return json({ status: 400 });
      const { content, itemId } = data;
      await createComment({ username, content, itemId });
      return json({ status: 201 });
    }
    case 'unlikeItem':
    case 'likeItem': {
      const schema = zfd.formData(likeItemSchema);
      const { success, data } = schema.safeParse(formData);
      if (!success || !data) return json({ status: 400 });
      const { itemId } = data;
      if (intent == 'likeItem') {
        await likeItem({ username, itemId });
        return json({ status: 201 });
      } else {
        await unlikeItem({ username, itemId });
        return json({ status: 200 });
      }
    }
  }
}

export default function ItemPage() {
  const { item } = useLoaderData<typeof loader>();

  const user = useOptionalUser();
  return (
    <Container>
      <Stack>
        <Breadcrumbs promise={item} />
        <Suspense
          fallback={
            <Stack>
              <DefaultCard>
                <RepeatSkeleton count={4} />
              </DefaultCard>
              <DefaultCard>
                <RepeatSkeleton count={2} />
              </DefaultCard>
            </Stack>
          }
        >
          <Await resolve={item}>
            {item => {
              if (!item) return null;
              console.log(item);
              const canLike = !!user?.username;
              const hasLiked = item.likers.find(liker => liker.username == user?.username);
              return (
                <Stack>
                  <DefaultCard>
                    <Stack>
                      <CollectionHeader collection={item.collection} />
                      <ItemsTable items={[item]} schemes={item.schemes} onRowClick={_ => {}} />
                    </Stack>
                  </DefaultCard>
                  <DefaultCard>
                    {!item.tags.length ? (
                      <TextNoContent>No tags attached</TextNoContent>
                    ) : (
                      <Stack>
                        <Flex wrap="wrap" gap="1rem">
                          {item.tags.map(tag => (
                            <Text key={tag.name}>#{tag.name}</Text>
                          ))}
                        </Flex>
                      </Stack>
                    )}
                  </DefaultCard>
                  <Group ml="auto" gap="xs">
                    {canLike ? (
                      <Form method="post">
                        <input type="hidden" name="itemId" value={item.id} />
                        <input
                          type="hidden"
                          name="intent"
                          value={hasLiked ? 'unlikeItem' : 'likeItem'}
                        />
                        <ActionIcon variant="transparent" type="submit">
                          <IconHeart />
                        </ActionIcon>
                      </Form>
                    ) : (
                      <IconHeart />
                    )}
                    <Text size="lg">{item.likers.length}</Text>
                  </Group>
                  <Space h="lg" />
                  {!item.comments.length ? (
                    <TextNoContent my="1rem">No comments yet</TextNoContent>
                  ) : (
                    item.comments.map(comment => (
                      <ItemComment key={comment.id} comment={comment} user={comment.user} />
                    ))
                  )}
                  {user && (
                    <Stack mt="md">
                      <CreateItemCommentForm item={item} />
                    </Stack>
                  )}
                </Stack>
              );
            }}
          </Await>
        </Suspense>
      </Stack>
    </Container>
  );
}
