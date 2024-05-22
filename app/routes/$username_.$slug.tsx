import { Breadcrumbs, Container, Table, Text } from '@mantine/core';
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  SerializeFrom,
  defer,
  json,
} from '@remix-run/node';
import { Await, Link, useActionData, useLoaderData } from '@remix-run/react';
import { IconChevronRight } from '@tabler/icons-react';
import { Suspense, useMemo } from 'react';
import { zfd } from 'zod-form-data';
import { createItems, findCollection } from '~/.server/models/collection.server';
import { getUsername } from '~/.server/session';
import { ItemPropTypeClient, createCreateItemSchema } from '~/common/schemas';
import { DefaultCard } from './_components/ui';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const username = params.username as string;
  const slug = params.slug as string;
  const now = Date.now();
  const collection = findCollection(username, slug);
  console.log(`ELAPSED: ${Date.now() - now}`);
  return defer({ collection, username, slug });
}

export async function action({ request, params }: ActionFunctionArgs) {
  console.log('here');
  const username = await getUsername(request);
  if (!username) return json({ status: 401 });
  const collection = await findCollection(username, params.slug as string);
  console.log('here');
  if (!collection) return json({ status: 404 });
  const formData = await request.formData();
  const itemCount = Number(formData.get('item-count'));
  for (const e of formData.entries()) {
    console.log(`${e[0]}: ${e[1]}`);
  }
  if (!itemCount || isNaN(itemCount)) return json({ status: 400 });
  const schema = zfd.formData(createCreateItemSchema(itemCount, collection.schemes));
  const { success, data } = schema.safeParse(formData);
  if (!success) return json({ status: 400 });
  const itemDtos = [];
  for (let itemIdx = 0; itemIdx < itemCount; itemIdx++) {
    const props = collection.schemes.map((scheme, propIdx) => ({
      value: data[`item-${itemIdx}-prop-${propIdx}-value`].toString(),
      schemeId: scheme.id,
    }));
    itemDtos.push({
      name: data[`item-${itemIdx}-name`],
      props,
    });
  }
  const items = await createItems(username, collection.slug, itemDtos);
  console.log(items);
  return json({ items });
}

type LoaderData = ReturnType<typeof useLoaderData<typeof loader>>;
type ActionData = ReturnType<typeof useActionData<typeof action>>;

type ActualActionData = Extract<
  ActionData,
  SerializeFrom<{
    items: any[];
  }>
>;

export default function CollectionPage() {
  const { collection, username, slug } = useLoaderData<typeof loader>();

  const breadcrumbsItems = [
    <Link key="username" to={`/${username}`}>
      {username}
    </Link>,
    <Text key="slug">{slug}</Text>,
  ];

  return (
    <Container mt="xl">
      <Breadcrumbs mb="md" separator={<IconChevronRight />} separatorMargin="md" mt="xs">
        {breadcrumbsItems}
      </Breadcrumbs>

      {/* <Group mb="xs">
          <Text fw={500}>{collection?.name}</Text>
          <Badge>Public</Badge>
        </Group>
        <Text size="sm" c="dimmed">
          {collection?.description}
        </Text> */}
      <Suspense fallback={`Loading...`}>
        <Await resolve={collection}>
          {collection => <ItemPropSchemeTable collection={collection} />}
        </Await>
      </Suspense>
      {/* <CreateItemPanel /> */}
    </Container>
  );
}

type ItemPropSchemeTableProps = {
  collection: Awaited<LoaderData['collection']>;
};

function ItemPropSchemeTable({ collection }: ItemPropSchemeTableProps) {
  const data = useMemo(
    () => ({
      caption: 'Collection item properties',
      head: ['#', 'Type', 'Name'],
      body: collection?.schemes.map((property, i) => [
        i + 1,
        ItemPropTypeClient[property.type],
        property.name,
      ]),
    }),
    [collection?.schemes],
  );
  return (
    <DefaultCard>
      <Table data={data} />
    </DefaultCard>
  );
}

