import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from '@remix-run/node';
import { logout } from '~/.server/session';

export async function action({ request }: ActionFunctionArgs) {
  return logout(request);
}

export async function loader({ request }: LoaderFunctionArgs) {
  const searchParams = new URL(request.url).searchParams;
  const pathname = (searchParams.get('redirectTo') as string) || '/';
  return redirect(pathname);
}
