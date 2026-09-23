# guk-lab-docs

[한국어](README.md) · [English](README.en.md)

토이 프로젝트 15개를 만들면서 **자꾸 다시 발명하게 되던 패턴들**을 모아둔 곳입니다.
현재 공개한 프로젝트 12개와 포트폴리오의 상태를 manifest 13개로 확인합니다.

프로젝트 문서를 여기로 옮겨오지는 않습니다. 각 프로젝트의 `README.md`·`CLAUDE.md`·
`docs/`는 코드와 함께 변하니까, 코드 옆에 그대로 두는 게 맞습니다. 여기 남기는 건
**여러 프로젝트에서 각자 따로 같은 답에 도달한 것들** — 그래서 다음 프로젝트를
시작할 때 처음부터 다시 겪지 않아도 되는 것들입니다.

## 복사 금지 원칙 — 사유

문서를 허브에 복사해 두면 원본이 바뀌어도 사본은 함께 갱신되지 않습니다. 시간이 지난
뒤에는 어느 문서가 현재 기준인지 판단하기 어려워집니다. 그래서 이 저장소는 문서를
프로젝트가 아니라 **수명**에 따라 나눕니다.

| 수명 | 예 | 사는 곳 |
|---|---|---|
| 코드와 같이 변함 | `ARCHITECTURE.md`, `API.md`, 프로젝트 `CLAUDE.md`, `plans/` | **각 프로젝트 레포** (여기엔 링크만) |
| 프로젝트를 넘어 재사용 | 검증 게이트, 헤드리스 하네스, rules/skills 패턴 | **여기** |
| 끝난 일회성 | 완료된 plan, brainstorm, `TODO_NEXT.md` | 각 레포 `docs/archive/` |

판별 기준은 하나입니다: **그 문서가 특정 레포의 코드를 고쳐야 낡는가?** 그렇다면
그 레포에 있는 게 맞습니다.

## 목차

### 플레이북 — 방법론

| 문서 | 한 줄 |
|---|---|
| [measure-first](playbooks/measure-first.md) | 추측으로 고치지 않기 — 고치기 전에 측정, 잰 숫자는 커밋에 기록 |
| [headless-harness](playbooks/headless-harness.md) | 시뮬레이션과 렌더러의 분리로 얻는 게임 헤드리스 검증 |
| [verification-gate](playbooks/verification-gate.md) | 기존 부채는 베이스라인으로 고정, **늘어난 것만** 실패 처리 |
| [cross-session-collab](playbooks/cross-session-collab.md) | 두 에이전트 세션이 한 레포에서 같이 일하는 법 |
| [publishing](playbooks/publishing.md) | 공개 전 확인 목록 — 상용 에셋·용량·비밀정보 |
| [fe-radio](playbooks/fe-radio.md) | 위 방법론들을 FE RADIO 전략(C → RADIO → V)의 설계 순서로 다시 배치한 지도 |
| [branching](playbooks/branching.md) | main/develop 브랜치 룰베이스 — main 직접 push 차단, prefix 작업 브랜치 |
| [tooling-baseline](playbooks/tooling-baseline.md) | ESLint·Prettier 공용 규약 — 옵션은 실측 채택, 부채는 기록 후 점진 청산 |
| [web-optimization](playbooks/web-optimization.md) | 이미지 WebP·폰트·코드 최적화 룰 — 픽셀아트는 PNG 예외 |
| [ci-security](playbooks/ci-security.md) | CI는 초록 게이트만 + 보안 자동화 4종 — required check로 main과 결속 |
| [frontend-patterns](playbooks/frontend-patterns.md) | 컴포넌트 계층·훅·상태 설계 공용 패턴 — 실무 규칙의 일반화 발췌 |
| [derived-docs](playbooks/derived-docs.md) | 손으로 고치는 표를 파생물로 — append-only 스트림·머지 드라이버·재생성 게이트 |
| [context-budget](playbooks/context-budget.md) | 에이전트 착수 전 읽기량 — 문서 슬라이싱·룰 스코프·처리 티어 |
| [ui-verification](playbooks/ui-verification.md) | 화면이 말해주지 않는 것 — 읽기와 쓰기, 실패를 만들어 밟기 |
| [modul-design-system](playbooks/modul-design-system.md) | MODUL 컴포넌트 소비 규칙 — 진입점·`!` 덮어쓰기·토큰·모션 프리셋·안티패턴 9개 |

