import { ActionIcon, CardProps, Group, Stack, Text } from '@mantine/core';
import { SerializeFrom } from '@remix-run/node';
import { Await, useActionData } from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import { IconPlus } from '@tabler/icons-react';
import { Dispatch, SetStateAction, Suspense, useEffect, useMemo } from 'react';
import { ValidatedForm } from 'remix-validated-form';
import { useIdArray } from '~/common/useIdArray';
import { ItemWithProperties } from '~/types/models';
import { createCreateItemSchema } from '../../common/schemas';
import { ValidatedButton } from '../../components/validated-form';
import { action } from './actions';
import { AddItemGroup } from './add-item-group';
import { useCurrentLoaderData } from './route';

type CreateItemPanelProps = {
  setItems: Dispatch<SetStateAction<SerializeFrom<ItemWithProperties>[] | undefined>>;
} & CardProps;

export function CreateItemPanel({ setItems }: CreateItemPanelProps) {
  const { collection } = useCurrentLoaderData();
  return (
    <Suspense>
      <Await resolve={collection}>
        {collection => {
          if (!collection) return null;
          const { schemes } = collection;
          const idsArr = useIdArray();
          const validator = useMemo(
            () => withZod(createCreateItemSchema(idsArr.ids.length, schemes)),
            [schemes, idsArr.ids.length],
          );
          const actionData = useActionData<typeof action>();

          useEffect(() => {
            if (actionData && 'items' in actionData) {
              setItems(prev => [...(prev || []), ...actionData.items]);
              if ('errors' in actionData && actionData.errors) {
                idsArr.setIds(prev =>
                  prev.filter((_, i) => actionData.errors!.map(d => d.index).includes(i)),
                );
              } else {
                idsArr.clear();
              }
            }
          }, [actionData && 'items' in actionData && actionData.items]);

          return (
            <ValidatedForm id="form" method="post" validator={validator}>
              <input type="hidden" name="intent" value="create-items" />
              <Stack>
                {collection?.schemes && idsArr.ids.length ? (
                  <Stack mt="lg" gap="md">
                    {idsArr.ids.map((id, i) => (
                      <AddItemGroup
                        key={id}
                        id={id}
                        itemIdx={i}
                        schemes={collection?.schemes}
                        onDelete={() => idsArr.deleteOne(id)}
                      />
                    ))}
                  </Stack>
                ) : null}
                <Group justify="space-between">
                  <Group>
                    <ActionIcon aria-label="Add item" onClick={idsArr.appendRandom}>
                      <IconPlus />
                    </ActionIcon>
                    <Text>Add item</Text>
                  </Group>
                  {idsArr.ids.length && (
                    <>
                      <input type="hidden" name="item-count" value={idsArr.ids.length} />
                      <ValidatedButton type="submit">Create</ValidatedButton>
                    </>
                  )}
                </Group>
              </Stack>
            </ValidatedForm>
          );
        }}
      </Await>
    </Suspense>
  );
}
