import { Box, Container, Loader, Menu, Stack, Title, rem } from '@mantine/core';
import { useClickOutside } from '@mantine/hooks';
import { LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useFetcher, useNavigate } from '@remix-run/react';
import {
  IconFile,
  IconLock,
  IconLockOff,
  IconShield,
  IconShieldOff,
  IconTrash,
} from '@tabler/icons-react';
import { Suspense, useEffect, useState } from 'react';
import { TypedAwait, typeddefer, useTypedLoaderData } from 'remix-typedjson';
import { splitDbExecResult } from '~/.server/models/helpers.server';
import { findUsers } from '~/.server/models/user.server';
import { getUser } from '~/.server/session';
import { DefaultCard } from '~/components';
import { UsersTable } from '~/components/UsersTable';
import { UserWithRights } from '~/types';
import { RepeatSkeleton } from '../components/default-skeleton';
import { action } from '../resources.users/route';

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  if (!user?.rights?.isAdmin || user?.rights.isBlocked) throw redirect('/');
  const [users, error] = splitDbExecResult(findUsers());
  return typeddefer({ users, error });
}

export function useCurrentLoaderData() {
  return useTypedLoaderData<typeof loader>();
}

export default function AdminPage() {
  const { error, users } = useCurrentLoaderData();
  const blockFetcher = useFetcher<typeof action>();
  const adminFetcher = useFetcher<typeof action>();
  const deleteFetcher = useFetcher<typeof action>();

  useEffect(() => {
    setOpened(false);
  }, [blockFetcher.data, adminFetcher.data, deleteFetcher.data]);

  const [opened, setOpened] = useState(false);
  const navigate = useNavigate();
  const [pos, setPos] = useState([0, 0]);
  const ref = useClickOutside(() => setOpened(false));
  const [selectedUser, setSelectedUser] = useState<UserWithRights | null>(null);

  const isSelectedUserBlocked = selectedUser?.rights?.isBlocked;
  const isSelectedUserAdmin = selectedUser?.rights?.isAdmin;

  return (
    <Container>
      <Stack>
        <Title>Admin Panel</Title>
        <DefaultCard>
          <Suspense fallback={<RepeatSkeleton count={5} />}>
            <TypedAwait resolve={users}>
              {users => {
                if (!users) return null;

                return (
                  <UsersTable
                    users={users}
                    onRowClick={(pos, index) => {
                      setPos(pos);
                      setOpened(true);
                      setSelectedUser(users[index]);
                    }}
                  />
                );
              }}
            </TypedAwait>
          </Suspense>
        </DefaultCard>
      </Stack>
      <Box pos="fixed" left={`${pos[0]}px`} bottom={`${pos[1]}px`}>
        <Box ref={ref}>
          <Menu
            withinPortal={false}
            shadow="md"
            width={200}
            opened={opened}
            onChange={setOpened}
            closeOnItemClick={false}
          >
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconFile style={{ width: rem(14), height: rem(14) }} />}
                onClick={() => {
                  if (selectedUser) {
                    navigate(`/${selectedUser.username}`);
                  }
                }}
              >
                Open
              </Menu.Item>
              <Menu.Item
                leftSection={
                  blockFetcher.state == 'submitting' ? (
                    <Loader size="xs" />
                  ) : isSelectedUserBlocked ? (
                    <IconLockOff style={{ width: rem(14), height: rem(14) }} />
                  ) : (
                    <IconLock style={{ width: rem(14), height: rem(14) }} />
                  )
                }
                disabled={blockFetcher.state == 'submitting'}
                onClick={() => {
                  blockFetcher.submit(
                    {
                      username: selectedUser!.username,
                      intent: isSelectedUserBlocked ? 'unblockUser' : 'blockUser',
                    },
                    {
                      action: '/resources/users',
                      method: 'POST',
                    },
                  );
                }}
              >
                {isSelectedUserBlocked ? 'Unblock' : 'Block'}
              </Menu.Item>
              <Menu.Item
                leftSection={
                  adminFetcher.state == 'submitting' ? (
                    <Loader size="xs" />
                  ) : isSelectedUserAdmin ? (
                    <IconShieldOff style={{ width: rem(14), height: rem(14) }} />
                  ) : (
                    <IconShield style={{ width: rem(14), height: rem(14) }} />
                  )
                }
                disabled={adminFetcher.state == 'submitting'}
                onClick={() => {
                  adminFetcher.submit(
                    {
                      username: selectedUser!.username,
                      intent: isSelectedUserAdmin ? 'unadminUser' : 'adminUser',
                    },
                    {
                      action: '/resources/users',
                      method: 'POST',
                    },
                  );
                }}
              >
                {isSelectedUserAdmin ? 'Make user' : 'Make admin'}
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                color="red"
                leftSection={
                  deleteFetcher.state == 'submitting' ? (
                    <Loader size="xs" />
                  ) : (
                    <IconTrash style={{ width: rem(14), height: rem(14) }} />
                  )
                }
                onClick={() => {
                  deleteFetcher.submit(
                    {
                      username: selectedUser!.username,
                      intent: 'delete',
                    },
                    {
                      action: '/resources/users',
                      method: 'POST',
                    },
                  );
                }}
              >
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Box>
      </Box>
    </Container>
  );
}