### 하네스 — 재사용 자산 카탈로그

| 문서 | 한 줄 |
|---|---|
| [harness/README](harness/README.md) | 프로젝트별 `.claude/` rules·skills·commands 전수 목록 — 새 프로젝트에서 가져다 쓸 자산 색인 |

### 사람이 읽는 문서

| 문서 | 한 줄 |
|---|---|
| [humans/](humans/README.md) | 처음 온 분을 위한 입구 — 투어 · 결정 기록 · 시작하기 |

### 지도

| 문서 | 한 줄 |
|---|---|
| [projects](projects.md) | 로컬 프로젝트와 공개 저장소 — 이름·역할·공개 여부 |
| [repo-names](repo-names.md) | GitHub 레포 이름과 라이선스 배치 |
| `clone-all.sh` | 공개 코드 저장소 12개를 `workspace/`로 클론 (gitignore 대상) |

### 프로젝트 운영 검사

`project-manifests/`는 여러 문서에서 반복되는 저장소·데모·검증 명령을 관리합니다.
다음 명령으로 프로젝트 하나를 진단하거나 등록된 프로젝트를 함께 확인할 수 있습니다.

```bash
node scripts/project-control.mjs audit pig-ma
node scripts/project-control.mjs validate
node scripts/project-control.mjs fleet
node scripts/project-control.mjs context portfolio
node scripts/project-control.mjs sync
node scripts/project-control.mjs verify pig-ma
node scripts/project-control.mjs links
```

`fleet` 결과는 `reports/project-health.md`와 `reports/project-health.json`에 기록됩니다.
포트폴리오와 공개 프로젝트 12개를 등록했으며, 로컬에 있는 저장소는 파일·명령·문서
상태까지 함께 확인합니다. CI는 상태 보고서를 14일간 보존하고, 매주 월요일 오전
9시(KST)에 공개 저장소와 데모 링크를 다시 확인합니다.

## 이 저장소의 규칙

- **근거 없는 문장은 쓰지 않습니다.** 수치를 적을 땐 언제 잰 건지도 같이 적습니다.
- 현재 기준과 맞지 않는 문서는 삭제하거나 보관 상태를 표시합니다.
- 프로젝트 문서를 인용할 땐 복사하지 않고 **경로로 가리킵니다**.
- 글의 목소리는 [STYLE.md](STYLE.md)를 따릅니다 — 정중하되 딱딱하지 않게.

## 프로젝트 회고

문서를 많이 작성하는 것보다 정보가 어디에서 관리되고, 필요한 순간에 어떻게 발견되는지가 더 중요했습니다. 프로젝트별 문서와 여러 저장소가 함께 참고하는 기준을 나누면서 복사본을 줄이고 원본의 위치를 분명히 할 수 있었습니다.

문서도 코드처럼 변경에 따라 낡습니다. 수치와 목록은 메타데이터에서 만들고 결과의 차이를 CI에서 확인하도록 바꾸면서 문서 갱신도 검증 가능한 작업이 되었습니다. 앞으로는 문서의 양보다 탐색 경로와 갱신 기준을 먼저 설계하려 합니다.

## 라이선스

이 저장소의 글은 **CC BY-NC 4.0**입니다 — 출처를 밝히면 공유·변형할 수 있고,
상업적 이용만 안 됩니다. 전문은 [LICENSE](LICENSE)에 있습니다.

여기서 가리키는 프로젝트 레포들은 **각자의 LICENSE를 따릅니다** — 대부분
source-available(무단 사용 금지)이고, `pig-ma`만 MIT입니다.
