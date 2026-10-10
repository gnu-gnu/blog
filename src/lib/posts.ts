import { getCollection } from 'astro:content';

/** Published posts, newest first. Drafts are visible only in `astro dev`. */
export async function getPosts() {
  const posts = await getCollection('posts', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function tagSlug(tag: string) {
  return encodeURIComponent(tag.trim().toLowerCase().replace(/\s+/g, '-'));
}

/** Categories that have at least one published post, in CATEGORIES order, with counts. */
export async function getCategories() {
  const { CATEGORIES } = await import('../site');
  const posts = await getPosts();
  return CATEGORIES
    .map((c) => ({ ...c, posts: posts.filter((p) => p.data.category === c.name) }))
    .filter((c) => c.posts.length > 0);
}
