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
| `casual-ending` | 본문·표 셀의 해요체(`…해요` / `…잡아요 \|`). STYLE.md 톤 규약 위반 |
| `plain-ending` | 본문 문장이 반말 `~다` 로 끝난다. 문장 단위로 검사해 줄 중간 종결("반경 500m다. 그리고…")도 잡는다 |
| `double-past` | `~였었습니다/~했었습니다` — 과거의 어미 일괄 전환이 남긴 이중과거 (있다/없다는 예외) |
| `readme-drift` | `README.md` 만 고치고 `README.en.md` 를 두고 왔다. STYLE.md 는 같은 커밋에서 함께 고치라고 정해 두었지만 검사가 없어 한쪽만 커밋되는 것을 막지 못했다. git 로그 시각으로 비교한다 — 파일 mtime 은 clone 하면 전부 같아진다 |
| `broken-conjugation` | `킵니다·잠습니다·이예요` 등 어미 전환이 동사 원형을 깨뜨린 형태 (STYLE.md 함정 목록) |

톤 검출 4종은 **사람이 읽는 문서만** 본다 — `CLAUDE.md`·`PROMPT.md`·`skills/`·
`commands/` 는 간결체가 규약이라 제외하고, `STYLE.md` 는 위반 예시를 본문에
인용하므로 제외한다. 인용(`>` 블록, 따옴표로 시작하거나 따옴표 안에서 끝나는
문장)과 STYLE.md 가 허용한 `~해 주세요` 권유형, `필요/개요` 류 명사도 걸지
않는다. `돕니다` 는 함정 목록에 있지만 돌다의 정상 활용이기도 해서(예: "코드가
처음 돕니다") 기계 검출에서 뺐다 — 사람이 봐야 한다.

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
각각 고의로 깨뜨려 exit 1 을 확인한 뒤에 배포했다. 톤 검출 4종(2026-09-01
추가)도 같은 방식으로 검증했다 — 4종 위반을 심은 픽스처에서 6건 검출·exit 1,
예외 케이스(지킵니다·주세요·있었습니다·인용문·CLAUDE.md)만 담은 픽스처에서 0건.
