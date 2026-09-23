import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CLI = resolve(ROOT, "scripts/project-control.mjs");

function run(...args) {
  return execFileSync(process.execPath, [CLI, ...args], { cwd: ROOT, encoding: "utf8" });
}

function fixture({ manifest, packageJson = { name: "fixture", scripts: {} }, files = {} } = {}) {
  const root = mkdtempSync(join(tmpdir(), "project-control-"));
  mkdirSync(join(root, "scripts"), { recursive: true });
  mkdirSync(join(root, "project-manifests"), { recursive: true });
  mkdirSync(join(root, "fixture-project"), { recursive: true });
  execFileSync("git", ["init", "-q", join(root, "fixture-project")]);
  execFileSync("git", ["-C", join(root, "fixture-project"), "remote", "add", "origin", "https://github.com/gook-lab/fixture.git"]);
  cpSync(CLI, join(root, "scripts/project-control.mjs"));
  writeFileSync(join(root, "projects.md"), "# Projects\n");
  writeFileSync(join(root, "fixture-project/package.json"), JSON.stringify(packageJson));
  for (const [file, content] of Object.entries(files)) {
    mkdirSync(dirname(join(root, "fixture-project", file)), { recursive: true });
    writeFileSync(join(root, "fixture-project", file), content);
  }
  const value = manifest ?? {
    id: "fixture",
    name: "Fixture",
    localPath: "fixture-project",
    repository: "https://github.com/gook-lab/fixture",
    status: "active",
    stack: ["Node.js"],
    commands: {},
    docs: [],
  };
  writeFileSync(join(root, "project-manifests/fixture.project.yml"), JSON.stringify(value));
  return { root, cli: join(root, "scripts/project-control.mjs") };
}

