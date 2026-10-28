# 1인 개발 일지 (자동 초안 블로그)

Claude Code 세션 로그 → 초안 → 내가 검토 → 발행(git push) → GitHub Pages 배포.

## 흐름

1. `projects.json`에 프로젝트 등록 (`lang`: ko/en, `audience`: 타깃 독자). 키는 `~/.claude/projects/` 아래 폴더명.
2. `npm run draft` — 새 세션을 읽어 비밀정보를 마스킹하고 작성 지시문을 만든다.
   - `claude` CLI가 PATH에 있으면 `drafts/<날짜>-<id>.md` 초안까지 자동 생성.
   - 없으면 `drafts/_inbox/`에 지시문만 만들어진다 → Claude Code에서 "drafts/_inbox 처리해서 초안 만들어줘".
3. `drafts/`의 초안을 읽고 고친다. (사실 확인, 비밀정보, 어색한 문장)
4. `npm run publish -- drafts/<파일>.md [slug]` — `src/content/posts/<lang>/`로 이동.
5. `git add . && git commit && git push` — Actions가 배포.

`drafts/_inbox/`는 원본 대화가 들어 있으므로 git에서 제외되어 있다.

## 배포 전 한 번만

- `astro.config.mjs`의 `site`(GitHub 아이디)와 `base`(저장소 이름)를 수정. 커스텀 도메인을 쓰면 `base` 삭제.
- GitHub 저장소 Settings → Pages → Source: GitHub Actions.
- Google Search Console에 `sitemap-index.xml` 제출.

## 번역본 연결

같은 글의 두 언어 버전은 한쪽 frontmatter에 `translationOf: <상대 slug>`를 적으면 `hreflang`과 언어 전환 링크가 이어진다.
