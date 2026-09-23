#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST_DIR = join(ROOT, "project-manifests");
const REPORT_DIR = join(ROOT, "reports");

function loadManifests() {
  return readdirSync(MANIFEST_DIR)
    .filter((file) => file.endsWith(".project.yml"))
    .sort()
    .map((file) => {
      try {
        return { ...JSON.parse(readFileSync(join(MANIFEST_DIR, file), "utf8")), manifestFile: file };
      } catch (error) {
        throw new Error(`${file}: YAML 호환 JSON 형식을 읽지 못했습니다 — ${error.message}`);
      }
    });
}

function validateManifests(manifests) {
  const errors = [];
  const ids = new Set();
  const repositories = new Set();
  const allowedStatuses = new Set(["active", "maintenance", "archived"]);
  for (const manifest of manifests) {
    const at = manifest.manifestFile;
    for (const field of ["id", "name", "localPath", "repository", "status", "stack", "commands", "docs"]) {
      if (manifest[field] === undefined || manifest[field] === "") errors.push(`${at}: ${field} 필드가 없습니다.`);
    }
    if (ids.has(manifest.id)) errors.push(`${at}: id가 중복됩니다 — ${manifest.id}`);
    if (repositories.has(manifest.repository)) errors.push(`${at}: repository가 중복됩니다 — ${manifest.repository}`);
    ids.add(manifest.id);
    repositories.add(manifest.repository);
    if (!allowedStatuses.has(manifest.status)) errors.push(`${at}: 지원하지 않는 status입니다 — ${manifest.status}`);
    if (manifest.visibility && !["public", "private"].includes(manifest.visibility)) errors.push(`${at}: visibility는 public 또는 private이어야 합니다.`);
    if (!/^https:\/\/github\.com\/[^/]+\/[^/]+$/.test(manifest.repository ?? "")) errors.push(`${at}: GitHub 저장소 URL 형식이 아닙니다.`);
    if (manifest.demo && !/^https:\/\//.test(manifest.demo)) errors.push(`${at}: demo는 HTTPS URL이어야 합니다.`);
    if (typeof manifest.localPath !== "string" || manifest.localPath.startsWith("/")) errors.push(`${at}: localPath는 상대 경로여야 합니다.`);
    if (!Array.isArray(manifest.stack) || manifest.stack.length === 0) errors.push(`${at}: stack은 한 개 이상의 항목이 필요합니다.`);
    if (!Array.isArray(manifest.docs)) errors.push(`${at}: docs는 배열이어야 합니다.`);
    if (typeof manifest.commands !== "object" || Array.isArray(manifest.commands)) errors.push(`${at}: commands는 객체여야 합니다.`);
    for (const [name, config] of Object.entries(manifest.commands ?? {})) {
      if (typeof config === "string") continue;
      if (!config || typeof config.run !== "string" || typeof config.requiredPath !== "string") {
        errors.push(`${at}: commands.${name}은 문자열 또는 run·requiredPath 객체여야 합니다.`);
      }
    }
  }
  return errors;
}

function projectRoot(manifest) {
  return resolve(ROOT, manifest.localPath);
}

function git(project, args) {
  try {
    return execFileSync("git", ["-C", project, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
}

function readPackage(project) {
  const file = join(project, "package.json");
  if (!existsSync(file)) return null;
  try { return JSON.parse(readFileSync(file, "utf8")); } catch { return null; }
}

function addCheck(checks, label, ok, detail, weight = 1) {
  checks.push({ label, status: ok ? "PASS" : "WARN", detail, weight });
}

function commandText(config) {
  return typeof config === "string" ? config : config.run;
}

function audit(manifest) {
  const project = projectRoot(manifest);
  const checks = [];
  addCheck(checks, "로컬 경로", existsSync(project), relative(ROOT, project), 2);
  if (!existsSync(project)) return summarize(manifest, checks);

  const kind = manifest.kind ?? "node";
  const pkg = kind === "node" ? readPackage(project) : null;
  if (kind === "node") addCheck(checks, "package.json", Boolean(pkg), pkg ? pkg.name ?? "이름 없음" : "파일 없음", 2);
  const scripts = pkg?.scripts ?? {};
  for (const [name, commandConfig] of Object.entries(manifest.commands ?? {})) {
    const command = commandText(commandConfig);
    const scriptName = command.match(/^npm run ([^ ]+)/)?.[1]
      ?? command.match(/^(?:pnpm|yarn) (?:run )?([^ ]+)/)?.[1];
    const requiredPath = typeof commandConfig === "object" ? commandConfig.requiredPath : null;
    const valid = scriptName ? Boolean(scripts[scriptName]) : requiredPath ? existsSync(join(project, requiredPath)) : false;
    addCheck(checks, `명령 · ${name}`, valid, requiredPath ? `${command} · ${requiredPath}` : command, name === "test" || name === "build" ? 2 : 1);
  }

  for (const doc of manifest.docs ?? []) {
    addCheck(checks, `문서 · ${doc}`, existsSync(join(project, doc)), doc);
  }
  addCheck(checks, "CI", existsSync(join(project, ".github/workflows")), ".github/workflows");
  addCheck(checks, "라이선스", ["LICENSE", "LICENSE.md"].some((file) => existsSync(join(project, file))), "LICENSE 또는 LICENSE.md");

  const remote = git(project, ["remote", "get-url", "origin"]).replace(/\.git$/, "");
  addCheck(checks, "저장소 URL", remote === manifest.repository, remote || "origin 없음", 2);
  const branch = git(project, ["branch", "--show-current"]);
  const dirty = git(project, ["status", "--short"]);
  addCheck(checks, "Git 상태", !dirty, dirty ? "커밋되지 않은 변경 있음" : `${branch || "detached"} · clean`);

  if (manifest.demo) {
    addCheck(checks, "데모 URL", /^https:\/\//.test(manifest.demo), manifest.demo);
  }
  const committedAt = git(project, ["log", "-1", "--format=%cI"]);
  const ageDays = committedAt ? Math.floor((Date.now() - new Date(committedAt).getTime()) / 86_400_000) : null;
  return { ...summarize(manifest, checks), committedAt: committedAt || null, ageDays };
}

function summarize(manifest, checks) {
  const total = checks.reduce((sum, check) => sum + check.weight, 0);
  const passed = checks.filter((check) => check.status === "PASS").reduce((sum, check) => sum + check.weight, 0);
  return { id: manifest.id, name: manifest.name, score: total ? Math.round((passed / total) * 100) : 0, checks };
}

function markdownReport(results) {
  const lines = ["# 프로젝트 상태 리포트", "", `생성 시각: ${new Date().toISOString()}`, "", "| 프로젝트 | 점수 | 경고 |", "|---|---:|---:|"];
  for (const result of results) lines.push(`| ${result.name} | ${result.score} | ${result.checks.filter((c) => c.status === "WARN").length} |`);
  for (const result of results) {
    lines.push("", `## ${result.name} — ${result.score}점`, "", "| 상태 | 검사 | 근거 |", "|---|---|---|");
    for (const check of result.checks) lines.push(`| ${check.status} | ${check.label} | ${String(check.detail).replaceAll("|", "\\|")} |`);
  }
  return `${lines.join("\n")}\n`;
}

function summaryReport(results) {
  const warningProjects = results.filter((result) => result.checks.some((check) => check.status === "WARN"));
  const lines = [
    "## 프로젝트 상태 요약",
    "",
    `- 검사 프로젝트: ${results.length}개`,
    `- 경고 프로젝트: ${warningProjects.length}개`,
    "",
    "| 프로젝트 | 점수 | 경고 |",
    "|---|---:|---:|",
    ...results.map((result) => `| ${result.name} | ${result.score} | ${result.checks.filter((check) => check.status === "WARN").length} |`),
  ];
  if (warningProjects.length) {
    lines.push("", "<details>", "<summary>경고 상세</summary>", "");
    for (const result of warningProjects) {
      lines.push(`### ${result.name}`, "", ...result.checks.filter((check) => check.status === "WARN").map((check) => `- ${check.label}: ${check.detail}`), "");
    }
    lines.push("</details>");
  }
  return `${lines.join("\n")}\n`;
}

function writeReports(results) {
  mkdirSync(REPORT_DIR, { recursive: true });
  writeFileSync(join(REPORT_DIR, "project-health.json"), `${JSON.stringify({ generatedAt: new Date().toISOString(), projects: results }, null, 2)}\n`);
  writeFileSync(join(REPORT_DIR, "project-health.md"), markdownReport(results));
}

function findManifest(manifests, id) {
  const manifest = manifests.find((item) => item.id === id);
  if (!manifest) throw new Error(`프로젝트를 찾지 못했습니다: ${id}`);
  return manifest;
}

function workflowMetadata(manifest) {
  const commands = Object.values(manifest.commands ?? {}).map(commandText);
  const packageManager = commands.some((command) => command.startsWith("pnpm "))
    ? "pnpm"
    : commands.some((command) => command.startsWith("yarn ")) ? "yarn" : "npm";
  return {
    repository: manifest.repository.replace("https://github.com/", ""),
    path: manifest.localPath.replace(/^\.\.\//, ""),
    kind: manifest.kind ?? "node",
    packageManager,
    runtimeVersion: manifest.runtimeVersion ?? "",
  };
}

function contextPack(manifest) {
  const project = projectRoot(manifest);
  const pkg = readPackage(project);
  const result = audit(manifest);
  return `# ${manifest.name} 작업 컨텍스트\n\n` +
    `- 로컬 경로: \`${project}\`\n- 저장소: ${manifest.repository}\n- 상태: ${manifest.status}\n` +
    `${manifest.demo ? `- 데모: ${manifest.demo}\n` : ""}- 기술: ${(manifest.stack ?? []).join(" · ")}\n` +
    `- 현재 브랜치: ${git(project, ["branch", "--show-current"]) || "확인 불가"}\n\n` +
    `## 먼저 읽을 문서\n\n${(manifest.docs ?? []).map((doc) => `- \`${doc}\``).join("\n")}\n\n` +
    `## 검증 명령\n\n${Object.entries(manifest.commands ?? {}).map(([name, command]) => `- ${name}: \`${commandText(command)}\``).join("\n")}\n\n` +
    `## 현재 진단\n\n- 점수: ${result.score}\n${result.checks.filter((c) => c.status === "WARN").map((c) => `- 확인 필요: ${c.label} — ${c.detail}`).join("\n") || "- 확인이 필요한 항목이 없습니다."}\n\n` +
    `## 패키지 스크립트\n\n${Object.keys(pkg?.scripts ?? {}).map((name) => `- \`${name}\``).join("\n") || "- package.json 없음"}\n`;
}

function syncReport(manifests) {
  const projectsDoc = readFileSync(join(ROOT, "projects.md"), "utf8");
  const catalogRepositories = new Set(manifests.filter((item) => item.catalog !== false).map((item) => item.repository));
  const documentedRepositories = new Set(projectsDoc.match(/https:\/\/github\.com\/gook-lab\/[a-z0-9-]+/g) ?? []);
  const missingFromDocument = [...catalogRepositories].filter((repository) => !documentedRepositories.has(repository));
  const missingFromManifests = [...documentedRepositories].filter((repository) => !catalogRepositories.has(repository));
  const portfolioManifest = manifests.find((item) => item.id === "portfolio");
  const portfolioRoot = portfolioManifest ? projectRoot(portfolioManifest) : null;
  const portfolioDocuments = portfolioRoot
    ? (portfolioManifest.portfolioSources ?? [])
        .filter((file) => existsSync(join(portfolioRoot, file)))
        .map((file) => readFileSync(join(portfolioRoot, file), "utf8"))
    : [];
  const lines = [
    "# 프로젝트 정보 동기화 검사",
    "",
    `생성 시각: ${new Date().toISOString()}`,
    "",
    `- manifest: ${manifests.length}개`,
    `- 공개 프로젝트 지도: ${catalogRepositories.size}개`,
    `- 포트폴리오 대표 프로젝트: ${manifests.filter((item) => item.portfolio?.featured).length}개`,
    "",
    "저장소 링크는 프로젝트 지도, 데모 링크는 각 프로젝트 문서, 포트폴리오 링크는 한·영 콘텐츠와 비교했습니다.",
    "",
    "| 프로젝트 | 저장소 | 데모 | 포트폴리오 | 결과 |",
    "|---|---|---|---|---|",
  ];
  let warnings = missingFromDocument.length + missingFromManifests.length;
  for (const manifest of manifests) {
    const localProjectExists = existsSync(projectRoot(manifest));
    const metadata = (manifest.metadataSources ?? ["README.md"])
      .filter((file) => existsSync(join(projectRoot(manifest), file)))
      .map((file) => readFileSync(join(projectRoot(manifest), file), "utf8"))
      .join("\n");
    const repoOk = manifest.catalog === false || projectsDoc.includes(manifest.repository);
    const demoState = !manifest.demo ? "PASS" : !localProjectExists ? "SKIP" : metadata.includes(manifest.demo) ? "PASS" : "WARN";
    const portfolioState = !manifest.portfolio?.featured ? "PASS" : portfolioDocuments.length === 0 ? "SKIP" : portfolioDocuments.every((document) => document.includes(manifest.repository)) ? "PASS" : "WARN";
    const notes = [!repoOk && "projects.md 저장소 링크 누락", demoState === "WARN" && "프로젝트 메타데이터 문서에 데모 링크 누락", portfolioState === "WARN" && "포트폴리오 한·영 링크 누락"].filter(Boolean);
    warnings += notes.length;
    lines.push(`| ${manifest.name} | ${repoOk ? "PASS" : "WARN"} | ${demoState} | ${portfolioState} | ${notes.join(", ") || (demoState === "SKIP" || portfolioState === "SKIP" ? "로컬 저장소가 없어 일부 검사 생략" : "일치")} |`);
  }
  if (missingFromManifests.length) lines.push("", "## manifest에 없는 프로젝트 지도 항목", "", ...missingFromManifests.map((repository) => `- ${repository}`));
  mkdirSync(REPORT_DIR, { recursive: true });
  const output = `${lines.join("\n")}\n`;
  writeFileSync(join(REPORT_DIR, "portfolio-sync.md"), output);
  return { output, warnings };
}

function verify(manifest) {
  const project = projectRoot(manifest);
  if (!existsSync(project)) throw new Error(`로컬 프로젝트가 없습니다: ${project}`);
  const startedAt = new Date().toISOString();
  const results = [];
  for (const [name, commandConfig] of Object.entries(manifest.commands ?? {})) {
    const command = commandText(commandConfig);
    const start = Date.now();
    const run = spawnSync(command, { cwd: project, shell: true, encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
    const output = `${run.stdout ?? ""}\n${run.stderr ?? ""}`.trim();
    results.push({ name, command, status: run.status === 0 ? "PASS" : "FAIL", exitCode: run.status, durationMs: Date.now() - start, outputTail: output.split("\n").slice(-20).join("\n") });
    if (run.status !== 0) break;
  }
  const report = { project: manifest.id, startedAt, finishedAt: new Date().toISOString(), results };
  mkdirSync(REPORT_DIR, { recursive: true });
  writeFileSync(join(REPORT_DIR, `verification-${manifest.id}.json`), `${JSON.stringify(report, null, 2)}\n`);
  return report;
}

function shouldRetryLink(status) {
  return status === 429 || status >= 500;
}

async function fetchLink(target, attempts = 3) {
  const retryDelayMs = Number(process.env.PROJECT_CONTROL_LINK_RETRY_MS ?? 500);
  let result;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);
    try {
      const response = await fetch(target.url, { method: "GET", redirect: "follow", signal: controller.signal, headers: { "user-agent": "guk-lab-project-control/1.0" } });
      result = { ...target, status: response.status, ok: response.ok, finalUrl: response.url, attempts: attempt };
      if (response.ok || !shouldRetryLink(response.status)) return result;
    } catch (error) {
      result = { ...target, status: null, ok: false, error: error.name, attempts: attempt };
    } finally {
      clearTimeout(timer);
    }
    if (attempt < attempts && retryDelayMs > 0) await new Promise((resolveDelay) => setTimeout(resolveDelay, retryDelayMs * attempt));
  }
  return result;
}

async function checkLinks(manifests) {
  const targets = manifests.flatMap((manifest) => [
    ...(manifest.visibility === "private" ? [] : [{ project: manifest.id, kind: "repository", url: manifest.repository }]),
    ...(manifest.demo ? [{ project: manifest.id, kind: "demo", url: manifest.demo }] : []),
  ]);
  const results = new Array(targets.length);
  let nextIndex = 0;
  async function worker() {
    while (nextIndex < targets.length) {
      const index = nextIndex++;
      const target = targets[index];
      results[index] = await fetchLink(target);
    }
  }
  await Promise.all(Array.from({ length: Math.min(5, targets.length) }, () => worker()));
  mkdirSync(REPORT_DIR, { recursive: true });
  writeFileSync(join(REPORT_DIR, "external-links.json"), `${JSON.stringify({ checkedAt: new Date().toISOString(), results }, null, 2)}\n`);
  return results;
}

function incidentTemplate(manifest, title = "오류 재현") {
  return `# ${title}\n\n- 프로젝트: ${manifest.name}\n- 환경:\n- release:\n- route:\n- 발생 시각:\n- Trace ID:\n\n## 개인정보 제거\n\n- [ ] 토큰·쿠키·이메일·사용자 데이터 제거\n\n## 재현 시나리오\n\n- Given:\n- When:\n- Then:\n\n## 테스트 계층\n\n- [ ] Vitest / Testing Library\n- [ ] Playwright\n- [ ] 렌더러 밖 순수 함수\n\n## 검증 기록\n\n- 수정 전 실패:\n- 변경 내용:\n- 수정 후 결과:\n- 역검증 결과:\n- 자동화하지 못한 범위:\n`;
}

function readiness(manifest) {
  const result = audit(manifest);
  const extra = [
    "비밀정보·개인정보가 산출물에 포함되지 않았는가",
    "상용 에셋과 라이선스를 확인했는가",
    "모바일 레이아웃과 키보드 탐색을 확인했는가",
    "404·외부 링크·OG 메타데이터를 확인했는가",
    "배포 뒤 핵심 사용자 경로를 확인했는가",
  ];
  return `# ${manifest.name} 배포 준비\n\n- 자동 진단 점수: ${result.score}\n\n${extra.map((item) => `- [ ] ${item}`).join("\n")}\n\n## 자동 진단 경고\n\n${result.checks.filter((c) => c.status === "WARN").map((c) => `- [ ] ${c.label}: ${c.detail}`).join("\n") || "- 경고 없음"}\n`;
}

const [command = "help", id, ...rest] = process.argv.slice(2);
const manifests = loadManifests();
try {
  if (command === "validate") {
    const errors = validateManifests(manifests);
    if (errors.length) throw new Error(`manifest 검사 실패\n${errors.map((error) => `- ${error}`).join("\n")}`);
    console.log(`manifest ${manifests.length}개 검사 통과`);
  }
  else if (command === "audit") console.log(JSON.stringify(audit(findManifest(manifests, id)), null, 2));
  else if (command === "verify") {
    const report = verify(findManifest(manifests, id));
    console.log(JSON.stringify(report, null, 2));
    if (report.results.some((result) => result.status === "FAIL")) process.exitCode = 1;
  }
  else if (command === "links") {
    const results = await checkLinks(manifests);
    console.log(JSON.stringify(results, null, 2));
    if (results.some((result) => !result.ok) && !process.argv.includes("--report-only")) process.exitCode = 1;
  }
  else if (command === "fleet") { const results = manifests.map(audit); writeReports(results); console.log(markdownReport(results)); }
  else if (command === "summary") { const results = manifests.map(audit); writeReports(results); console.log(summaryReport(results)); }
  else if (command === "workflow") {
    const metadata = workflowMetadata(findManifest(manifests, id));
    for (const [key, value] of Object.entries(metadata)) console.log(`${key}=${value}`);
  }
  else if (command === "context") console.log(contextPack(findManifest(manifests, id)));
  else if (command === "sync") {
    const result = syncReport(manifests);
    console.log(result.output);
    if (result.warnings > 0 && !process.argv.includes("--report-only")) process.exitCode = 1;
  }
  else if (command === "incident") console.log(incidentTemplate(findManifest(manifests, id), rest.join(" ") || "오류 재현"));
  else if (command === "readiness") console.log(readiness(findManifest(manifests, id)));
  else {
    console.log("사용: project-control <validate|audit|verify|links|fleet|summary|workflow|context|sync|incident|readiness> [project-id] [--report-only]");
    console.log(`프로젝트: ${manifests.map((item) => item.id).join(", ")}`);
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
