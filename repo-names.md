# 레포 이름 제안

디렉토리 이름은 내 컴퓨터에서만 의미가 있다. **레포 이름은 남이 보는 이름**이라
기준이 다르다 — 제품명이 있으면 제품명을 쓰고, 일반명사와 접미사는 버린다.

| 원칙 | |
|---|---|
| 제품명이 있으면 제품명 | `game` → `crypt-survivors` |
| 일반명사 금지 | `game` · `3d-map` · `stock-analysis` 는 검색도 기억도 안 된다 |
| `-app` 접미사는 정보가 0 | `nihongo-app` → `nihongo` |
| 엔진명은 구분이 필요할 때만 | ARPG/JRPG 포크처럼 갈래가 있을 때만 붙인다 |
| 이미 배포된 이름이 있으면 그것 | `pig` → `pig-ma` (npm 패키지명) |

## 제안

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
