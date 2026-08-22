---
name: audit-docs
description: Check that documentation still matches reality — dead relative links, references to files that no longer exist, and markdown tables with no header row. Use before publishing a repo, after moving or renaming files, and when a README has not been touched in a while.
---

# 문서 감사

문서는 코드가 아니라서 **아무도 컴파일해 주지 않는다.** 파일을 옮기면 링크가
조용히 죽고, 몇 달 뒤 그 문서를 읽은 사람이 없는 파일을 찾아 헤맨다.

이 스킬은 문서의 주장 중 **기계가 확인할 수 있는 것만** 검사한다.

## 언제 쓰나

- 레포를 공개하기 직전
- 파일·디렉토리를 옮기거나 이름을 바꾼 직후
- 오래 손대지 않은 README 를 다시 볼 때
- 문서 정리 작업의 마지막 단계

## 실행

```bash
node path/to/check-docs.mjs           # 링크 + 표 검사
node path/to/check-docs.mjs --paths   # 본문에 인용된 코드 경로까지 (오탐 증가)
```

문제가 있으면 exit 1. `node_modules` · `dist` · `.git` · `Library` · `.godot` 등은
알아서 건너뛴다.

## 무엇을 잡나

| 검출 | 왜 문제인가 |
|---|---|
| `dead-link` | 상대 링크가 없는 파일을 가리킨다. 파일을 옮기면 반드시 생긴다 |
| `missing-path` (`--paths`) | 본문이 인용한 `src/foo.ts` 가 없다. 리팩토링 후 문서만 남은 경우 |
| `headless-table` | 표에 구분선이 없다. **렌더링이 깨져서** 원문에서는 안 보이고 GitHub 에서만 드러난다 |

`headless-table` 은 실제로 `pig/README.md` 에서 걸렸다 — 문서를 옮기면서 표
헤더는 지우고 행만 남겨, GitHub 에서 두 줄이 깨진 채 표시되고 있었다.

## 검사하지 않는 것

- 외부 URL (`http(s)://`) — 네트워크를 타지 않는다. 느리고 불안정하다
- 코드펜스(``` ```) 와 인라인 코드(`` ` ``) 안쪽 — 예시 코드의 경로는 실재하지
  않아도 된다. **이걸 안 걸러서 `DEFS['x'](S)` 를 마크다운 링크로 오인한 적이 있다**
- 문서가 서술하는 **내용의 참/거짓** — 그건 사람이 봐야 한다.
  수치는 [sync-doc-numbers](../sync-doc-numbers/SKILL.md) 로 자동화한다

## 붙일 때

`package.json` 에 넣고 검증 루프에 끼운다:

```json
{ "scripts": { "docs:check": "node scripts/check-docs.mjs" } }
```

> ⚠️ **파이프 뒤에서 종료코드를 읽지 말 것.** `npm run docs:check | tail` 은
> `$?` 가 tail 의 코드라 실패가 0으로 보인다. `set -o pipefail` 을 켜거나
> 파이프 없이 직접 실행한다.

## 새로 검출기를 추가하면

**일부러 깨진 문서를 만들어 잡히는지 확인하고 커밋한다.** 통과만 보고 넘기면
아무것도 안 잡는 검사기를 세워 놓고 안심하게 된다 — 이 스크립트도 두 검출기를
각각 고의로 깨뜨려 exit 1 을 확인한 뒤에 배포했다.
