#!/usr/bin/env bash
# 프로젝트 레포를 workspace/ 아래로 받는다.
#
# workspace/ 는 gitignore 된다 — git 레포 안에 git 레포를 그냥 넣으면
# 바깥 레포가 안쪽을 반쯤 추적하다 깨진다. 서브모듈은 버전이 고정되는 대신
# 업데이트마다 허브 커밋이 필요해 번거롭다. 그래서 clone 스크립트를 쓴다.
#
#   ./clone-all.sh            # 없는 것만 clone, 있는 것은 pull
#   ./clone-all.sh --status   # 받지 않고 상태만 본다

set -euo pipefail
OWNER=gook-lab
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WS="$HERE/workspace"

REPOS=(pig-ma crypt-survivors dungeon-craft stock-pulse myeongri-seojae
       nihongo couple-map osm-walker rhythm-godot)

mkdir -p "$WS"

if [ "${1:-}" = "--status" ]; then
  printf "%-18s %-10s %s\n" "레포" "상태" "브랜치/커밋"
  for r in "${REPOS[@]}"; do
    if [ -d "$WS/$r/.git" ]; then
      dirty=$([ -n "$(git -C "$WS/$r" status --porcelain)" ] && echo "변경있음" || echo "깨끗")
      printf "%-18s %-10s %s\n" "$r" "$dirty" "$(git -C "$WS/$r" log -1 --format='%h %s' | cut -c1-52)"
    else
      printf "%-18s %-10s %s\n" "$r" "없음" "-"
    fi
  done
  exit 0
fi

for r in "${REPOS[@]}"; do
  if [ -d "$WS/$r/.git" ]; then
    printf "▸ %-18s pull ... " "$r"
    git -C "$WS/$r" pull --ff-only -q 2>/dev/null && echo "✓" || echo "건너뜀 (로컬 변경이 있거나 분기됨)"
  else
    printf "▸ %-18s clone ... " "$r"
    git clone -q "https://github.com/$OWNER/$r.git" "$WS/$r" && echo "✓"
  fi
done

echo
echo "위치: $WS"
echo "이 폴더는 gitignore 됩니다 — 허브 레포에는 들어가지 않습니다."
