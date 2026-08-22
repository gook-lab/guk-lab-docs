#!/usr/bin/env bash
# 이 저장소의 스킬을 사용자 레벨(~/.claude/skills/)에 설치한다.
#
# 왜 각 레포에 복사하지 않는가 —
#   스킬을 10개 레포에 복사하면 원본이 바뀔 때 사본은 안 바뀌고, 결국
#   "어느 게 맞는 버전인지 모르는" 상태가 된다. 사용자 레벨에 한 벌만 두면
#   모든 프로젝트에서 쓰이면서 갱신 지점도 하나다.
#
#   사용: ./install-skills.sh [--dry-run]

set -euo pipefail
SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")/skills" && pwd)"
DEST="${HOME}/.claude/skills"
DRY=${1:-}

mkdir -p "$DEST"
for dir in "$SRC"/*/; do
  name="$(basename "$dir")"
  if [ "$DRY" = "--dry-run" ]; then
    echo "  [dry] $name → $DEST/$name"
    continue
  fi
  rm -rf "${DEST:?}/$name"
  cp -R "$dir" "$DEST/$name"
  echo "  ✓ $name"
done
echo
echo "설치 위치: $DEST"
echo "정본은 이 저장소다 — 스킬을 고칠 때는 여기서 고치고 다시 설치한다."
