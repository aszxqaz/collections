import { ActionFunctionArgs, json } from '@remix-run/node';
import { zfd } from 'zod-form-data';
import { prisma } from '~/.server/db';
import { safeDbExec } from '~/.server/models/helpers.server';
import { getUser } from '~/.server/session';
import { updateUserSchema } from './schemas';

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const user = await getUser(request);
  if (!user || !user.rights?.isAdmin || user.rights.isBlocked)
    throw new Response('', { status: 403 });
  const intent = formData.get('intent') as
    | 'blockUser'
    | 'unblockUser'
    | 'deleteUser'
    | 'adminUser'
    | 'unadminUser';
  if (!intent) throw new Response('', { status: 400 });
  const schema = zfd.formData(updateUserSchema);
  const { success, data } = schema.safeParse(formData);
  if (!data || !success) throw new Response('', { status: 400 });
  const { username } = data;
  const promise =
    intent == 'blockUser'
      ? safeDbExec(() => prisma.rights.update({ where: { username }, data: { isBlocked: true } }))
      : intent == 'unblockUser'
      ? safeDbExec(() => prisma.rights.update({ where: { username }, data: { isBlocked: false } }))
      : intent == 'adminUser'
      ? safeDbExec(() => prisma.rights.update({ where: { username }, data: { isAdmin: true } }))
      : intent == 'unadminUser'
      ? safeDbExec(() => prisma.rights.update({ where: { username }, data: { isAdmin: false } }))
      : safeDbExec(() => prisma.user.delete({ where: { username } }));
  const result = await promise;
  if (!result.ok) throw new Response('', { status: 500 });
  return json({ ...result.data });
}
