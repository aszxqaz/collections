import { Stack } from '@mantine/core';
import { useNavigate } from '@remix-run/react';
import { Fragment } from 'react/jsx-runtime';
import { AwaitedLoaderData } from '~/.server/utils';
import { DefaultCard } from '~/components';
import { CollectionHeader } from '~/components/CollectionHeader';
import { ItemsTable } from '~/components/ItemsTable';
import { loader } from './route';

type LastAddedItemsProps = {
  items: AwaitedLoaderData<typeof loader, 'items'>;
};

export function LastAddedItems({ items }: LastAddedItemsProps) {
  const navigate = useNavigate();
  return (
    <Stack>
      {items.map((item, i) => {
        const { collection } = item;
        return (
          <Fragment key={item.id}>
            <DefaultCard>
              <Stack>
                <CollectionHeader collection={collection} />
                <ItemsTable
                  items={[item]}
                  schemes={collection.schemes}
                  onRowClick={_ => {
                    const itemLink = `/${collection.username}/${collection.slug}/${item.slug}`;
                    navigate(itemLink);
                  }}
                />
              </Stack>
            </DefaultCard>
          </Fragment>
        );
      })}
    </Stack>
  );
}
