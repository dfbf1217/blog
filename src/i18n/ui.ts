export const languages = { ko: '한국어', en: 'English' } as const;
export type Lang = keyof typeof languages;
export const ui = {
  ko: {
    siteTitle: '개발새발 블로그',
    tagline: '대구에서 웹·앱을 만드는 1인 개발자의 기록. 무엇을 왜 만들었고, 어디서 막혔는지 남깁니다.',
    heroTitle: '1인 개발자 기록',
    latest: '최근 글',
    all: '전체',
    categories: '카테고리',
    empty: '아직 글이 없습니다.',
    back: '← 글 목록',
  },
  en: {
    siteTitle: 'Gaebal Saebal Log',
    tagline: 'Notes from a solo developer building web and mobile apps — what I build, why, and where I get stuck.',
    heroTitle: 'Notes on what I build and why',
    latest: 'Latest posts',
    all: 'All',
    categories: 'Categories',
    empty: 'No posts yet.',
    back: '← All posts',
  },
} as const;

import categoryList from '../data/categories.json';
export const categories = categoryList;
export const categoryName = (slug: string, lang: Lang) => categories.find((c) => c.slug === slug)?.[lang] ?? slug;

export const base = import.meta.env.BASE_URL.replace(/\/$/, '');
export const slugOf = (id: string) => id.split('/').pop()!.replace(/\.md$/, '');

export const fmtDate = (d: Date, lang: Lang) =>
  d.toLocaleString(lang === 'ko' ? 'ko-KR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Seoul' });
