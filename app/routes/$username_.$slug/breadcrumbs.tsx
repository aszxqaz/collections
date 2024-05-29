import { Box, BoxProps, Breadcrumbs as MantineBreadcrumbs, Skeleton, Text } from '@mantine/core';
import { Await, Link, useLoaderData } from '@remix-run/react';
import { IconChevronRight } from '@tabler/icons-react';
import { Suspense } from 'react';
import { loader } from './route';

type BreadcrumbsProps = {} & BoxProps;

export function Breadcrumbs({ ...boxProps }: BreadcrumbsProps) {
  const { collection } = useLoaderData<typeof loader>();
  return (
    <Box {...boxProps}>
      <Suspense fallback={<BreadcrumbsFallback />}>
        <Await resolve={collection}>
          {collection => {
            if (!collection) return null;
            const breadcrumbsItems = [
              <Link key="username" to={`/${collection.username}`}>
                {collection.username}
              </Link>,
              <Text key="slug">{collection.slug}</Text>,
            ];
            return (
              <MantineBreadcrumbs
                mb="md"
                separator={<IconChevronRight />}
                separatorMargin="md"
                mt="xs"
              >
                {breadcrumbsItems}
              </MantineBreadcrumbs>
            );
          }}
        </Await>
      </Suspense>
    </Box>
  );
}

function BreadcrumbsFallback() {
  return (
    <MantineBreadcrumbs mb="md" separator={<IconChevronRight />} separatorMargin="md" mt="xs">
      {[
        <Skeleton mb="xs" key={1} width="3rem" height="1.356rem" radius="md" />,
        <Skeleton mb="xs" key={2} width="3rem" height="1.356rem" radius="md" />,
      ]}
    </MantineBreadcrumbs>
  );
}
