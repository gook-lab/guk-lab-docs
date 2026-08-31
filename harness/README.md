# 하네스 카탈로그

각 프로젝트 `.claude/` 아래에 쌓인 rules · skills · commands 전수 목록입니다.
**여기로 복사해 오지 않고** 원본 경로를 가리킵니다. 새 프로젝트를 시작할 때
"이런 걸 이미 만들어 뒀나?"를 확인하는 색인입니다.

조사 시점: 2026-08-22.

---

## 이 저장소가 제공하는 스킬

프로젝트를 넘어 쓰이는 것들만 여기서 관리합니다. **각 레포에 복사하지 않습니다** —
사본은 원본이 바뀌어도 안 바뀌어서, 결국 어느 게 맞는지 모르게 되기 때문입니다.

```bash
./install-skills.sh          # ~/.claude/skills/ 에 설치 (모든 프로젝트에서 사용)
./install-skills.sh --dry-run
```

| 스킬 | 하는 일 | 왜 만들었나 |
|---|---|---|
| [audit-docs](skills/audit-docs/SKILL.md) | 죽은 상대 링크·없는 경로·헤더 없는 표 검출. 실행 스크립트 포함 | 하루에 3개 레포를 손으로 고친 경험 |
| [sync-doc-numbers](skills/sync-doc-numbers/SKILL.md) | 문서의 수치를 타이핑 대신 측정으로 채움 | 4개 레포의 테스트 수 기준선이 전부 낡아 있던 문제 |
| [verification-gate](skills/verification-gate/SKILL.md) | 기존 부채를 베이스라인으로 고정, 늘어난 것만 실패 처리 | tsc 523건·eslint 264건이 게이트 없이 쌓인 상황 |
| [doc-screenshots](skills/doc-screenshots/SKILL.md) | README 스크린샷을 테스트와 같은 도구로 촬영 | 9개 중 그림이 있는 레포가 1개뿐이던 상황 |
| [doc-diagrams](skills/doc-diagrams/SKILL.md) | 아키텍처 다이어그램을 pig-ma의 Mermaid import로 작도·캡처 | 4개 레포 이벤트 플로우 도해를 도그푸딩으로 해결 |
| [portfolio-writing](skills/portfolio-writing/SKILL.md) | 실제 근거에서 프로젝트 소개·문제 해결·회고를 쓰고 README·Notion·이력서·웹 문구를 매체별로 변환 | 포트폴리오 전면 수정에서 기능 나열과 추상적인 에이전트 문장을 반복 교정한 경험 |

여섯 모두 **실제로 겪은 문제**에서 나왔습니다. 겪지 않은 문제로 스킬을 만들면
아무도 안 썼습니다.

---

## 템플릿 — 새 프로젝트 시작 세트

[`templates/`](templates/)에 공용 설정 원본을 둡니다. 사용법과 채택 규칙은
[tooling-baseline](../playbooks/tooling-baseline.md) 참고.

| 파일 | 용도 |
|---|---|
| `eslint.config.react-ts.js` | TS + React 레포용 ESLint 9 flat config |
| `eslint.config.plain-js.js` | 순수 JS 레포용 ESLint 9 flat config |
| `prettierrc.a.json` / `prettierrc.b.json` | Prettier 옵션 2안 — 위반 수 실측으로 채택 |

---

## 반복해서 나타난 4가지 꼴

목록을 훑으면 서로 모르는 프로젝트들이 **같은 네 가지 문제**를 각자 풀어놨습니다.
새 프로젝트에서도 십중팔구 이 넷이 나옵니다.

### 1. `scaffold-*` — 한 개념이 여러 파일에 흩어져 있을 때

장비 하나를 추가하는데 정의·전리품표·상점·아이콘·테스트를 다 손대야 하면,
사람은 반드시 하나를 빠뜨립니다. 그 순서를 커맨드로 굳혀두는 것입니다.

| 커맨드 | 프로젝트 | 몇 개 파일을 묶나 |
|---|---|---|
| `scaffold-item` | dragon-game | 장비 정의 · 전리품 · 상점 · 테스트 |
| `scaffold-monster-skill` | dragon-game | 스킬 정의 · 몬스터 배정 · 밸런스 시나리오 |
| `add-achievement` | game | 콘텐츠 · CHECKS · 스냅샷 필드 |
| `wire-title-page` | game | 타이틀 메뉴 배선 6단계 |
| `whitelist-save-flag` | dragon-game | `freshSave()` **와** 마이그레이션 **양쪽** |
| `add-canvas-property` | pig | 타입 · store equality · 옵션바 · 테스트 |

`whitelist-save-flag`와 `add-canvas-property`가 같은 함정을 가리킵니다 —
**세이브/undo 스키마에 필드를 추가하면 등록처가 두 군데 이상**이고, 하나만
넣으면 "저장은 되는데 되돌리면 사라지는" 버그가 됩니다.

### 2. `validate-*` — 타입 시스템이 못 잡는 데이터 제약

콘텐츠가 JSON·객체 리터럴로 가면 컴파일러가 손을 못 댑니다. 그래서 전용 린터를
씁니다.

