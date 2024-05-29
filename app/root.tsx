import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './styles.css';

import {
  AppShell,
  Box,
  Button,
  ColorSchemeScript,
  Group,
  MantineProvider,
  Space,
  Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Notifications } from '@mantine/notifications';
import { LoaderFunctionArgs } from '@remix-run/node';
import {
  Form,
  Link,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  json,
  useLoaderData,
  useLocation,
  useNavigate,
  useRouteLoaderData,
} from '@remix-run/react';
import { IconUser } from '@tabler/icons-react';
import { getUser } from '~/.server/session';
import { ColorSchemeSwitcher } from '~/ColorSchemeSwitcher';
import { Logo } from '~/components/Logo';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <ColorSchemeScript />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUser(request);
  return json({ user });
};

export default function App() {
  const [opened, { toggle }] = useDisclosure();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useLoaderData<typeof loader>();
  const redirectSearchParam = `redirectTo=${pathname}`;

  return (
    <MantineProvider defaultColorScheme={'auto'}>
      <Notifications />
      <AppShell padding="md">
        <AppShell.Header pos="relative">
          <Group p="md" justify="space-between">
            <Group>
              {/* <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" /> */}
              <Box visibleFrom="sm">
                <Link to="/">
                  <Box c="blue" w="10rem">
                    <Logo />
                  </Box>
                </Link>
              </Box>
              {user && (
                <Group visibleFrom="sm">
                  <NavLink
                    to={`/${user.username}`}
                    className={({}) =>
                      'mantine-focus-auto m_849cf0da m_b6d8b162 mantine-Text-root mantine-Anchor-root'
                    }
                  >
                    Profile
                  </NavLink>
                  {user.rights?.isAdmin && !user.rights.isBlocked && (
                    <NavLink
                      to="/admin"
                      className={({}) =>
                        'mantine-focus-auto m_849cf0da m_b6d8b162 mantine-Text-root mantine-Anchor-root'
                      }
                    >
                      Admin
                    </NavLink>
                  )}
                </Group>
              )}
            </Group>
            <Group>
              {user ? (
                <>
                  <Group gap={0}>
                    <IconUser />
                    <Text fw={600}>{user.username}</Text>
                  </Group>
                  <Form action={`/logout?${redirectSearchParam}`} method="post">
                    <Button variant="outline" type="submit">
                      Log out
                    </Button>
                  </Form>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/login?${redirectSearchParam}`)}
                  >
                    Sign in
                  </Button>
                  <Button onClick={() => navigate(`/register?${redirectSearchParam}`)}>
                    Sign up
                  </Button>
                </>
              )}
              <ColorSchemeSwitcher />
            </Group>
          </Group>
        </AppShell.Header>
        <AppShell.Main pt="xl">
          <Outlet />
          <Space h="3rem" />
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}

export function useRootLoaderData() {
  return useRouteLoaderData<typeof loader>('root');
}
