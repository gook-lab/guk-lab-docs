# guk-lab-docs

이 저장소의 모든 문서는 [STYLE.md](STYLE.md)의 톤앤매너를 따른다.

- 문서를 새로 쓰거나 수정하기 전에 STYLE.md를 먼저 읽을 것.
- 본문은 습니다체("~했습니다/~입니다"). 표 셀·제목·에이전트
  지시문(`harness/skills/*/SKILL.md`)은 간결체 유지. 세부 기준은 STYLE.md.
- 헤딩은 기술 명사구("설계 대상 — 방식/결정")로 쓴다. 구호·은유·질문형
  헤딩 금지 — 좋은 구호는 본문 첫 문장으로 내린다. (STYLE.md '헤딩' 절)
- 톤을 고칠 때도 수치·날짜·측정 시점·경로·링크 등 근거는 절대 바꾸지 않는다.
- README를 고치면 README.en.md도 같은 커밋에서 고친다.
- 문서 수정 후에는 `node harness/skills/audit-docs/check-docs.mjs` 로 링크를
  검사한다.

## UI 컴포넌트 — MODUL 우선

guk-lab 프로젝트의 React 화면에 일반 UI 컴포넌트가 필요하면 새로 만들기 전에
MODUL 을 먼저 본다. 소비 규칙은
[playbooks/modul-design-system.md](playbooks/modul-design-system.md) 에 있고,
에이전트가 매 세션 읽는 요약은 `~/.claude/rules/modul-design-system.md` 다.

- 레포 https://github.com/gook-lab/modul · 로컬 `~/sonix/toy/design-system/modul`
- 도메인 어휘가 들어간 컴포넌트는 코어에 올리지 않는다 — 위스키 앱 전용은
  `@gook-lab/malt-ui` 에 있다.
- 기존 앱을 옮길 때는 `modul/docs/migration-bottling.md` 의 순서를 따른다.
