# CI · 시큐리티 배선

공개 레포 11개의 CI와 보안 설정 현황입니다 (2026-08-25 점검·적용).

## CI — 초록인 게이트만 싣습니다

원칙: **CI에는 이미 통과하는 게이트만 올립니다.** 부채가 있는 검사
(예: `format:check`)를 그대로 올리면 모든 PR이 빨갛게 되어 CI가 장식이
됩니다 — 부채 검사는 [verification-gate](verification-gate.md) 방식으로
베이스라인을 깔고 나서 올립니다.

| 레포 | CI 게이트 | 최근 상태 (2026-08-25) |
|---|---|---|
| guk-lab-docs | 문서 링크 검사 + 스킬 설치 dry-run | ✅ |
| pig-ma | typecheck · lint:gate · vitest · build | ✅ |
| myeongri-seojae | typecheck · build · vitest · Playwright e2e | ✅ |
| stock-pulse | test · build | ✅ |
| dungeon-craft | vitest · build · 밸런스 하네스 | ✅ |
| crypt-survivors | test · build · 밸런스 하네스(3시드) | ✅ |
| nihongo | lint:gate · test · build | ✅ |
| couple-map | lint:gate · test · build | ✅ |
| osm-walker | lint · test · build | ✅ |
| rhythm-godot | **CI 없음 — 의도적** | — |
| roomcast | 구현 진행 중 — 담당 세션이 배선 예정 | — |

- **rhythm-godot을 CI에서 뺀 이유**: 통합 씬 검증은 `--audio-driver
  CoreAudio`(macOS)가 필수입니다. 리눅스 러너의 Dummy 드라이버는 -4%
  드리프트가 생겨 측정 자체가 무의미해집니다
  ([headless-harness](headless-harness.md)). 의미 없는 초록불을 걸어두는
  것보다 뺀 사실을 기록하는 쪽을 택했습니다.
- **CI 통과는 main 머지의 필수 조건입니다** — 브랜치 보호의
  required status check로 job 이름(`ci`/`gate`/`docs`)을 걸어뒀습니다.
  [branching](branching.md)의 보호 규칙과 한 세트입니다.
- 비용: GitHub Actions는 **공개 레포 무료·무제한**입니다 (분 제한은
  프라이빗에만 적용 — Free 플랜 월 2,000분).

## 보안 — 자동화 4종 (전 레포 적용)

| 항목 | 내용 |
|---|---|
| Secret scanning | 공개 레포 기본 활성 + **push protection** 추가 — 키가 섞인 push를 서버가 거절합니다 |
| Dependabot 취약점 알림 | 의존성 취약점 공지 수신 |
| 자동 보안 픽스 | 취약점 패치 PR 자동 생성 (버전 범프 PR은 노이즈라 켜지 않았습니다) |
| CodeQL | 기본 설정(default setup)으로 JS/TS 정적 분석 스캔 |

## 시큐어 코딩 규칙 (레포 공통)

- **키는 코드에 넣지 않습니다** — `.env` + `.env.example`, gitignore 필수.
  이미 커밋된 키는 삭제가 아니라 **폐기·재발급**입니다
  ([publishing](publishing.md) §4).
- **외부 입력은 문 앞에서 검증합니다** — 파싱 단계 Zod 검증, 같은 데이터가
  다른 문으로 들어오면 같은 검사
  ([기술 선택 기록](../humans/decisions.md)).
- **브라우저는 외부 API에 직결하지 않습니다** — 키·레이트리밋은 서버 프록시
  책임 (stock-pulse 불변식).
- `dangerouslySetInnerHTML`·`eval`류는 각 레포 룰에서 금지하고, 예외는
  근거와 함께 기록합니다.

## 새 레포에 붙일 때

1. CI: 그 레포에서 **이미 초록인** 검증 커맨드만 골라 워크플로를 만듭니다.
2. 보호 규칙에 job 이름을 required check로 추가합니다
   ([branching](branching.md)의 gh api 스니펫에 `required_status_checks`만
   채우면 됩니다).
3. 보안 4종은 `gh api`로 켭니다 — push protection / vulnerability-alerts /
   automated-security-fixes / code-scanning default-setup.
