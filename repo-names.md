# 레포 이름 (확정)

**2026-08-22 확정.** 소유 계정은 `gook-lab`.

디렉토리 이름은 내 컴퓨터에서만 의미가 있다. **레포 이름은 남이 보는 이름**이라
기준이 다르다 — 제품명이 있으면 제품명을 쓰고, 일반명사와 접미사는 버린다.

| 원칙 | |
|---|---|
| 제품명이 있으면 제품명 | `game` → `crypt-survivors` |
| 일반명사 금지 | `game` · `3d-map` · `stock-analysis` 는 검색도 기억도 안 된다 |
| `-app` 접미사는 정보가 0 | `nihongo-app` → `nihongo` |
| 엔진명은 구분이 필요할 때만 | ARPG/JRPG 포크처럼 갈래가 있을 때만 붙인다 |
| 이미 배포된 이름이 있으면 그것 | `pig` → `pig-ma` (npm 패키지명) |

## 확정 — 2026-08-22

| 디렉토리 | → 레포명 | 근거 |
|---|---|---|
| `pig` | **pig-ma** | npm 에 이미 `pig-ma` 로 배포 중 — 이름이 갈리면 안 된다 |
| `game` | **crypt-survivors** | 제품명. `game` 은 레포명으로 최악 |
| `dragon-game` | **dungeon-craft** | 제품명이 던전크래프트다. "dragon" 은 실제 내용과 안 맞음 |
| `stock-analysis` | **pulse-dashboard** | 제품명이 PULSE |
| `saju` | **myeongni-seojae** | 제품명이 명리서재. 짧게 가려면 `saju-seojae` |
| `nihongo-app` | **nihongo** | 접미사 제거 |
| `couple-app` | **couple-map** | 접미사 제거 + 핵심 기능(지도 기록) |
| `3d-map` | **osm-walker** | OSM 을 걸어다닌다는 게 전부. `3d-map` 은 일반명사 |
| `rhythm-godot` | **rhythm-godot** (유지) | Godot 리듬게임 구현 참고 자료로서 엔진명이 검색에 도움 |

### 히스토리 정리 후 (Unity 3종)

| 디렉토리 | → 레포명 |
|---|---|
| `dragon-game-unity` | **dungeon-craft-arpg** |
| `dragon-game-jrpg` | **dungeon-craft-jrpg** |
| `zombie-unity` | **zombie-escape** |

> 셋은 `dungeon-craft` 계열임을 이름으로 드러내는 게 낫다 — 실제로 같은 `Core/`
> 데이터 계층을 공유하고 JS 원본에서 갈라져 나온 포크다.

### 허브

| 디렉토리 | → 레포명 |
|---|---|
| `guk-lab-docs` | **guk-lab-docs** |

## 라이선스 배치

| 레포 | 라이선스 | 이유 |
|---|---|---|
| `pig-ma` | **MIT** | 이미 npm 에 MIT 로 배포됨. 나간 버전의 MIT 는 소급 철회가 안 되고, 라이브러리는 애초에 쓰라고 만든 것이다 |
| `guk-lab-docs` | **CC BY-NC 4.0** | 글이다. 공유되되 되팔리지 않게 |
| 나머지 8개 | **Source-available (all rights reserved)** | 포트폴리오로 보이되 가져다 쓰지는 못하게 |

> 공개 레포에서 **다운로드를 기술적으로 막을 수는 없다.** `allow_forking=false`
> 는 조직 소유 private 레포에서만 되고(2026-08-22 API 실측), public 은 clone ·
> ZIP · raw 읽기가 전부 열려 있다. 보이는 것과 내려받는 것은 git 에서 같은 일이다 —
> 그래서 기술이 아니라 라이선스로 막는다.
