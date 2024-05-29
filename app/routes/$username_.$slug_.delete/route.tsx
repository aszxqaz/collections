import { ActionFunctionArgs, json, redirect } from '@remix-run/node';
import { deleteCollection } from '~/.server/models/collection.server';
import { checkCollection, checkUser } from '~/.server/utils';

export async function action({ request, params }: ActionFunctionArgs) {
  const [username, _r1] = await checkUser(request, params);
  if (_r1) return _r1;

  const [collection, _r2] = await checkCollection(username, params.slug!);
  if (_r2) return _r2;

  const result = await deleteCollection(username, collection.slug);

  if (!result.ok) return json({ ok: false, status: 500 });
  return redirect(`/${username}`);
}
