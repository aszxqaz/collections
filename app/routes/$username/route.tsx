import { Container, Flex } from '@mantine/core';
import { LoaderFunctionArgs, defer } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { IconMoodSadSquint } from '@tabler/icons-react';
import { splitDbExecResult } from '~/.server/models/helpers.server';
import { findUserWithCollections } from '~/.server/models/user.server';
import { ServerMessage } from '~/components/server-message';
import { CollectionsPanel } from './collections';
import { ProfileColumn } from './profile-column';

export async function loader({ params }: LoaderFunctionArgs) {
  const [user, err] = splitDbExecResult(findUserWithCollections(params.username!));
  return defer({ user, err });
}

export default function UserPage() {
  const { user, err } = useCurrentLoaderData();
  return (
    <Container>
      <Flex
        gap="2rem"
        align={{ base: 'stretch', sm: 'start' }}
        direction={{ base: 'column', sm: 'row' }}
      >
        <ProfileColumn user={user} />
        <CollectionsPanel flex={1} />
      </Flex>
      <ServerMessage message={err} icon={IconMoodSadSquint} />
    </Container>
  );
}

type ErrorMessageProps = {
  message: Promise<string>;
};

export function useCurrentLoaderData() {
  return useLoaderData<typeof loader>();
}
