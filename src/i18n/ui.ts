export const languages = { ko: '한국어', en: 'English' } as const;
export type Lang = keyof typeof languages;
export const ui = {
  ko: {
    siteTitle: '개발새발 블로그',
    tagline: '대구에서 웹·앱을 만드는 1인 개발자의 기록. 무엇을 왜 만들었고, 어디서 막혔는지 남깁니다.',
    heroTitle: '1인 개발자 기록',
    latest: '최근 글',
    all: '전체',
    empty: '아직 글이 없습니다.',
    minRead: (n: number) => `${n}분`,
    back: '← 글 목록',
  },
  en: {
    siteTitle: 'Gaebal Saebal Log',
    tagline: 'Notes from a solo developer building web and mobile apps — what I build, why, and where I get stuck.',
    heroTitle: 'Notes on what I build and why',
    latest: 'Latest posts',
    all: 'All',
    empty: 'No posts yet.',
    minRead: (n: number) => `${n} min read`,
    back: '← All posts',
  },
} as const;

import categoryList from '../data/categories.json';
export const categories = categoryList;
export const categoryName = (slug: string, lang: Lang) => categories.find((c) => c.slug === slug)?.[lang] ?? slug;

export const base = import.meta.env.BASE_URL.replace(/\/$/, '');
export const slugOf = (id: string) => id.split('/').pop()!.replace(/\.md$/, '');

// 한국어는 분당 약 500자, 영어는 분당 약 220단어 기준
export function readingMinutes(body: string | undefined, lang: Lang) {
  const text = (body ?? '').replace(/```[\s\S]*?```/g, '').replace(/[#>*_`\-\[\]()]/g, '');
  const n = lang === 'ko' ? text.replace(/\s/g, '').length / 500 : text.split(/\s+/).length / 220;
  return Math.max(1, Math.round(n));
}

export const fmtDate = (d: Date, lang: Lang) =>
  d.toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Seoul' });
