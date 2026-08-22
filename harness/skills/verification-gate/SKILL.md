---
name: verification-gate
description: Put a gate on a codebase that already has hundreds of pre-existing lint or type violations, by freezing per-file counts as a baseline and failing only files that got worse. Use when a linter or type checker has never been run on a repo, or when a check cannot be turned on because the existing debt is too large.
---

# 부채 위에 게이트 세우기

린터를 한 번도 안 돌린 레포에 `eslint .` 를 CI 게이트로 붙이면 **아무것도
통과하지 못한다.** 그렇다고 미루면 새 위반이 계속 섞인다.

→ **파일별 위반 수를 베이스라인으로 고정하고, 늘어난 파일만 실패시킨다.**

## 이게 왜 필요한지

`pig` 에서 실측한 부채 (2026-08-19):

| 검사 | 처음 | 원인 |
|---|---|---|
| `tsc --noEmit` | **523건** | 한 번도 안 돌림 |
| `eslint .` | **264건** (`rules-of-hooks` 145건 포함) | 한 번도 안 돌림 |

코드 품질 문제가 아니라 **파이프라인 구멍**이다. 게이트가 없으면 부채는 반드시 쌓인다.

## 먼저 가른다 — 전량 청산 vs 베이스라인

| | 전량 청산 | 베이스라인 고정 |
|---|---|---|
| 언제 | 기계적으로 안전하게 고칠 수 있을 때 | 케이스별 판단이 필요할 때 |
| 예 | `noUncheckedIndexedAccess` 타입 내로잉 523건 → 0건 | `set-state-in-effect` · `exhaustive-deps` |

이걸 안 가르면 **"언젠가 다 고치면 게이트 세우자"** 에 갇힌다.

린트 안에서도 다시 가른다. `rules-of-hooks` 145건은 전부 "훅 호출 전 early
return" 이라는 **실제 버그 클래스**여서 전량 청산했다. 나머지는 일괄 수정하면
동작이 바뀔 수 있어 베이스라인에 넣었다.

## 게이트 동작

1. 검사 도구를 JSON 리포터로 돌려 **파일별 위반 수**를 센다
2. `baseline.json` 과 비교한다
3. **늘어난 파일이 있으면** 파일명과 증가분을 찍고 exit 1
4. **줄었으면** 통과시키되 `--update` 하라고 안내한다
5. `--update` 는 현재 수치를 베이스라인으로 다시 쓴다

4번이 핵심이다. 베이스라인은 **내려가는 쪽으로만** 움직인다 — 올라가는 경로가
없으니 부채가 되돌아올 수 없다.

**합계가 아니라 파일별로 센다.** 합계로 세면 A 를 3건 고치고 B 에 3건 넣어도
통과한다.

## 반드시 깨뜨려 보고 커밋한다

```
# 잡는가 — 미사용 변수를 일부러 주입
src/utils/uuid.ts: 0 → 1 (+1)      exit 1  ✓
# 되돌리면 통과하는가                exit 0  ✓
# 줄었을 때 개선 경로로 빠지는가      "3건 줄었습니다 … --update 하세요"  ✓
```

**통과만 확인하고 커밋하면 아무것도 안 잡는 게이트를 세워 놓고 안심하게 된다.**

## 점진 청산 방침

별도의 대규모 청산 작업을 **잡지 않는다.** 도메인 작업으로 파일을 건드릴 때 그
파일의 기존 위반도 같이 정리하고 `--update` 로 베이스라인을 낮춘다.

## 함정 둘

**파이프가 종료코드를 삼킨다.**
```bash
npm run lint:gate | tail    # $? 는 tail 의 코드 — 실패가 0으로 보인다
```

**설정을 약화시켜 통과시키지 않는다.** 게이트를 세우는 것과 낮추는 것은 반대
방향의 일이다. 규칙을 끄고 싶어지면 보통 그 규칙이 옳다는 신호다.
`pig` 에는 `eslint.config.js` 수정을 막는 훅이 걸려 있다.

## 옮겨 붙이기

ESLint 전용이 아니다. **파일별로 수를 셀 수 있는 검사면 뭐든** 같은 틀이 먹는다 —
타입 에러, 접근성 위반, TODO 주석 수, 번들 크기. 필요한 건 `{파일: 개수}` JSON
하나와 "늘어난 것만 실패" 규칙뿐이다.

참고 구현: `pig/scripts/lint-gate.js` · 배경은
[verification-gate 플레이북](../../../playbooks/verification-gate.md).
