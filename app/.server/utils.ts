import { LoaderFunction, json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { findCollection } from './models/collection.server';
import { getUser, getUsername } from './session';

const DEFAULT_REDIRECT = '/';

export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect: string = DEFAULT_REDIRECT,
) {
  if (!to || typeof to !== 'string') {
    return defaultRedirect;
  }

  if (!to.startsWith('/') || to.startsWith('//')) {
    return defaultRedirect;
  }

  return to;
}

export type AsyncLoaderData<T extends LoaderFunction> = ReturnType<typeof useLoaderData<T>>;
export type LoaderData<T extends LoaderFunction> = Awaited<AsyncLoaderData<T>>;
export type AwaitedLoaderData<
  T extends LoaderFunction,
  K extends keyof Awaited<LoaderData<T>>,
> = Awaited<LoaderData<T>[K]>;

export async function checkUser(request: Request) {
  const username = await getUsername(request);
  if (!username) return [null, json({ ok: false, status: 401 })] as const;
  return [username, null] as const;
}

export async function checkUserRights(request: Request) {
  const user = await getUser(request);
  if (!user || user.rights?.isBlocked) return [null, json({ status: 401 })] as const;
  return [user, null] as const;
}

export async function checkCollection(username: string, slug: string) {
  const result = await findCollection(username, slug);
  if (!result.ok) return [null, json({ ok: false, status: 500 })] as const;

  let collection = result.data;
  if (!collection) return [null, json({ ok: false, status: 400 })] as const;
  return [collection, null] as const;
}
