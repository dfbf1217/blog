export const languages = { ko: '한국어', en: 'English' } as const;
export type Lang = keyof typeof languages;
export const ui = {
  ko: { siteTitle: '1인 개발 일지', tagline: '만들면서 한 생각들을 기록합니다.', latest: '최근 글', empty: '아직 글이 없습니다.' },
  en: { siteTitle: 'Solo Dev Log', tagline: 'Notes on what I build and what I think along the way.', latest: 'Latest posts', empty: 'No posts yet.' },
} as const;

export const base = import.meta.env.BASE_URL.replace(/\/$/, '');
export const slugOf = (id: string) => id.split('/').pop()!.replace(/\.md$/, '');
