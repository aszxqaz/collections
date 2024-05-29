import { Button, Center, Container, Group, Modal, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { LoaderFunctionArgs, SerializeFrom } from '@remix-run/node';
import { Await, defer, useFetcher, useLoaderData, useRouteError } from '@remix-run/react';
import { Suspense, useEffect, useRef, useState } from 'react';
import { findCollection } from '~/.server/models/collection.server';
import { PgError } from '~/.server/models/helpers.server';
import { Breadcrumbs } from '~/components/Breadcrumbs';
import { ItemWithProperties } from '~/types/models';
import { CollectionInfo } from './collection-info';
import { CollectionItemsTable } from './collection-items-table';
import { CollectionNotFound } from './collection-not-found';
import { CreateItemPanel } from './create-item-panel';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { username, slug } = params;
  const _promise = findCollection(username!, slug!);
  const collection = _promise.then(r => (r.ok ? r.data : null));
  const error = _promise
    .then(r => (r.ok ? null : r.error))
    .then(error => {
      if (error == PgError.UniqueKeyViolation) {
        return { message: 'Duplication - try another item name' };
      } else if (error == PgError.Unknown) {
        return { message: 'Unknown error occured' };
      }
      return null;
    });
  return defer({ collection, username, slug, error });
}

export { action } from './actions';

export default function () {
  const { collection, error } = useCurrentLoaderData();
  const [items, setItems] = useState<SerializeFrom<ItemWithProperties>[]>();

  useEffect(() => {
    error.then(error => {
      if (error) {
        notifications.show({ color: 'red', message: error.message });
      }
    });
  }, [error]);

  return (
    <>
      <Container>
        <Stack>
          <Breadcrumbs promise={collection} />
          <CollectionInfo />
          <CollectionItemsTable items={items} />
          <CreateItemPanel setItems={setItems} />
          <CollectionNotFound />
          <DeleteCollectionButton />
          <Suspense>
            <Await resolve={collection}>
              {collection => {
                useEffect(() => {
                  if (collection) {
                    setItems(collection.items);
                  }
                }, [collection]);
                return null;
              }}
            </Await>
          </Suspense>
          <Suspense>
            <Await resolve={error}>
              {error => {
                if (error) {
                  notifications.show({ color: 'red', message: error.message });
                }
                return null;
              }}
            </Await>
          </Suspense>
        </Stack>
      </Container>
    </>
  );
}

export function DeleteCollectionButton() {
  const [opened, { open, close }] = useDisclosure(false);
  const { collection } = useCurrentLoaderData();
  const fetcher = useFetcher();
  const isDeleting = fetcher.state !== 'idle';
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <Suspense>
      <Await resolve={collection}>
        {collection => {
          if (!collection) return null;
          return (
            <Center mt="lg">
              <fetcher.Form
                ref={formRef}
                method="post"
                action={`/${collection.username}/${collection.slug}/delete`}
              >
                <input type="hidden" name="intent" value="delete-collection" />
                <Button color="red" onClick={open} disabled={isDeleting} loading={isDeleting}>
                  Delete
                </Button>
                <Modal centered title="Confirmation" opened={opened} onClose={close}>
                  <Stack gap={0}>
                    <Center>
                      <Text>
                        You're about to delete collection{' '}
                        <Text span c="blue">
                          {collection.slug}
                        </Text>
                        .<br />
                      </Text>
                    </Center>
                    <Center>
                      <Text>Are you sure?</Text>
                    </Center>
                  </Stack>
                  <Center mt="xl" mb="md">
                    <Group>
                      <Button
                        onClick={_ => {
                          formRef?.current?.submit();
                          close();
                        }}
                        color="red"
                      >
                        Confirm
                      </Button>
                      <Button variant="outline" onClick={close}>
                        Cancel
                      </Button>
                    </Group>
                  </Center>
                </Modal>
              </fetcher.Form>
            </Center>
          );
        }}
      </Await>
    </Suspense>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  return JSON.stringify(error);

  // if (isRouteErrorResponse(error)) {
  //   return (
  //     <div>
  //       <h1>
  //         {error.status} {error.statusText}
  //       </h1>
  //       <p>{error.data}</p>
  //     </div>
  //   );
  // } else if (error instanceof Error) {
  //   return (
  //     <div>
  //       <h1>Error</h1>
  //       <p>{error.message}</p>
  //       <p>The stack trace is:</p>
  //       <pre>{error.stack}</pre>
  //     </div>
  //   );
  // } else {
  //   return <h1>Unknown Error</h1>;
  // }
}

export function useCurrentLoaderData() {
  return useLoaderData<typeof loader>();
}
