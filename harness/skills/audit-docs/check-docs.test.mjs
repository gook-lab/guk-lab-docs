import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cpSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const HERE = dirname(fileURLToPath(import.meta.url));
const CHECKER = resolve(HERE, "check-docs.mjs");

function git(root, args, date) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8", env: {
    ...process.env,
    GIT_AUTHOR_NAME: "Test", GIT_AUTHOR_EMAIL: "test@example.com",
    GIT_COMMITTER_NAME: "Test", GIT_COMMITTER_EMAIL: "test@example.com",
    ...(date ? { GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date } : {}),
  } });
}

function repo() {
  const root = mkdtempSync(join(tmpdir(), "audit-docs-"));
  cpSync(CHECKER, join(root, "check-docs.mjs"));
  writeFileSync(join(root, "README.md"), "# 문서\n\n설명입니다.\n");
  writeFileSync(join(root, "README.en.md"), "# Docs\n\nDescription.\n");
  git(root, ["init", "-q"]);
  git(root, ["add", "."]);
  git(root, ["commit", "-qm", "initial"], "2026-01-01T00:00:00Z");
  writeFileSync(join(root, "README.md"), "# 문서\n\n수정한 설명입니다.\n");
  git(root, ["add", "README.md"]);
  git(root, ["commit", "-qm", "update Korean"], "2026-01-02T00:00:00Z");
  return root;
}

test("한·영 README를 같은 작업에서 수정하면 커밋 전 검사도 통과한다", () => {
  const root = repo();
  writeFileSync(join(root, "README.md"), "# 문서\n\n함께 수정했습니다.\n");
  writeFileSync(join(root, "README.en.md"), "# Docs\n\nUpdated together.\n");
  assert.doesNotThrow(() => execFileSync(process.execPath, [join(root, "check-docs.mjs")], { cwd: root }));
});

test("한국어 README만 더 최신이면 동기화 오류를 보고한다", () => {
  const root = repo();
  assert.throws(
    () => execFileSync(process.execPath, [join(root, "check-docs.mjs")], { cwd: root, stdio: "pipe" }),
    (error) => error.status === 1 && error.stderr.toString().includes("readme-drift"),
  );
});
