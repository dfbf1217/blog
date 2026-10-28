import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { ui, base, slugOf } from '../../i18n/ui';
export async function GET(context: { site: URL }) {
  const posts = (await getCollection('posts'))
    .filter((p) => p.data.lang === 'ko')
    .sort((a, b) => +b.data.date - +a.data.date);
  return rss({
    title: ui.ko.siteTitle,
    description: ui.ko.tagline,
    site: context.site,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.date,
      link: `${base}/ko/posts/${slugOf(p.id)}/`,
    })),
  });
}
