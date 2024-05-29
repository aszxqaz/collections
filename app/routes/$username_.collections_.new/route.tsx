import { ActionIcon, Container, Group, Stack, Text, Title } from '@mantine/core';
import { PropertyType } from '@prisma/client';
import { ActionFunctionArgs, LoaderFunctionArgs, defer, redirect } from '@remix-run/node';
import { Await, useLoaderData } from '@remix-run/react';
import { IconMinus, IconPlus } from '@tabler/icons-react';
import { Suspense, useMemo } from 'react';
import { ValidatedForm } from 'remix-validated-form';
import slugify from 'slugify';
import { findCategories } from '~/.server/models/category.server';
import { createCollection } from '~/.server/models/collection.server';
import { splitDbExecResult } from '~/.server/models/helpers.server';
import { getUser, requireUser } from '~/.server/session';
import { createCreateCollectionSchema } from '~/common/schemas';
import { useIdArray } from '~/common/useIdArray';
import { CONTENT_PROPERTY_TYPE, getPropertyTypeByContent } from '~/content';
import {
  ValidatedButton,
  ValidatedSelect,
  ValidatedTextInput,
  ValidatedTextarea,
} from '../../components/validated-form';
import { DefaultSkeleton, RepeatSkeleton } from '../components/default-skeleton';

export async function loader({ request }: LoaderFunctionArgs) {
  const user = getUser(request);
  let [categories, error] = splitDbExecResult(findCategories());
  return defer({ user, categories, error });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const { username } = await requireUser(request);
  const name = formData.get('collection-name') as string;
  const description = formData.get('description') as string;
  const category = formData.get('category') as string;
  const schemes: { name: string; type: PropertyType }[] = [];
  let i = 0;
  while (formData.get(`prop-${i}-type`)) {
    const type = formData.get(`prop-${i}-type`) as string;
    schemes.push({
      name: formData.get(`prop-${i}-name`) as string,
      type: getPropertyTypeByContent(type)!,
    });
    i++;
  }
  const slug = slugify(name, { lower: true });
  await createCollection(username, category, { name, description, slug }, schemes);
  return redirect(`/${username}/${slug}`);
}

export default function CreateCollectionPage() {
  const { categories, error } = useLoaderData<typeof loader>();
  return (
    <Container mt="lg">
      <Suspense fallback={<Fallback />}>
        <Await resolve={categories}>
          {categories => {
            if (!categories) return null;
            const idArr = useIdArray();
            const validator = useMemo(
              () => createCreateCollectionSchema(categories, idArr.ids.length),
              [categories, idArr.ids.length],
            );
            return (
              <Stack>
                <Title mb="md">Create collection</Title>
                <ValidatedForm method="post" autoComplete="off" validator={validator}>
                  <Stack>
                    <ValidatedSelect
                      name="category"
                      label="Category"
                      placeholder="Pick category"
                      data={[...categories.map(cat => cat.name)]}
                    />
                    <ValidatedTextInput name="collection-name" placeholder="Collection name" />
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
              </Stack>
            );
          }}
        </Await>
      </Suspense>
      {/* <ServerMessage message={error} /> */}
    </Container>
  );
}

function Fallback() {
  return (
    <Stack>
      <DefaultSkeleton h="3rem" mb="2rem" />
      <RepeatSkeleton count={3} />
      <DefaultSkeleton h="4.5rem" />
    </Stack>
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
        data={Object.values(CONTENT_PROPERTY_TYPE)}
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
