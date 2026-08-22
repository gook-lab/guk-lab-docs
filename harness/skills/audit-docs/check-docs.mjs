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
}

if (problems.length === 0) {
  console.log("✓ 문서 검사 통과 — 죽은 링크 0, 깨진 표 0" + (CHECK_PATHS ? ", 없는 경로 0" : ""));
  process.exit(0);
}

const byKind = {};
for (const p of problems) (byKind[p.kind] ??= []).push(p);
const LABEL = {
  "dead-link": "죽은 링크 — 가리키는 파일이 없다",
  "missing-path": "없는 경로 — 문서가 인용한 파일이 없다",
  "dead-image": "깨진 이미지 — <img src> 가 없는 파일을 가리킨다",
  "headless-table": "깨진 표 — 헤더/구분선이 없어 렌더링이 깨진다",
};
for (const [kind, items] of Object.entries(byKind)) {
  console.error(`\n[${kind}] ${LABEL[kind]} (${items.length}건)`);
  for (const p of items.slice(0, 40)) console.error(`  ${p.file}:${p.line} → ${p.detail}`);
  if (items.length > 40) console.error(`  … 외 ${items.length - 40}건`);
}
console.error(`\n총 ${problems.length}건.`);
process.exit(1);
