// 검토 끝난 초안을 사이트 콘텐츠로 옮긴다.
//   node tools/publish.mjs drafts/2026-10-25-558adcfd.md [slug]
// 이후 git add/commit/push 하면 GitHub Actions가 배포한다.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const [src, slugArg] = process.argv.slice(2);
if (!src) { console.error('사용법: npm run publish -- drafts/<파일>.md [slug]'); process.exit(1); }

const text = fs.readFileSync(path.resolve(src), 'utf8');
const fm = text.match(/^---\n([\s\S]*?)\n---/);
if (!fm) { console.error('frontmatter(---)가 없습니다.'); process.exit(1); }
const get = (k) => fm[1].match(new RegExp(`^${k}:\\s*(.+)$`, 'm'))?.[1].trim().replace(/^"|"$/g, '');

const lang = get('lang');
if (!['ko', 'en'].includes(lang)) { console.error(`lang이 ko/en이 아닙니다: ${lang}`); process.exit(1); }
for (const k of ['title', 'description', 'date']) if (!get(k)) { console.error(`${k} 누락`); process.exit(1); }
const categories = JSON.parse(fs.readFileSync(path.join(root, 'src', 'data', 'categories.json'), 'utf8')).map((c) => c.slug);
if (!categories.includes(get('category'))) { console.error(`category는 ${categories.join('/')} 중 하나여야 합니다: ${get('category')}`); process.exit(1); }
if (/\[REDACTED\]|sk-[A-Za-z0-9]{16,}/.test(text)) console.warn('경고: 마스킹 흔적/비밀키 패턴이 있습니다. 다시 확인하세요.');

const slug = (slugArg ?? path.basename(src, '.md').replace(/^\d{4}-\d{2}-\d{2}-/, '')).toLowerCase().replace(/[^a-z0-9-]+/g, '-');
const dest = path.join(root, 'src', 'content', 'posts', lang, `${slug}.md`);
if (fs.existsSync(dest)) { console.error(`이미 존재: ${dest}`); process.exit(1); }
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.renameSync(path.resolve(src), dest);
console.log(`발행 준비 완료: ${path.relative(root, dest)}\n다음: git add . && git commit -m "post: ${slug}" && git push`);
