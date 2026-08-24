# guk-lab-docs

토이 프로젝트 15개를 만들면서 **자꾸 다시 발명하게 되던 패턴들**을 모아둔 곳이에요.

프로젝트 문서를 여기로 옮겨오지는 않아요. 각 프로젝트의 `README.md`·`CLAUDE.md`·
`docs/`는 코드와 함께 변하니까, 코드 옆에 그대로 두는 게 맞더라고요. 여기 남기는 건
**여러 프로젝트에서 각자 따로 같은 답에 도달한 것들** — 그래서 다음 프로젝트를
시작할 때 처음부터 다시 겪지 않아도 되는 것들이에요.

## 왜 복사하지 않냐면요

문서 허브가 죽는 방식은 늘 비슷해요. 전부 복사해 넣는다 → 원본이 바뀐다 → 사본은
안 바뀐다 → 6개월 뒤에 허브를 읽은 사람이 **틀린 버전을 믿는다**. 이 시점부터
허브는 없느니만 못하죠. 그래서 여기서는 문서를 프로젝트가 아니라 **수명**으로
나눠요.

| 수명 | 예 | 사는 곳 |
|---|---|---|
| 코드와 같이 변함 | `ARCHITECTURE.md`, `API.md`, 프로젝트 `CLAUDE.md`, `plans/` | **각 프로젝트 레포** (여기엔 링크만) |
| 프로젝트를 넘어 재사용 | 검증 게이트, 헤드리스 하네스, rules/skills 패턴 | **여기** |
| 끝난 일회성 | 완료된 plan, brainstorm, `TODO_NEXT.md` | 각 레포 `docs/archive/` |

판별 기준은 하나예요: **그 문서가 특정 레포의 코드를 고쳐야 낡는가?** 그렇다면
그 레포에 있는 게 맞아요.

## 목차

### 플레이북 — 방법론

| 문서 | 한 줄 |
|---|---|
| [measure-first](playbooks/measure-first.md) | 추측으로 고치지 않기 — 고치기 전에 재고, 잰 숫자를 커밋에 남겨요 |
| [headless-harness](playbooks/headless-harness.md) | 시뮬레이션이 렌더러를 import 하지 않으면 게임을 헤드리스로 검증할 수 있어요 |
| [verification-gate](playbooks/verification-gate.md) | 기존 부채는 베이스라인으로 고정하고 **늘어난 것만** 실패시켜요 |
| [cross-session-collab](playbooks/cross-session-collab.md) | 두 에이전트 세션이 한 레포에서 같이 일하는 법 |
| [publishing](playbooks/publishing.md) | 공개 전에 확인할 것들 — 상용 에셋·용량·비밀정보 |
| [fe-radio](playbooks/fe-radio.md) | 위 방법론들을 FE RADIO 전략(C → RADIO → V)의 설계 순서로 다시 배치한 지도 |

### 하네스 — 재사용 자산 카탈로그

| 문서 | 한 줄 |
|---|---|
| [harness/README](harness/README.md) | 프로젝트별 `.claude/` rules·skills·commands 전수 목록 — 새 프로젝트에서 뭘 가져다 쓸지 찾는 색인이에요 |

### 사람이 읽는 문서

| 문서 | 한 줄 |
|---|---|
| [humans/](humans/README.md) | 처음 온 분을 위한 입구 — 투어 · 결정 기록 · 시작하기 |

### 지도

| 문서 | 한 줄 |
|---|---|
| [projects](projects.md) | 토이 프로젝트 15개 — 무엇인지, 어디 있는지, 공개 가능한지 |
| [repo-names](repo-names.md) | GitHub 레포 이름과 라이선스 배치 |
| `clone-all.sh` | 프로젝트 9개를 `workspace/`로 받아요 (gitignore 되어 있어요) |

## 이 저장소의 규칙

- **근거 없는 문장은 쓰지 않아요.** 수치를 적을 땐 언제 잰 건지도 같이 적어요.
- **낡은 건 지워요.** 추가만 하다 보면 여기도 무덤이 되니까요.
- 프로젝트 문서를 인용할 땐 복사하지 않고 **경로로 가리켜요**.
- 글의 목소리는 [STYLE.md](STYLE.md)를 따라요 — 동료에게 소개하듯, 편하게.

## 라이선스

이 저장소의 글은 **CC BY-NC 4.0**이에요 — 출처를 밝히면 공유·변형할 수 있고,
상업적 이용만 안 돼요. 전문은 [LICENSE](LICENSE)에 있어요.

여기서 가리키는 프로젝트 레포들은 **각자의 LICENSE를 따라요** — 대부분
source-available(무단 사용 금지)이고, `pig-ma`만 MIT예요.
