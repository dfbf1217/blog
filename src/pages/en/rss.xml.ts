import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { ui, base, slugOf } from '../../i18n/ui';
export async function GET(context: { site: URL }) {
  const posts = (await getCollection('posts'))
    .filter((p) => p.data.lang === 'en')
    .sort((a, b) => +b.data.date - +a.data.date);
  return rss({
    title: ui.en.siteTitle,
    description: ui.en.tagline,
    site: context.site,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.date,
      link: `${base}/en/posts/${slugOf(p.id)}/`,
    })),
  });
}