function runFixture(setup, ...args) {
  return execFileSync(process.execPath, [setup.cli, ...args], { cwd: setup.root, encoding: "utf8" });
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
  const setup = fixture();
  const result = JSON.parse(runFixture(setup, "audit", "fixture"));
  assert.equal(result.id, "fixture");
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

test("manifest JSON이 깨지면 파일명을 포함해 실패한다", () => {
  const setup = fixture();
  writeFileSync(join(setup.root, "project-manifests/fixture.project.yml"), "{");
  assert.throws(() => runFixture(setup, "validate"), /YAML 호환 JSON 형식을 읽지 못했습니다/);
});

test("manifest 필드·상태·URL·배열·객체 규칙을 검사한다", () => {
  const setup = fixture({ manifest: {
    id: "fixture", name: "Fixture", localPath: "/absolute", repository: "git@example.com:repo.git",
    status: "unknown", visibility: "secret", stack: [], commands: [], docs: {}, demo: "http://example.com",
  } });
  assert.throws(() => runFixture(setup, "validate"), /manifest 검사 실패/);
});

test("manifest의 필수 필드와 id·저장소 중복을 검사한다", () => {
  const setup = fixture();
  const duplicate = JSON.parse(readFileSync(join(setup.root, "project-manifests/fixture.project.yml"), "utf8"));
  delete duplicate.name;
  writeFileSync(join(setup.root, "project-manifests/duplicate.project.yml"), JSON.stringify(duplicate));
  assert.throws(() => runFixture(setup, "validate"), /id가 중복됩니다/);
  assert.throws(() => runFixture(setup, "validate"), /repository가 중복됩니다/);
  assert.throws(() => runFixture(setup, "validate"), /name 필드가 없습니다/);
});

test("구조화된 명령은 run과 requiredPath를 모두 요구한다", () => {
  const setup = fixture();
  const manifestFile = join(setup.root, "project-manifests/fixture.project.yml");
  const manifest = JSON.parse(readFileSync(manifestFile, "utf8"));
  manifest.commands = { test: { run: "bash test.sh" } };
  writeFileSync(manifestFile, JSON.stringify(manifest));
  assert.throws(() => runFixture(setup, "validate"), /run·requiredPath 객체여야 합니다/);
});

test("로컬 경로가 없으면 경고가 포함된 진단을 반환한다", () => {
  const setup = fixture();
  const manifestFile = join(setup.root, "project-manifests/fixture.project.yml");
  const manifest = JSON.parse(readFileSync(manifestFile, "utf8"));
  manifest.localPath = "missing";
  writeFileSync(manifestFile, JSON.stringify(manifest));
  const result = JSON.parse(runFixture(setup, "audit", "fixture"));
  assert.equal(result.checks[0].status, "WARN");
  assert.equal(result.score, 0);
});

test("fleet은 Markdown과 JSON 상태 보고서를 생성한다", () => {
  const setup = fixture();
  const output = runFixture(setup, "fleet");
  assert.match(output, /프로젝트 상태 리포트/);
  assert.match(readFileSync(join(setup.root, "reports/project-health.md"), "utf8"), /Fixture/);
  assert.equal(JSON.parse(readFileSync(join(setup.root, "reports/project-health.json"))).projects[0].id, "fixture");
});

test("sync는 누락된 저장소와 데모 링크를 경고한다", () => {
  const setup = fixture({ manifest: {
    id: "fixture", name: "Fixture", localPath: "fixture-project",
    repository: "https://github.com/gook-lab/fixture", demo: "https://example.com",
    status: "active", stack: ["Node.js"], commands: {}, docs: [], metadataSources: ["README.md"],
  }, files: { "README.md": "# Fixture\n" } });
  const output = runFixture(setup, "sync", "--report-only");
  assert.match(output, /projects\.md 저장소 링크 누락/);
  assert.match(output, /프로젝트 메타데이터 문서에 데모 링크 누락/);
  assert.notEqual(spawnSync(process.execPath, [setup.cli, "sync"], { cwd: setup.root }).status, 0);
});

test("sync는 manifest와 프로젝트 지도 수를 함께 기록한다", () => {
  const setup = fixture();
  writeFileSync(join(setup.root, "projects.md"), "# Projects\nhttps://github.com/gook-lab/fixture\n");
  const output = runFixture(setup, "sync");
  assert.match(output, /manifest: 1개/);
  assert.match(output, /공개 프로젝트 지도: 1개/);
});

test("sync는 manifest에 없는 프로젝트 지도 항목을 경고한다", () => {
  const setup = fixture();
  writeFileSync(join(setup.root, "projects.md"), "https://github.com/gook-lab/fixture\nhttps://github.com/gook-lab/unregistered\n");
  assert.notEqual(spawnSync(process.execPath, [setup.cli, "sync"], { cwd: setup.root }).status, 0);
});

test("비 Node 명령은 requiredPath로 검증한다", () => {
  const setup = fixture({ manifest: {
    id: "fixture", name: "Fixture", localPath: "fixture-project", kind: "godot",
    repository: "https://github.com/gook-lab/fixture", status: "active", stack: ["Godot"], docs: [],
    commands: { test: { run: "bash tools/run_all_tests.sh", requiredPath: "tools/run_all_tests.sh" } },
  }, files: { "tools/run_all_tests.sh": "#!/bin/sh\n" } });
  const result = JSON.parse(runFixture(setup, "audit", "fixture"));
  assert.equal(result.checks.find((check) => check.label === "명령 · test").status, "PASS");
  assert.equal(result.checks.some((check) => check.label === "package.json"), false);
});

test("비 Node 명령의 requiredPath가 없으면 경고한다", () => {
  const setup = fixture({ manifest: {
    id: "fixture", name: "Fixture", localPath: "fixture-project", kind: "godot",
    repository: "https://github.com/gook-lab/fixture", status: "active", stack: ["Godot"], docs: [],
    commands: { test: { run: "bash tools/missing.sh", requiredPath: "tools/missing.sh" } },
  } });
  const result = JSON.parse(runFixture(setup, "audit", "fixture"));
  assert.equal(result.checks.find((check) => check.label === "명령 · test").status, "WARN");
});

test("깨진 package.json은 파일 없음 경고로 진단한다", () => {
  const setup = fixture();
  writeFileSync(join(setup.root, "fixture-project/package.json"), "{");
  const result = JSON.parse(runFixture(setup, "audit", "fixture"));
  assert.equal(result.checks.find((check) => check.label === "package.json").status, "WARN");
});

test("verify는 실패한 명령에서 멈추고 결과를 저장한다", () => {
  const setup = fixture({ manifest: {
    id: "fixture", name: "Fixture", localPath: "fixture-project",
    repository: "https://github.com/gook-lab/fixture", status: "active", stack: ["Node.js"], docs: [],
    commands: { lint: "node -e \"process.exit(0)\"", test: "node -e \"process.exit(2)\"", build: "node -e \"process.exit(0)\"" },
  } });
  const report = JSON.parse(runFixture(setup, "verify", "fixture"));
  assert.deepEqual(report.results.map(({ status }) => status), ["PASS", "FAIL"]);
  assert.equal(JSON.parse(readFileSync(join(setup.root, "reports/verification-fixture.json"))).results.length, 2);
});

test("verify는 로컬 프로젝트가 없으면 실행 전에 실패한다", () => {
  const setup = fixture();
  const manifestFile = join(setup.root, "project-manifests/fixture.project.yml");
  const manifest = JSON.parse(readFileSync(manifestFile, "utf8"));
  manifest.localPath = "missing";
  writeFileSync(manifestFile, JSON.stringify(manifest));
  assert.throws(() => runFixture(setup, "verify", "fixture"), /로컬 프로젝트가 없습니다/);
});

test("incident와 readiness는 실행 가능한 체크리스트를 반환한다", () => {
  const setup = fixture();
  assert.match(runFixture(setup, "incident", "fixture", "저장", "실패"), /^# 저장 실패/m);
  assert.match(runFixture(setup, "incident", "fixture"), /^# 오류 재현/m);
  assert.match(runFixture(setup, "readiness", "fixture"), /자동 진단 점수/);
});

test("links는 성공·HTTP 실패·네트워크 오류를 재시도하고 실패 코드로 종료한다", () => {
  const setup = fixture({ manifest: {
    id: "fixture", name: "Fixture", localPath: "fixture-project",
    repository: "https://github.com/gook-lab/fixture", demo: "https://demo.example.com",
    status: "active", stack: ["Node.js"], commands: {}, docs: [],
  } });
  writeFileSync(join(setup.root, "project-manifests/offline.project.yml"), JSON.stringify({
    id: "offline", name: "Offline", localPath: "fixture-project", visibility: "private",
    repository: "https://github.com/gook-lab/offline", demo: "https://offline.example.com",
    status: "maintenance", stack: ["Node.js"], commands: {}, docs: [],
  }));
  const preload = join(setup.root, "fetch-mock.mjs");
  writeFileSync(preload, `globalThis.fetch = async (url) => {
    if (String(url).includes("github")) return { status: 200, ok: true, url: String(url) + "/final" };
    if (String(url).includes("demo")) return { status: 503, ok: false, url: String(url) };
    throw Object.assign(new Error("offline"), { name: "NetworkError" });
  };`);
  const execution = spawnSync(process.execPath, ["--import", preload, setup.cli, "links"], {
    cwd: setup.root,
    encoding: "utf8",
    env: { ...process.env, PROJECT_CONTROL_LINK_RETRY_MS: "0" },
  });
  const results = JSON.parse(execution.stdout);
  assert.notEqual(execution.status, 0);
  assert.equal(results[0].ok, true);
  assert.equal(results[1].status, 503);
  assert.equal(results[1].attempts, 3);
  assert.equal(results[2].error, "NetworkError");
  assert.equal(results[2].attempts, 3);
  assert.equal(JSON.parse(readFileSync(join(setup.root, "reports/external-links.json"))).results.length, 3);
});

test("links --report-only는 실패 링크를 기록해도 성공 코드로 종료한다", () => {
  const setup = fixture();
  const preload = join(setup.root, "fetch-mock.mjs");
  writeFileSync(preload, "globalThis.fetch = async (url) => ({ status: 404, ok: false, url: String(url) });");
  const execution = spawnSync(process.execPath, ["--import", preload, setup.cli, "links", "--report-only"], {
    cwd: setup.root,
    encoding: "utf8",
    env: { ...process.env, PROJECT_CONTROL_LINK_RETRY_MS: "0" },
  });
  assert.equal(execution.status, 0);
  assert.equal(JSON.parse(execution.stdout)[0].attempts, 1);
});

test("links는 일시적인 서버 오류가 회복되면 성공으로 기록한다", () => {
  const setup = fixture();
  const preload = join(setup.root, "fetch-mock.mjs");
  writeFileSync(preload, `let calls = 0;
globalThis.fetch = async (url) => {
  calls += 1;
  return calls < 3
    ? { status: 503, ok: false, url: String(url) }
    : { status: 200, ok: true, url: String(url) };
};`);
  const output = execFileSync(process.execPath, ["--import", preload, setup.cli, "links"], {
    cwd: setup.root,
    encoding: "utf8",
    env: { ...process.env, PROJECT_CONTROL_LINK_RETRY_MS: "0" },
  });
  const [result] = JSON.parse(output);
  assert.equal(result.ok, true);
  assert.equal(result.attempts, 3);
});