// function CreateItemPanel() {
//   const idsArr = useIdArray();
//   const { collection } = useLoaderData<typeof loader>();
//   const validator = useMemo(
//     () => withZod(createCreateItemSchema(idsArr.ids.length, collection!.schemes)),
//     [collection?.schemes, idsArr.ids.length],
//   );
//   const actionData = useActionData<typeof action>();
//   const [items, setItems] = useState(collection?.items || []);

//   useEffect(() => {
//     if (actionData && 'items' in actionData) {
//       setItems(prev => [...prev, ...(actionData as ActualActionData).items]);
//       idsArr.clear();
//     }
//   }, [actionData && 'items' in actionData && actionData.items]);

//   return (
//     <ValidatedForm method="post" validator={validator}>
//       <Stack>
//         {collection && (
//           <Stack mt="lg" gap="md">
//             <ItemList collection={collection} items={items} />
//           </Stack>
//         )}
//         {collection?.schemes && idsArr.ids.length ? (
//           <Stack mt="lg" gap="md">
//             {idsArr.ids.map((id, i) => (
//               <AddItemGroup
//                 key={id}
//                 id={id}
//                 itemIdx={i}
//                 schemes={collection?.schemes}
//                 onDelete={() => idsArr.deleteOne(id)}
//               />
//             ))}
//           </Stack>
//         ) : null}
//         <Group justify="space-between">
//           <Group>
//             <ActionIcon aria-label="Add item" onClick={idsArr.appendRandom}>
//               <IconPlus />
//             </ActionIcon>
//             <Text>Add item</Text>
//           </Group>
//           {idsArr.ids.length && (
//             <>
//               <input type="hidden" name="item-count" value={idsArr.ids.length} />
//               <ValidatedButton type="submit">Create</ValidatedButton>
//             </>
//           )}
//         </Group>
//       </Stack>
//     </ValidatedForm>
//   );
// }

// type ItemPropGroupProps = {
//   onDelete: () => void;
//   itemIdx: number;
//   id: number;
//   schemes: {
//     name: string;
//     type: ItemPropType;
//   }[];
// };

// function AddItemGroup({ onDelete, schemes, itemIdx, id }: ItemPropGroupProps) {
//   console.log('KEYS');
//   return (
//     <DefaultCard>
//       <Group>
//         <Stack flex={1}>
//           <ValidatedTextInput
//             name={`item-${itemIdx}-name`}
//             label="Item name"
//             placeholder="Item name"
//           />
//           {schemes.map((scheme, propIdx) => {
//             const name = `item-${itemIdx}-prop-${propIdx}-value`;
//             const key = `${propIdx}${id}`;
//             switch (scheme.type) {
//               case 'Date':
//                 return (
//                   <ValidatedTextInput
//                     key={key}
//                     name={name}
//                     placeholder="1982-11-01"
//                     label={scheme.name}
//                   />
//                 );
//               case 'Int':
//                 return (
//                   <ValidatedTextInput key={key} name={name} placeholder="1" label={scheme.name} />
//                 );
//               case 'LineText':
//                 return (
//                   <ValidatedTextInput
//                     key={key}
//                     name={name}
//                     placeholder="Text"
//                     label={scheme.name}
//                   />
//                 );
//               case 'MultilineText':
//                 return (
//                   <ValidatedTextarea
//                     key={key}
//                     name={name}
//                     placeholder="Multiline text"
//                     label={scheme.name}
//                   />
//                 );
//               case 'Bool':
//                 return <ValidatedCheckbox key={key} name={name} label={scheme.name} />;
//             }
//           })}
//         </Stack>
//         <ActionIcon aria-label="Delete" bg="red" onClick={onDelete}>
//           <IconMinus />
//         </ActionIcon>
//       </Group>
//     </DefaultCard>
//   );
// }

// type ItemListProps = {
//   items: ActualActionData['items'];
//   collection: NonNullable<LoaderData['collection']>;
// };

// function ItemList({ collection, items }: ItemListProps) {
//   const data = {
//     caption: 'Collection items',
//     head: ['#', 'Name', ...collection.schemes.map(scheme => scheme.name)],
//     body: items.map((item, i) => [i + 1, item.name, ...item.properties.map(prop => prop.value)]),
//   };
//   return (
//     <DefaultCard>
//       <Table data={data} />
//     </DefaultCard>
//   );
// }
