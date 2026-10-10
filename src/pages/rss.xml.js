import rss from '@astrojs/rss';
import { getPosts } from '../lib/posts';
import { SITE } from '../site';

export async function GET(context) {
  const posts = await getPosts();
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/posts/${post.id}/`,
      categories: post.data.tags,
    })),
    customData: `<language>ko</language>`,
  });
}