| 커맨드 | 프로젝트 | 무엇을 잡나 |
|---|---|---|
| `validate-sprite-keys` | game | `weapons.js` ↔ 스프라이트 키 상호참조 |
| `validate-aoe-weapons` | game | radius / aoeKit / impactScale 정합 |
| `validate-zzfx-sounds` | game | ZzFX 파라미터 배열 형식 |
| `audit-projectile-angles` | game | PNG 주축을 PIL PCA 로 재서 설정값과 대조 |
| `map-placement-validator` | dragon-game | 배치한 오브젝트에 실제로 도달 가능한가 |

`audit-projectile-angles`가 특히 좋은 예입니다 — **에셋 자체를 측정해서** 설정과
맞는지 봅니다. 눈으로 보면 "대충 맞는 것 같은데"로 끝날 것을 숫자로 만들어줍니다.

### 3. 하네스가 본 게임과 갈라지지 않게 막는 검사

[헤드리스 하네스](../playbooks/headless-harness.md)의 숨은 실패 모드입니다:
**하네스가 게임의 옛 버전을 시뮬레이션하기 시작하면**, 통과해도 아무 의미가
없는데 아무도 몰랐습니다.

| 커맨드 | 프로젝트 | 무엇을 대조하나 |
|---|---|---|
| `validate-balance-harness` | game | `scripts/balance.js` vs `src/main.js` 의 시스템 팩토리 목록·시그니처 |
| `sync-balance-scenarios` | dragon-game | 하네스 SCENARIOS 의 인카운터 풀·그룹 크기 vs 실제 콘텐츠 |
| `sync-save-schema` | game | 세이브 테스트의 `toEqual` 블록 vs 현재 `fresh()` 스키마 |

**하네스를 만들었으면 하네스의 동기화 검사도 만듭니다.** 이게 없으면 하네스는
조용히 썩습니다.

### 4. `verify-*` — 커밋 직전 게이트, 그리고 "했다는 말"의 검증

| 스킬/커맨드 | 프로젝트 | 하는 일 |
|---|---|---|
| `commit-verify` | dragon-game | Vitest → Vite build 순차 실행 (커밋 전 게이트) |
| `verify-core-build` | dragon-game-unity · -jrpg | JS 콘텐츠 재추출 → 차등 하네스 → **ALL GATES PASS** |
| `verify-agent-output` | dragon-game | **백그라운드 에이전트가 했다고 주장한 작업을 실제 코드와 대조** |

`verify-agent-output`은 여기 목록에서 유일하게 *에이전트 자체*를 겨냥합니다.
"구현했습니다"는 주장이지 증거가 아니라는 전제에서 출발하기 때문입니다 —
[cross-session-collab](../playbooks/cross-session-collab.md)과 같은 뿌리입니다.

---

## 전수 목록

### rules — 코딩 규칙

| 프로젝트 | 개수 | 파일 |
|---|---|---|
| **pig** | 18 | `code-style` `colors` `components` `constants` `editors` `figma` `git` `hooks` `library` `options-bars` `patterns` `shapes` `store` `styling` `testing` `ui-text` `utils` |
| **nihongo-app** | 3 | `design-system` `error-handling` `data-patterns` |
| **game** | 2 | `game-architecture` `game-testing` |
| **couple-app** | 1 | `design-system` |

> `pig/.claude/rules/`가 가장 성숙합니다. React·TS 프로젝트를 새로 시작하면
> 여기부터 복사해서 깎는 게 빠릅니다. 다만 `figma` `shapes` `options-bars`는
> 캔버스 앱 전용입니다.

### skills

| 프로젝트 | 스킬 |
|---|---|
| **rhythm-godot** | `godot-development` · `godot-gdscript-patterns` · `godot-ui` · `godot-asset-generator` — **Godot 프로젝트면 그대로 재사용 가능합니다** (프로젝트 비의존) |
| **dragon-game-unity** | `verify-core-build` · `arpg-iterate`(헤드리스 개발 루프) · `safe-scene-wire-build` · `screenshot-verify-vfx` |
| **dragon-game** | `verify-agent-output` · `map-placement-validator` · `audio-transcode-import` · `balance-check` |
| **dragon-game-jrpg** | `verify-core-build` |
| **zombie-unity** | `unity-build-test` |
| **pig** | `add-canvas-property` |

### commands

| 프로젝트 | 개수 | 목록 |
|---|---|---|
| **game** | 18 | `add-achievement` `animate-weapons` `audit-projectile-angles` `backup-claude` `integrate-enemy-asset` `integrate-pixellab-asset` `probe-monster-balance` `run-qa-snapshot` `sync-save-schema` `tune-autopick` `tune-monster-scaling` `validate-*`(4) `wire-title-page` |
| **dragon-game** | 6 | `commit-verify` `run-qa-snapshot` `scaffold-item` `scaffold-monster-skill` `sync-balance-scenarios` `whitelist-save-flag` |
| **dragon-game-unity** | 1 | `commit-arpg` |
| **pig** | 1 | `quality-check` |

### agents

| 프로젝트 | 에이전트 |
|---|---|
| **pig** | `embed-service-integrator` |

---

## 벤더링 — 여기 없음, 링크만

`nihongo-app/.agents/skills/`에 서드파티 스킬팩 4종(md 108개)이 들어 있습니다:
`vercel-composition-patterns` · `vercel-react-best-practices` ·
`vercel-react-native-skills` · `web-design-guidelines`.
남의 저작물이라 레포에는 올리지 않습니다.
