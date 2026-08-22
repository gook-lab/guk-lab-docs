#!/usr/bin/env bash
# gook-lab 계정으로 토이 프로젝트를 올린다.
#
#   전제: gh auth login 으로 gook-lab 계정이 추가되어 있을 것
#   사용: ./publish.sh            # 실제 실행
#         ./publish.sh --dry-run  # 무엇을 할지만 출력
#
# 각 레포를 public 으로 만들고, main 을 푸시하고, 브랜치 보호를 건다.
# 이미 있는 레포는 건너뛴다 (덮어쓰지 않는다).

set -euo pipefail
OWNER=gook-lab
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DRY=${1:-}

# 디렉토리:레포명 (repo-names.md 확정본)
REPOS=(
  "guk-lab-docs|guk-lab-docs|토이 프로젝트에서 되풀이해 재발명한 패턴 모음 — 플레이북과 하네스 카탈로그"
  "pig|pig-ma|FigJam-style infinite canvas for React — Konva renderer, rich text, connectors, comments"
  "game|crypt-survivors|Vampire Survivors-style auto-battler roguelite in plain JS + PixiJS, with a headless balance harness"
  "dragon-game|dungeon-craft|Dragon Quest-style turn-based RPG in plain ESM + PixiJS — battle resolver is renderer-free and headless-testable"
  "stock-analysis|pulse-dashboard|PULSE — dark trading-terminal dashboard fusing Korean and US market data, with a 3D real-estate site map"
  "saju|myeongni-seojae|명리서재 — 인생을 10년 단위 대운으로 펼쳐 보는 사주 사이트. 생년월일을 서버로 보내지 않는다"
  "nihongo-app|nihongo|Japanese-learning PWA with an SM-2 spaced-repetition core, a mascot companion, and offline audio"
  "couple-app|couple-map|Mobile PWA for couples to pin places on a map and keep a shared timeline, letters and time capsules"
  "3d-map|osm-walker|Walk a chibi character through a low-poly 3D world extruded from real OpenStreetMap data"
  "rhythm-godot|rhythm-godot|One-button rhythm game in Godot 4 — every visual derives from a single audio clock, no tweens"
)

say() { printf '\n\033[1m%s\033[0m\n' "$*"; }
run() { if [ "$DRY" = "--dry-run" ]; then echo "  [dry] $*"; else "$@"; fi; }

# 인증 확인 — gook-lab 계정이 없으면 여기서 멈춘다
if ! gh auth status 2>&1 | grep -q "account $OWNER"; then
  echo "✗ gh 에 '$OWNER' 계정이 없습니다. 먼저 실행하세요:"
  echo "    gh auth login    # $OWNER 계정 선택"
  exit 1
fi

for entry in "${REPOS[@]}"; do
  IFS="|" read -r dir repo desc <<< "$entry"
  path="$ROOT/$dir"
  [ -d "$path/.git" ] || { echo "✗ $dir — git 레포가 아님, 건너뜀"; continue; }

  say "▸ $dir → $OWNER/$repo"

  # 커밋 안 된 변경이 있으면 멈춘다 — 반쪽만 올리는 사고 방지
  if [ -n "$(git -C "$path" status --porcelain)" ]; then
    echo "  ✗ 미커밋 변경이 있습니다. 커밋 후 다시 실행하세요."
    continue
  fi

  if GH_HOST=github.com gh repo view "$OWNER/$repo" >/dev/null 2>&1; then
    echo "  · 레포가 이미 있습니다 — 생성 건너뜀"
  else
    run gh repo create "$OWNER/$repo" --public --description "$desc"
  fi

  run git -C "$path" remote remove origin 2>/dev/null || true
  run git -C "$path" remote add origin "https://github.com/$OWNER/$repo.git"
  run git -C "$path" branch -M main
  run git -C "$path" push -u origin main

  # main 보호.
  #
  # 승인 N건을 요구하면 1인 레포에서는 자기 PR을 자기가 승인 못 해 스스로 잠긴다.
  # 공개 레포는 외부인이 push 자체를 못 하고 fork PR 은 write 권한자만 머지할 수
  # 있으므로, 실제로 필요한 건 '히스토리 보호'다 — force push 와 삭제만 막는다.
  run gh api -X PUT "repos/$OWNER/$repo/branches/main/protection" \
    -H "Accept: application/vnd.github+json" \
    --input - <<'JSON' || echo "  ! 브랜치 보호 실패"
{
  "required_status_checks": null,
  "enforce_admins": false,
  "required_pull_request_reviews": null,
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
JSON
done

say "완료."
