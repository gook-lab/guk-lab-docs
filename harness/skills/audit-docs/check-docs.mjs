#!/usr/bin/env node
/**
 * 문서가 가리키는 것이 실제로 존재하는지 검사한다.
 *
 * 문서는 코드가 아니라서 아무도 컴파일해 주지 않는다. 파일을 옮기면 링크가
 * 조용히 죽고, 아무도 모른 채 몇 달이 지난다. 이 스크립트는 문서에 있는
 * "주장" 중 기계가 확인할 수 있는 것만 골라 검사한다.
 *
 *   1. 상대 링크가 실제 파일/디렉토리를 가리키는가
 *   2. 본문에 인용된 코드 경로(`src/foo/bar.ts`)가 존재하는가
 *   3. 마크다운 표에 헤더가 있는가 (헤더 없는 행은 렌더링이 깨진다)
 *   4. 사람이 읽는 문서의 어미가 STYLE.md 톤 규칙을 지키는가
 *      (해요체·반말 종결·이중과거·전환 오변환 — 지시문과 STYLE.md 는 제외)
 *
 * 사용:
 *   node check-docs.mjs            # 검사 (문제 있으면 exit 1)
 *   node check-docs.mjs --paths    # 코드 경로 검사까지 (오탐이 늘 수 있다)
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, dirname, normalize, relative } from "node:path";

const ROOT = process.cwd();
const CHECK_PATHS = process.argv.includes("--paths");
const SKIP_DIRS = new Set([
  "node_modules", ".git", "dist", "build", "coverage",
  ".venv", "venv", "__pycache__", ".godot", "Library",
  "playwright-report", "test-results", ".gstack", ".next",
]);

/**
 * git 레포 안이면 git 에게 목록을 묻는다 — 추적 중이거나, 추적은 안 되지만
 * ignore 되지도 않은 .md 만 본다. 디렉토리를 직접 훑으면 .gitignore 된
 * 작업 폴더(clone 해 둔 남의 레포 등)까지 검사해 남의 문제를 내 실패로
 * 보고하게 된다.
 */
function gitDocs() {
  const r = spawnSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z", "*.md"],
    { cwd: ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0 || !r.stdout) return null;
  return r.stdout.split("\0").filter(Boolean).map((f) => join(ROOT, f));
}

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      walk(join(dir, e.name), out);
    } else if (e.name.endsWith(".md")) {
      out.push(join(dir, e.name));
    }
  }
  return out;
}

