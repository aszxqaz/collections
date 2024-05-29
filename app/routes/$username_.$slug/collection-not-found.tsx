import { BoxProps, Center, Stack, Title } from '@mantine/core';
import { Await, useLoaderData } from '@remix-run/react';
import { IconError404 } from '@tabler/icons-react';
import { Suspense } from 'react';
import { loader } from './route';

type CollectionNotFoundProps = {} & BoxProps;

export function CollectionNotFound({}: CollectionNotFoundProps) {
  const { collection } = useLoaderData<typeof loader>();
  return (
    <Suspense>
      <Await resolve={collection}>
        {collection =>
          collection ? null : (
            <Center h="50vh">
              <Stack align="center">
                <IconError404 size={96} />
                <Title fz="h3" style={{ textAlign: 'center' }}>
                  Collection not found
                </Title>
              </Stack>
            </Center>
          )
        }
      </Await>
    </Suspense>
  );
}
