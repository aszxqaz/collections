import { Avatar, Skeleton, Stack, Text } from '@mantine/core';
import { Await } from '@remix-run/react';
import { Suspense } from 'react';
import { LoaderData } from '~/.server/utils';
import { DefaultSkeleton } from '../components/default-skeleton';
import { loader } from './route';

type ProfileColumnProps = {
  user: LoaderData<typeof loader>['user'];
};

export function ProfileColumn({ user }: ProfileColumnProps) {
  const avatarSize = 256;
  return (
    <Stack align="center">
      <Suspense fallback={<ProfileColumnFallback />}>
        <Await resolve={user}>
          {user => {
            if (!user) return null;
            return (
              <>
                <Avatar src={null} w={{ base: 196, sm: 256 }} h={{ base: 196, sm: 256 }} />
                <Text fz="xl" fw={600}>
                  {user.username}
                </Text>
              </>
            );
          }}
        </Await>
      </Suspense>
    </Stack>
  );
}

function ProfileColumnFallback() {
  return (
    <>
      <Skeleton circle w={{ base: 196, sm: 256 }} h={{ base: 196, sm: 256 }} />
      <DefaultSkeleton width="4rem" />
    </>
  );
}
