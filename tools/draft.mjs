// Claude Code 세션 로그 -> 블로그 초안.
//   node tools/draft.mjs                  # projects.json에 등록된 프로젝트의 새 세션 전부
//   node tools/draft.mjs --project d--app-Cookfol --session <id>
//   node tools/draft.mjs --list           # 처리 대상만 보기
//
// 1) 세션 로그에서 사람/어시스턴트의 텍스트만 추출(도구 출력·thinking 제외)
// 2) 비밀정보 마스킹
// 3) drafts/_inbox/<세션>.md 에 "작성 지시 + 대화 요약 재료"를 저장
// 4) `claude` CLI가 PATH에 있으면(또는 CLAUDE_BIN) 바로 초안을 생성해 drafts/ 에 저장.
//    없으면 inbox까지만 만들고, Claude Code에서 "drafts/_inbox 처리해줘"라고 하면 됩니다.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const logsDir = path.join(os.homedir(), '.claude', 'projects');
const projects = JSON.parse(fs.readFileSync(path.join(root, 'projects.json'), 'utf8'));
const statePath = path.join(root, 'tools', '.state.json');
const state = fs.existsSync(statePath) ? JSON.parse(fs.readFileSync(statePath, 'utf8')) : { done: [] };

const args = process.argv.slice(2);
const opt = (k) => (args.includes(k) ? args[args.indexOf(k) + 1] : undefined);
const MAX_CHARS = 60000; // 한 글 재료의 상한
const MIN_TURNS = 4; // 이보다 짧은 세션은 글감이 못 됨

