import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Container,
  Group,
  Stack,
  Tabs,
  Text,
  Title,
  rem,
} from '@mantine/core';
import { LoaderFunctionArgs, SerializeFrom, json } from '@remix-run/node';
import { Link, useLoaderData, useLocation, useNavigate, useSearchParams } from '@remix-run/react';
import { IconBook, IconNotes, IconPlus } from '@tabler/icons-react';
import { PropsWithChildren, useState } from 'react';
import { findUserWithCollections } from '~/.server/models/user.server';

type Collection = {
  name: string;
  slug: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  username: string;
  category: string;
};

type User = {
  username: string;
  createdAt: Date;
  updatedAt: Date;
};

export async function loader({ params }: LoaderFunctionArgs) {
  const username = params.username;
  if (!username) return createNotFoundResponse();
  const user = await findUserWithCollections(username);
  return json({ user });
}

export default function UserPage() {
  const { user } = useLoaderData<typeof loader>();
  const iconStyle = { width: rem(20), height: rem(20) };
  const tabTextStyle = {};
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const { pathname } = useLocation();

  const onChangeTab = (tab: string | null) => {
    if (tab) {
      setActiveTab(tab);
      const params = new URLSearchParams(searchParams);
      params.set('tab', tab);
      setSearchParams(params, {
        replace: true,
      });
    }
  };

  return (
    // <Stack>
    //   <Group>
    //     <Link to={`${pathname}/collections`}>Collections</Link>
    //   </Group>
    //   <Outlet />
    // </Stack>
    <Tabs
      radius="xs"
      defaultValue="overview"
      keepMounted={false}
      value={activeTab}
      onChange={onChangeTab}
    >
      <Tabs.List>
        <Tabs.Tab value="overview" leftSection={<IconBook style={iconStyle} />}>
          <Text {...tabTextStyle}>Overview</Text>
        </Tabs.Tab>
        <Tabs.Tab
          value="collections"
          leftSection={<IconNotes style={iconStyle} />}
          rightSection={<Badge>{user?.collections.length}</Badge>}
        >
          <Text {...tabTextStyle}>Collections</Text>
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="overview">
        {user && (
          <WithProfileGrid user={user}>
            <Overview />
          </WithProfileGrid>
        )}
      </Tabs.Panel>
      <Tabs.Panel value="collections">
        {user && (
          <WithProfileGrid user={user}>
            <CollectionsPanel username={user.username} collections={user.collections} />
          </WithProfileGrid>
        )}
      </Tabs.Panel>
    </Tabs>
  );
}

type CollectionsPanelProps = {
  username: string;
  collections: SerializeFrom<Collection>[];
};

function CollectionsPanel({ collections, username }: CollectionsPanelProps) {
  const navigate = useNavigate();
  return (
    <Stack>
      <Group>
        <Button ml="auto" leftSection={<IconPlus />} onClick={() => navigate('/create-collection')}>
          Create
        </Button>
      </Group>
      <CollectionsList username={username} collections={collections} />
    </Stack>
  );
}

type CollectionsListProps = {
  username: string;
  collections: SerializeFrom<Collection>[];
};

function CollectionsList({ collections, username }: CollectionsListProps) {
  return collections.map(collection => (
    <CollectionCard key={collection.slug} username={username} collection={collection} />
  ));
}

type CollectionProps = {
  username: string;
  collection: SerializeFrom<Collection>;
};

function CollectionCard({ collection, username }: CollectionProps) {
  return (
    <Card mb="md" shadow="sm" padding="lg" radius="md" withBorder>
      <Group justify="space-between">
        <Link to={`/${username}/${collection.slug}`}>{collection.name}</Link>
      </Group>
    </Card>
  );
}

function Overview() {
  return <Title>Overview</Title>;
}

type WithProfileGridProps = {
  user: SerializeFrom<User>;
} & PropsWithChildren;

function WithProfileGrid({ user, children }: WithProfileGridProps) {
  return (
    <Container>
      <Group mt="md">
        <Stack>
          <Avatar src={null} w={256} h={256} alt="no image here" />
          <Text fw={600}>{user.username}</Text>
        </Stack>
        <Box flex={1}>{children}</Box>
      </Group>
    </Container>
  );
}

function createNotFoundResponse() {
  return json({ user: null, status: 404 });
}
