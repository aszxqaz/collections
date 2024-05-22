import '@mantine/core/styles.css';

import {
  AppShell,
  Box,
  Burger,
  Button,
  ColorSchemeScript,
  Group,
  MantineColorScheme,
  MantineProvider,
  Space,
  Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { LoaderFunctionArgs } from '@remix-run/node';
import {
  Form,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  json,
  useLoaderData,
  useNavigate,
} from '@remix-run/react';
import { IconUser } from '@tabler/icons-react';
import { getUser } from './.server/session';
import { ColorSchemeSwitcher } from './ColorSchemeSwitcher';

import useLocalStorageState from 'use-local-storage-state';

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
  console.log(user);
  return json({ user });
};

export default function App() {
  const [initialColorScheme] = useLocalStorageState<MantineColorScheme>('color-scheme', {
    defaultValue: 'light',
  });
  const [opened, { toggle }] = useDisclosure();
  const navigate = useNavigate();
  const { user } = useLoaderData<typeof loader>();

  return (
    <MantineProvider defaultColorScheme={initialColorScheme as MantineColorScheme}>
      <AppShell
        // navbar={{
        //   width: 300,
        //   breakpoint: 'sm',
        //   collapsed: { mobile: !opened },
        // }}
        padding="md"
      >
        <AppShell.Header pos="relative">
          <Group p="md" justify="space-between">
            <Group>
              <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
              <Box>Logo</Box>
              {user && (
                <>
                  <NavLink
                    to={`/${user.username}`}
                    className={({}) =>
                      'mantine-focus-auto m_849cf0da m_b6d8b162 mantine-Text-root mantine-Anchor-root'
                    }
                  >
                    Profile
                  </NavLink>
                </>
              )}
            </Group>
            <Group>
              {user ? (
                <>
                  <Group gap={0}>
                    <IconUser />
                    <Text fw={600}>{user.username}</Text>
                  </Group>
                  <Form action="/logout" method="post">
                    <Button variant="outline" type="submit">
                      Log out
                    </Button>
                  </Form>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => navigate('/login')}>
                    Sign in
                  </Button>
                  <Button onClick={() => navigate('/register')}>Sign up</Button>
                </>
              )}
              <ColorSchemeSwitcher />
            </Group>
          </Group>
        </AppShell.Header>
        <AppShell.Main p={0}>
          <Outlet />
          <Space h="3rem" />
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}