// ---- 마스킹 ---------------------------------------------------------------
const SECRET_PATTERNS = [
  /sk-[A-Za-z0-9_-]{16,}/g,
  /gh[pousr]_[A-Za-z0-9]{20,}/g,
  /AKIA[0-9A-Z]{16}/g,
  /AIza[0-9A-Za-z_-]{30,}/g,
  /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{5,}/g, // JWT
  /(?<=(?:password|passwd|secret|token|api[_-]?key)\s*[:=]\s*["']?)[^\s"',}]{6,}/gi,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g,
];
const redact = (s) =>
  SECRET_PATTERNS.reduce((acc, re) => acc.replace(re, '[REDACTED]'), s)
    .replaceAll(os.homedir(), '~')
    .replace(/[A-Za-z]:\\Users\\[^\\\s]+/g, 'C:\\Users\\<user>')
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[email]');

// ---- 세션 파싱 ------------------------------------------------------------
function textOf(content) {
  if (typeof content === 'string') return content;
  return content.filter((c) => c.type === 'text').map((c) => c.text).join('\n');
}

function readSession(file) {
  const lines = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean);
  const turns = [];
  let title, first, last;
  for (const line of lines) {
    let o;
    try { o = JSON.parse(line); } catch { continue; }
    if (o.type === 'ai-title') title = o.aiTitle;
    if (o.timestamp) { first ??= o.timestamp; last = o.timestamp; }
    if (o.isSidechain) continue;
    if (o.type !== 'user' && o.type !== 'assistant') continue;
    const t = textOf(o.message?.content ?? '').trim();
    if (!t) continue; // tool_result만 있는 user 턴, tool_use만 있는 assistant 턴
    if (o.type === 'user' && (t.startsWith('<') || t.startsWith('[Request interrupted'))) continue; // 시스템 주입/중단 표시
    turns.push({ role: o.type === 'user' ? 'ME' : 'CLAUDE', text: t });
  }
  return { turns, title, first, last };
}

function toTranscript(turns) {
  const parts = turns.map((t) => `### ${t.role}\n${redact(t.text)}`);
  let out = parts.join('\n\n');
  if (out.length > MAX_CHARS) {
    // 앞(목표·초기 결정)과 뒤(결론)를 살리고 가운데를 자른다
    const head = out.slice(0, MAX_CHARS * 0.45);
    const tail = out.slice(-MAX_CHARS * 0.55);
    out = `${head}\n\n[... 중간 생략 ...]\n\n${tail}`;
  }
  return out;
}

// ---- 프롬프트 -------------------------------------------------------------
function buildPrompt(proj, meta, transcript) {
  const ko = proj.lang === 'ko';
  return `당신은 1인 개발자의 개발 일지를 대신 정리하는 편집자입니다.
아래는 개발자("ME")와 Claude가 나눈 작업 대화입니다. 이를 바탕으로 블로그 글 1편을 ${ko ? '한국어' : 'English'}로 작성하세요.

프로젝트: ${proj.name} — ${proj.summary}
독자: ${proj.audience}
세션 제목: ${meta.title ?? '(없음)'}

작성 원칙:
- 1인칭(개발자 시점)으로 쓴다. "Claude가 ~했다"가 아니라 "나는 ~하기로 했다".
- 구조: 문제/목표 → 고려한 선택지와 결정 이유 → 막힌 지점과 해결 → 배운 점/다음 계획.
- 대화에 실제로 나온 구체적 사실만 쓴다. 지어내지 않는다. 수치·결과가 불확실하면 쓰지 않는다.
- 검색될 만한 구체적 제목(문제 상황이 드러나게). 과장·낚시 금지.
- 코드는 핵심만 짧게. API 키, 내부 경로, 개인정보는 절대 넣지 않는다.
- 분량 800~1500자 ${ko ? '' : '(words: 400-800)'}. 소제목(##) 사용.

출력 형식 — 아래 frontmatter로 시작하는 마크다운만 출력하고 다른 설명은 붙이지 않는다:
---
title: "..."
description: "검색 결과에 노출될 1~2문장 요약(120자 이내)"
date: ${(meta.last ?? new Date().toISOString()).slice(0, 10)}
lang: ${proj.lang}
project: ${proj.name}
tags: [3~5개]
---
(본문)

===== 대화 시작 =====
${transcript}
===== 대화 끝 =====
`;
}

// ---- 실행 -----------------------------------------------------------------
const claudeBin = process.env.CLAUDE_BIN || 'claude';
const hasClaude = spawnSync(`${claudeBin} --version`, { shell: true, encoding: 'utf8' }).status === 0;

const targetProject = opt('--project');
const targetSession = opt('--session');
let queued = 0;

for (const [key, proj] of Object.entries(projects)) {
  if (targetProject && targetProject !== key) continue;
  const dir = path.join(logsDir, key);
  if (!fs.existsSync(dir)) { console.warn(`로그 폴더 없음: ${dir}`); continue; }
  for (const f of fs.readdirSync(dir).filter((n) => n.endsWith('.jsonl'))) {
    const id = f.replace(/\.jsonl$/, '');
    if (targetSession && targetSession !== id) continue;
    if (!targetSession && state.done.includes(id)) continue;
    const meta = readSession(path.join(dir, f));
    if (meta.turns.length < MIN_TURNS) continue;
    queued++;
    console.log(`${id}  ${meta.turns.length}턴  ${meta.title ?? ''}`);
    if (args.includes('--list')) continue;

    const prompt = buildPrompt(proj, meta, toTranscript(meta.turns));
    const inbox = path.join(root, 'drafts', '_inbox');
    fs.mkdirSync(inbox, { recursive: true });
    const inboxFile = path.join(inbox, `${id}.md`);
    fs.writeFileSync(inboxFile, prompt);

    if (hasClaude) {
      const r = spawnSync(`${claudeBin} -p`, { input: prompt, encoding: 'utf8', shell: true, maxBuffer: 1 << 26 });
      if (r.status === 0 && r.stdout.trim().startsWith('---')) {
        const date = (meta.last ?? '').slice(0, 10) || new Date().toISOString().slice(0, 10);
        const out = path.join(root, 'drafts', `${date}-${id.slice(0, 8)}.md`);
        fs.writeFileSync(out, r.stdout.trim() + '\n');
        fs.rmSync(inboxFile);
        state.done.push(id);
        console.log(`  -> ${path.relative(root, out)}`);
      } else {
        console.warn(`  초안 생성 실패(inbox에 남김): ${(r.stderr || '').slice(0, 200)}`);
      }
    } else {
      console.log(`  -> ${path.relative(root, inboxFile)} (claude CLI 없음: Claude Code에서 처리하세요)`);
    }
  }
}
if (!args.includes('--list')) fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
if (!queued) console.log('새로 처리할 세션이 없습니다.');