/** 코드펜스 안쪽은 검사하지 않는다 — 예시 코드의 경로는 실재하지 않아도 된다 */
function stripFences(text) {
  let inFence = false;
  return text.split("\n").map((line) => {
    if (/^\s*```/.test(line)) { inFence = !inFence; return ""; }
    // 인라인 코드(`...`)도 지운다 — 예시 안의 ['x'](S) 같은 표기가
    // 마크다운 링크로 오인된다 (dragon-game 에서 실제로 걸렸다).
    return inFence ? "" : line.replace(/`[^`]*`/g, "``");
  });
}

const problems = [];
const add = (file, line, kind, detail) =>
  problems.push({ file: relative(ROOT, file), line, kind, detail });

/* ── 4) 톤 검사 (STYLE.md '어미' 절) ──────────────────────────────────
 * 대상은 사람이 읽는 문서뿐이다. 에이전트 지시문(CLAUDE.md·PROMPT.md·
 * skills/·commands/·.claude/)은 간결체가 규약이고, STYLE.md 는 위반
 * 예시를 본문에 인용하므로 둘 다 제외한다. 인용(>)은 원문 유지가
 * 규칙이라 건너뛰고, 코드는 stripFences 가 이미 지웠다.
 */
const TONE_EXEMPT = /(^|\/)(CLAUDE|PROMPT|STYLE)\.md$|\/(skills|commands)\/|\/\.claude\//;
// 줄 끝 해요체 — 어휘 목록('해요·어요…')이 아니라 '한글+요/죠' 일반형으로 잡는다.
// 어휘 목록은 '말해줘요' 같은 활용형을 통째로 놓친 전적이 있다. 단, '필요·개요·중요'
// 같은 명사는 '요' 로 끝나도 어미가 아니다 (STYLE.md 예외 목록).
const CASUAL_END = /[가-힣](요|죠)[.!?")\]:…]*$/;
// 예외 — '요' 로 끝나는 명사, 그리고 STYLE.md 가 권유형으로 허용한 '~(주)세요'
const NOUN_YO_END = /((필요|개요|중요|불필요|수요|강요)|세요)[.!?")\]:…]*$/;
const CASUAL_CELL = /[가-힣](요|죠) *\|/;                           // 표 셀 안 해요체
const NOUN_YO_CELL = /(필요|개요|중요|불필요|수요|강요) *\|/;
// 어미 일괄 전환이 실제로 만든 오변환 (STYLE.md 함정 목록).
// 단어 시작에서만 매칭한다 — '지킵니다·실패시킵니다' 의 '킵니다' 는 정상 활용이다.
// '돕니다' 는 목록에서 뺐다: 돌리다의 오변환이기도 하지만 돌다의 정상 활용이기도
// 해서(예: "코드가 처음 돕니다") 기계로는 못 가른다 — 사람이 봐야 한다.
const BROKEN = /(?:^|[^가-힣])(킵니다|잠습니다|흡니다|가입니다|이예요|아니예요)/;
const POLITE = /(니다|세요|십시오|이오|시죠)$/;
const JOSA_TAIL = /(마다|보다|부터|까지|커녕|이다시피)$/;           // '다'로 끝나는 조사·연결형

const isHangul = (c) => c >= "가" && c <= "힣";
/** X(ㅆ받침)+었 = 이중과거 흔적. 어간이 원래 ㅆ받침인 있/없은 단순 과거라 제외 */
function doublePastAt(line) {
  for (let i = 0; i + 1 < line.length; i++) {
    const c = line[i];
    if (line[i + 1] === "었" && isHangul(c) && (c.charCodeAt(0) - 0xac00) % 28 === 20
        && c !== "있" && c !== "없") return c + "었";
  }
  return null;
}

function checkTone(file, lines) {
  if (TONE_EXEMPT.test(file.replaceAll("\\", "/"))) return;
  let buf = [];        // 이어지는 본문 줄(문장이 줄 중간에서 끝나는 경우 대비)
  let bufStart = 0;
  const flush = () => {
    if (!buf.length) return;
    const text = buf.join(" ");
    for (const m of text.matchAll(/[^.!?]+[.!?]?/g)) {
      const s = m[0].trim();
      if (!s) continue;
      // 따옴표로 시작하는 문장은 인용 — 원문 유지가 규칙이라 건너뛴다
      if (/^["'“”]/.test(s.replace(/^[*_(]+/, ""))) continue;
      const core = s.replace(/[.!?]+$/, "").replace(/[)\]"'`*_]+$/, "").trim();
      if (!core || POLITE.test(core) || JOSA_TAIL.test(core)) continue;
      // 닫히지 않은 따옴표 안에서 끝나는 문장도 인용 — 기계로 판정하지 않는다
      if (/["“][^"”]*다$/.test(core)) continue;
      // 반말 종결: 한글·영문·숫자·닫는괄호 뒤의 '다' ("500m다" 를 잡기 위해
      // 한글 앞글자를 전제하지 않는다 — 실제로 그 전제 때문에 놓친 적이 있다)
      if (/[가-힣A-Za-z0-9)%\]]다$/.test(core)) add(file, bufStart, "plain-ending", s.slice(0, 60));
    }
    buf = [];
  };
  lines.forEach((line, i) => {
    const st = line.trim();
    const isQuote = st.startsWith(">");
    if (!isQuote && st) {
      const dp = doublePastAt(st);
      if (dp) add(file, i + 1, "double-past", dp);
      const bk = st.match(BROKEN);
      if (bk) add(file, i + 1, "broken-conjugation", bk[1]);
    }
    if (/^\s*\|.*\|\s*$/.test(line)) {              // 표 행 — 셀 어미만 본다
      flush();
      if (!isQuote && CASUAL_CELL.test(line) && !NOUN_YO_CELL.test(line))
        add(file, i + 1, "casual-ending", "표 셀 해요체");
      return;
    }
    if (isQuote || st.startsWith("#") || !st) { flush(); if (isQuote) return; }
    if (!isQuote && st && CASUAL_END.test(st) && !NOUN_YO_END.test(st))
      add(file, i + 1, "casual-ending", st.slice(-30));
    if (st && !st.startsWith("#")) {
      if (!buf.length) bufStart = i + 1;
      buf.push(st.replace(/^[-*+]\s+|^\d+\.\s+/, ""));
    }
  });
  flush();
}

for (const file of gitDocs() ?? walk(ROOT)) {
  const raw = readFileSync(file, "utf8");
  const lines = stripFences(raw);
  const dir = dirname(file);
  let tableRun = 0;

  lines.forEach((line, i) => {
    const n = i + 1;

    // 1) 상대 링크
    for (const m of line.matchAll(/\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
      const target = m[1].split("#")[0].trim();
      if (!target) continue;                                  // 순수 앵커
      if (/^(https?:|mailto:|tel:|data:|#|<)/.test(target)) continue;
      if (!existsSync(normalize(join(dir, decodeURIComponent(target))))) {
        add(file, n, "dead-link", target);
      }
    }

    // 1b) HTML <img src> — README 스크린샷은 대부분 이 형태다.
    //     마크다운 링크만 보면 그림이 통째로 깨져도 못 잡는다.
    for (const m of line.matchAll(/<img\s[^>]*src=["']([^"']+)["']/gi)) {
      const target = m[1].split("#")[0].trim();
      if (!target || /^(https?:|data:|\/\/)/.test(target)) continue;
      if (!existsSync(normalize(join(dir, decodeURIComponent(target))))) {
        add(file, n, "dead-image", target);
      }
    }

    // 2) 백틱으로 인용된 코드 경로
    if (CHECK_PATHS) {
      for (const m of line.matchAll(/`([\w.@/-]+\.(?:ts|tsx|js|jsx|mjs|cjs|py|gd|cs|json|sh))`/g)) {
        const p = m[1];
        if (!p.includes("/")) continue;                       // 파일명만 → 위치 불명, 건너뜀
        if (/^(https?|node_modules|@)/.test(p)) continue;
        const hits = [join(ROOT, p), join(dir, p)];
        if (!hits.some((h) => existsSync(normalize(h)))) {
          add(file, n, "missing-path", p);
        }
      }
    }

    // 3) 헤더 없는 표
    const isRow = /^\s*\|.*\|\s*$/.test(line);
    if (isRow) {
      tableRun++;
      const isSeparator = /^\s*\|[\s:|-]+\|\s*$/.test(line);
      if (tableRun === 2 && !isSeparator) add(file, n - 1, "headless-table", "구분선 없는 표");
    } else {
      tableRun = 0;
    }
  });

  // 4) 톤 — 사람이 읽는 문서의 어미
  checkTone(file, lines);
}

/* ── 5) README 한/영 동기 ─────────────────────────────────────────
 * STYLE.md '한 / 영 버전': README 를 고치면 README.en.md 도 같은 커밋에서 고친다.
 * 규약만 있고 검사가 없어 한쪽만 고친 채 커밋되는 것을 막지 못했습니다.
 * 비교는 git 로그 시각으로 합니다 — 파일 mtime 은 clone 하면 전부 같아집니다.
 */
{
  const lastCommit = f => {
    const r = spawnSync("git", ["log", "-1", "--format=%ct", "--", f], { cwd: ROOT, encoding: "utf8" });
    return Number(r.stdout?.trim() || 0);
  };
  for (const ko of (gitDocs() ?? walk(ROOT)).filter(f => /(^|\/)README\.md$/.test(relative(ROOT, f)))) {
    const en = ko.replace(/README\.md$/, "README.en.md");
    if (!existsSync(en)) continue;
    const koAt = lastCommit(ko), enAt = lastCommit(en);
    if (koAt && enAt && koAt > enAt) {
      const days = Math.round((koAt - enAt) / 86400);
      add(en, 1, "readme-drift", `README.md 가 ${days}일 더 최근입니다 — 같은 커밋에서 함께 고쳐 주세요`);
    }
  }
}

if (problems.length === 0) {
  console.log("✓ 문서 검사 통과 — 죽은 링크 0, 깨진 표 0, 톤 위반 0" + (CHECK_PATHS ? ", 없는 경로 0" : ""));
  process.exit(0);
}

const byKind = {};
for (const p of problems) (byKind[p.kind] ??= []).push(p);
const LABEL = {
  "dead-link": "죽은 링크 — 가리키는 파일이 없다",
  "missing-path": "없는 경로 — 문서가 인용한 파일이 없다",
  "dead-image": "깨진 이미지 — <img src> 가 없는 파일을 가리킨다",
  "headless-table": "깨진 표 — 헤더/구분선이 없어 렌더링이 깨진다",
  "casual-ending": "해요체 — 본문·표 셀은 습니다체/명사형이 규약이다 (STYLE.md)",
  "plain-ending": "반말 종결 — 본문 문장이 '~다'로 끝난다 (STYLE.md)",
  "double-past": "이중과거 — 어미 일괄 전환이 남긴 '~였었/했었' 흔적",
  "broken-conjugation": "오변환 — 어미 전환이 동사 원형을 깨뜨린 형태 (STYLE.md 함정 목록)",
  "readme-drift": "README 한/영 어긋남 — 한쪽만 고친 채 커밋됐다 (STYLE.md '한 / 영 버전')",
};
for (const [kind, items] of Object.entries(byKind)) {
  console.error(`\n[${kind}] ${LABEL[kind]} (${items.length}건)`);
  for (const p of items.slice(0, 40)) console.error(`  ${p.file}:${p.line} → ${p.detail}`);
  if (items.length > 40) console.error(`  … 외 ${items.length - 40}건`);
}
console.error(`\n총 ${problems.length}건.`);
process.exit(1);
