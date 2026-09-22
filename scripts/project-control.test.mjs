import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CLI = resolve(ROOT, "scripts/project-control.mjs");

function run(...args) {
  return execFileSync(process.execPath, [CLI, ...args], { cwd: ROOT, encoding: "utf8" });
}

test("등록한 프로젝트를 도움말에 표시한다", () => {
  const output = run("help");
  assert.match(output, /portfolio/);
  assert.match(output, /pig-ma/);
  assert.match(output, /dungeon-craft/);
});

test("전체 manifest가 스키마 검사를 통과한다", () => {
  assert.match(run("validate"), /manifest 13개 검사 통과/);
});

test("프로젝트 진단 결과를 JSON으로 반환한다", () => {
  const result = JSON.parse(run("audit", "pig-ma"));
  assert.equal(result.id, "pig-ma");
  assert.ok(result.score >= 0 && result.score <= 100);
  assert.ok(result.checks.some((check) => check.label === "저장소 URL"));
});

test("컨텍스트 팩에 문서와 검증 명령을 포함한다", () => {
  const output = run("context", "dungeon-craft");
  assert.match(output, /먼저 읽을 문서/);
  assert.match(output, /npm run test/);
});

test("등록되지 않은 프로젝트는 실패한다", () => {
  assert.throws(() => run("audit", "missing-project"));
});
