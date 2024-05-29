import { createCookie } from '@remix-run/node';

const colorSchemeCookie = createCookie('color-scheme');

export async function getColorScheme(request: Request) {
  const cookieHeader = request.headers.get('Cookie');
  const cookie = await colorSchemeCookie.parse(cookieHeader);
}
