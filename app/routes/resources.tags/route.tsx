import { LoaderFunctionArgs, json } from '@remix-run/node';
import { findPopularTags, findTagsLike } from '~/.server/models/tag.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get('query');
  if (query) {
    const tags = await findTagsLike(query!);
    console.log(`Loaded similiar tags: ${tags}`);
    return json({ tags });
  } else {
    const tags = await findPopularTags();
    console.log(`Loaded popular tags: ${tags}`);
    return json({ tags });
  }
}
