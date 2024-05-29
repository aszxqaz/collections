import { ActionFunctionArgs, SerializeFrom } from '@remix-run/node';
import { json, useActionData } from '@remix-run/react';
import { zfd } from 'zod-form-data';
import { checkCollection, checkUserRights } from '~/.server/utils';
import { createItems } from '../../.server/models/collection.server';
import { createCreateItemSchema } from '../../common/schemas';

export async function action({ request, params }: ActionFunctionArgs) {
  const [user, forbiddenResponse] = await checkUserRights(request);
  if (forbiddenResponse) return forbiddenResponse;
  const { username } = user;

  const [collection, failOrNotFoundResponse] = await checkCollection(username, params.slug!);
  if (failOrNotFoundResponse) return failOrNotFoundResponse;

  const formData = await request.formData();
  const itemCount = Number(formData.get('item-count'));
  if (!itemCount || isNaN(itemCount)) return json({ ok: false, status: 400 });

  const schema = zfd.formData(createCreateItemSchema(itemCount, collection.schemes));
  const { success, data } = schema.safeParse(formData);
  if (!success) return json({ ok: false, status: 400 });

  const itemDtos = [];
  for (let itemIdx = 0; itemIdx < itemCount; itemIdx++) {
    const props = collection.schemes.map((scheme, propIdx) => ({
      value: data[`item-${itemIdx}-prop-${propIdx}-value`].toString(),
      schemeId: scheme.id,
    }));
    itemDtos.push({
      name: data[`item-${itemIdx}-name`],
      tags: data[`item-${itemIdx}-tags`],
      props,
    });
  }
  const [items, errors] = await createItems(username, collection.slug, itemDtos);
  return json({ ok: true, items, errors });
}

export type ActionData = ReturnType<typeof useActionData<typeof action>>;

export type ActualActionData = Extract<
  ActionData,
  SerializeFrom<{
    items: any[];
  }>
>;
