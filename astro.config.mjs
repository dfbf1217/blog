import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// 도메인 구입/배포 후 아래 site, base만 바꾸면 됩니다.
// GitHub Pages(프로젝트 사이트)라면 base는 '/저장소이름', 커스텀 도메인이면 base 제거.
export default defineConfig({
  site: 'https://dfbf1217.github.io',
  base: '/blog',
  trailingSlash: 'always',
  markdown: {
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } },
  },
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'ko', locales: { ko: 'ko-KR' } },
    }),
  ],
});
