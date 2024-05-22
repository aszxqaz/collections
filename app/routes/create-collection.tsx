import { ActionIcon, Container, Group, Stack, Text, Title } from '@mantine/core';
import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { IconMinus, IconPlus } from '@tabler/icons-react';
import { useMemo } from 'react';
import { ValidatedForm } from 'remix-validated-form';
import slugify from 'slugify';
import { findCategories } from '~/.server/models/category.server';
import { createCollection } from '~/.server/models/collection.server';
import { getUser, requireUser } from '~/.server/session';
import {
  ItemPropTypeCLient,
  ItemPropTypeClient,
  createCreateCollectionSchema,
} from '~/common/schemas';
import { useIdArray } from '~/common/useIdArray';
import {
  ValidatedButton,
  ValidatedSelect,
  ValidatedTextInput,
  ValidatedTextarea,
} from './_components/validated-form';

export async function loader({ request }: LoaderFunctionArgs) {
  const now = Date.now();
  const user = await getUser(request);
  if (!user) return redirect('/');
  const categories = await findCategories();
  console.log(`ELAPSED: ${Date.now() - now} ms`);
  console.log(categories);
  return json({ categories });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const { username } = await requireUser(request);
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const category = formData.get('category') as string;
  const schemes: { name: string; type: ItemPropTypeCLient }[] = [];
  let i = 0;
  while (formData.get(`prop-${i}-type`)) {
    const value = formData.get(
      `prop-${i}-type`,
    ) as (typeof ItemPropTypeClient)[keyof typeof ItemPropTypeClient];
    schemes.push({
      name: formData.get(`prop-${i}-name`) as string,
      type: Object.entries(ItemPropTypeClient).find(
        ([key, val]) => val == value,
      )![0] as ItemPropTypeCLient,
    });
    i++;
  }
  const slug = slugify(name);
  await createCollection(username, category, { name, description, slug }, schemes);
  return redirect(`/${username}/${slug}`);
}

export default function CreateCollectionPage() {
  const idArr = useIdArray();
  const { categories } = useLoaderData<typeof loader>();
  const validator = useMemo(
    () => createCreateCollectionSchema(categories, idArr.ids.length),
    [categories, idArr.ids.length],
  );

  return (
    <Container mt="lg">
      <Title mb="md">Create collection</Title>
      <ValidatedForm method="post" validator={validator}>
        <Stack>
          <ValidatedSelect
            name="category"
            label="Category"
            placeholder="Pick category"
            data={[...categories.map(cat => cat.name)]}
          />
          <ValidatedTextInput name="name" placeholder="Collection name" />
          <ValidatedTextarea name="description" placeholder="Description" />
          {idArr.ids.map((id, i) => (
            <ItemPropGroup key={id} index={i} onDelete={() => idArr.deleteOne(id)} />
          ))}
          <Group>
            <ActionIcon aria-label="Add item field" onClick={idArr.appendRandom}>
              <IconPlus />
            </ActionIcon>
            <Text>Add item property</Text>
          </Group>
          <ValidatedButton type="submit">Create</ValidatedButton>
        </Stack>
      </ValidatedForm>
    </Container>
  );
}

type ItemPropGroupProps = {
  onDelete: () => void;
  index: number;
};

function ItemPropGroup({ onDelete, index }: ItemPropGroupProps) {
  return (
    <Group>
      <ValidatedSelect
        name={`prop-${index}-type`}
        label="Property type"
        placeholder="Pick type"
        data={Object.values(ItemPropTypeClient)}
      />
      <ValidatedTextInput
        flex={1}
        name={`prop-${index}-name`}
        placeholder="Property name"
        label="Property name"
      />
      <ActionIcon aria-label="Delete" bg="red" onClick={onDelete}>
        <IconMinus />
      </ActionIcon>
    </Group>
  );
}
