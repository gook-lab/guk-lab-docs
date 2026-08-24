# 공용 툴링 베이스라인 — ESLint · Prettier

토이 레포 9개에 공통으로 배선한 lint/포맷 규약입니다 (2026-08-24 적용).
템플릿 원본은 [`harness/templates/`](../harness/templates/)에 있습니다.

## 구성

| 항목 | 표준 |
|---|---|
| ESLint | v9 flat config. TS+React 레포는 `@eslint/js` + `typescript-eslint` + `react-hooks` + `react-refresh`, 순수 JS 레포는 `@eslint/js` recommended |
| Prettier | 옵션 2안 중 **실측으로 채택** (아래 규칙) + Tailwind 레포는 `prettier-plugin-tailwindcss` |
| scripts | `lint` = `eslint .` · `format` = `prettier --write .` · `format:check` = `prettier --check .` |

## Prettier 옵션은 실측으로 정합니다

옵션을 취향으로 정하면 기존 코드 전체가 diff로 물듭니다. 그래서 두 후보를
`prettier --check` 위반 파일 수로 비교해 **적은 쪽**을 채택했습니다:

- **A안** — tabWidth 2 · semi · trailingComma all · printWidth 80 ·
  arrowParens avoid · singleQuote ([templates/prettierrc.a.json](../harness/templates/prettierrc.a.json))
- **B안** — Prettier 기본값 (+플러그인만) ([templates/prettierrc.b.json](../harness/templates/prettierrc.b.json))

예: couple-app은 A안 111 vs B안 104로 B안을 채택했습니다. 이미 설정이
있던 레포(nihongo·3d-map = A안, pig = B안)는 현행을 유지했습니다.

## 부채는 리포맷하지 않고 기록합니다

배선하면서 **전면 리포맷은 하지 않았습니다** — 히스토리 전체가 포맷 커밋으로
덮이면 blame이 죽습니다. 부채는 수치로 고정해 두고,
[verification-gate](verification-gate.md)의 점진 청산 방침대로 파일을 건드릴 때
같이 갚습니다.

적용 현황 (2026-08-24 실측):

| 레포 | ESLint 부채 | format:check 부채 | Prettier | 검증 |
|---|---|---|---|---|
| pig | lint-gate 운영 중 (베이스라인 106) | 23파일 | B안 | typecheck 0 유지 |
| saju | 3건 | 52파일 | A안 | typecheck 통과 |
| stock-analysis | 82건 (71 err) | 97파일 | A안 | `pnpm validate` 전부 통과 |
| dragon-game | 125건 (37 err) | 97파일 | A안/B안 실측 채택 | Vitest 402 통과 |
| game | 340건 (290 err) | 86파일 | 실측 채택 | Vitest 282 통과 |
| nihongo-app | 기존 lint 운영 | 190파일 | A안(기존 유지) | build 통과 |
| couple-app | 기존 3건 유지 | 104파일 | B안 (111 vs 104) | lint:gate 통과 |
| 3d-map | 기존 lint 운영 | 35파일 | A안(기존 유지) | — |
| rhythm-godot | 해당 없음 (GDScript) | — | — | — |

## 새 프로젝트에 붙일 때

1. `harness/templates/`에서 스택에 맞는 eslint config를 복사합니다
   (`eslint.config.react-ts.js` 또는 `eslint.config.plain-js.js`).
2. Prettier는 A/B 두 안을 `--check`로 재보고 위반이 적은 쪽을 채택합니다.
3. scripts 3종(lint/format/format:check)을 추가하고, 첫 실행의 부채 수를
   README나 CLAUDE.md에 기록합니다.
4. 부채가 크면 [verification-gate](verification-gate.md) 방식(파일별
   베이스라인)으로 게이트만 먼저 세웁니다.
