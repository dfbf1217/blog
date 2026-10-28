import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    lang: z.enum(['ko', 'en']),
    project: z.string().optional(),
    tags: z.array(z.string()).default([]),
    // 같은 글의 다른 언어 버전 slug (hreflang 연결용)
    translationOf: z.string().optional(),
  }),
});

export const collections = { posts };
