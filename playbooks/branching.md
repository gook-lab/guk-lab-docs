# 브랜치 룰베이스 — main / develop

공개 레포 10개에 공통으로 적용한 브랜치 전략입니다. 실무 프로젝트에서 자리
잡은 워크플로(장수 브랜치 2개 + prefix 작업 브랜치 + 배포처별 release)를
1인 토이 운영에 맞게 줄여서 가져왔습니다. 2026-08-24에 전 레포에 배선했습니다.

## 장수 브랜치

| 브랜치 | 역할 | 보호 |
|---|---|---|
| `main` | 공개 스냅샷 · 릴리스 | **직접 push 차단(관리자 포함)** · PR 필수 · force push/삭제 금지 |
| `develop` | 작업 통합 | 자유 push (1인 운영 — 팀이 되면 여기도 PR로 조입니다) |

- 기본 브랜치는 `main`을 유지합니다 — 방문자가 처음 보는 화면이기 때문입니다.
- 일상 작업은 `develop`에 쌓고, 보여줄 만한 단위가 되면 `develop → main` PR로
  올립니다. **develop이 main보다 앞서 있는 것이 정상 상태입니다.**
- 승인 카운트는 0입니다 — 혼자라서 리뷰어가 없고, PR 강제만으로 "무심코
  main에 push"를 막는 것이 목적입니다. 협업자가 생기면 1로 올립니다.

## 작업 브랜치 prefix

`feature/` `fix/` `chore/` `refactor/` `perf/` `docs/` `ci/`

- 예: `feature/mermaid-import`, `fix/elbow-rigid-move`, `docs/style-guide`
- 티켓/이슈가 있으면 `chore/<이슈번호>/<설명>` 처럼 번호를 끼워 넣습니다.
- 배포처가 갈리는 프로젝트가 생기면 `release/<이름>` 장수 브랜치를 추가합니다
  (실무 워크플로의 배포처별 release 브랜치 패턴).

## 보호 규칙 배선

`gh api`로 한 번에 겁니다 (공개 레포는 무료 플랜에서도 보호 규칙 지원):

```bash
gh api -X PUT "repos/<owner>/<repo>/branches/main/protection" \
  -H "Accept: application/vnd.github+json" \
  --input - <<'JSON'
{"required_status_checks":null,"enforce_admins":true,
 "required_pull_request_reviews":{"required_approving_review_count":0},
 "restrictions":null,"allow_force_pushes":false,"allow_deletions":false}
JSON
```

- `enforce_admins: true`가 핵심입니다 — 이게 없으면 소유자(관리자)는 보호를
  그냥 통과해서, 규칙이 장식이 됩니다.
- 이미 로컬 `main`에 커밋했는데 push가 거절된다면 그게 규칙이 작동하는
  것입니다: `git branch work && git push -u origin work` 후 PR로 올립니다.

## 로컬 가드 — main에서는 커밋 자체가 안 되게

원격 보호는 push 시점에만 걸립니다. 로컬에서 습관적으로 main에 커밋하는 것까지
막으려면 각 레포에 pre-commit 가드를 둡니다 (2026-08-24 전 레포 설치):

```sh
#!/bin/sh
branch="$(git symbolic-ref --short HEAD 2>/dev/null)"
if [ "$branch" = "main" ]; then
  echo "✖ main에서는 직접 커밋할 수 없습니다 — develop/feature 브랜치에서 작업 후 PR로 합치세요" >&2
  exit 1
fi
```

- husky 등으로 `core.hooksPath`가 설정된 레포는 그 경로의 pre-commit 앞부분에
  같은 가드를 끼워 넣습니다.
- `.git/hooks/`는 클론에 따라오지 않으므로, 새 클론에서는 이 블록을 다시
  설치해야 합니다.
- 이 저장소(guk-lab-docs)의 문서 갱신도 예외가 아닙니다 — develop에 커밋하고
  PR로 main에 합칩니다.

## 확인

```bash
gh api repos/<owner>/<repo>/branches/main/protection --jq \
  '{admins: .enforce_admins.enabled, pr: (.required_pull_request_reviews != null)}'
```
