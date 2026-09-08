# 프로젝트 지도

`~/sonix/toy/` 아래 토이 프로젝트 전수 목록입니다. 각 프로젝트의 상세는 그 레포의
`README.md` / `CLAUDE.md`가 단일 소스라서, **여기에 복제하지 않습니다.**

조사 시점: 2026-09-08. GitHub `gook-lab` 조직과 로컬 디렉터리를 대조했습니다.

## 공개 저장소

| 로컬 디렉터리 | 공개 저장소 | 무엇 | 주요 기술 |
|---|---|---|---|
| `pig` | [pig-ma](https://github.com/gook-lab/pig-ma) | FigJam 스타일 React 무한 캔버스 라이브러리 | React · TypeScript · Konva · Zustand · Tiptap |
| `saju` | [myeongri-seojae](https://github.com/gook-lab/myeongri-seojae) | 대운·오늘·궁합·신년 흐름을 로컬에서 계산하는 명리 서비스 | React 19 · TypeScript · Tailwind CSS · Zustand |
| `stock-analysis` | [stock-pulse](https://github.com/gook-lab/stock-pulse) | 한국·미국 시황과 부동산 단지 정보를 보는 대시보드 | React · TypeScript · Vite · Node 프록시 · KIS SSE |
| `rhythm-godot` | [rhythm-godot](https://github.com/gook-lab/rhythm-godot) | 오디오 클럭을 기준으로 판정하는 원버튼 리듬게임 | Godot · GDScript |
| `dragon-game` | [dungeon-craft](https://github.com/gook-lab/dungeon-craft) | 렌더러와 전투 계산을 분리한 드래곤퀘스트풍 턴제 JRPG | JavaScript · PixiJS · Vite · Vitest |
| `roomcast` | [room-simulator](https://github.com/gook-lab/room-simulator) | 평면도 모델에서 2D 편집 화면과 3D 공간을 만드는 배치 도구 | React · TypeScript · React Three Fiber |
| `design-system/modul` | [modul](https://github.com/gook-lab/modul) | 토큰과 헤드리스 컴포넌트를 공유하는 React 디자인 시스템 | React · TypeScript · Radix · Storybook · Vitest |
| `game` | [crypt-survivors](https://github.com/gook-lab/crypt-survivors) | 렌더러 없이 전투를 재현할 수 있는 불릿헤븐 로그라이트 | JavaScript · PixiJS · Vite · Vitest |
| `nihongo-app` | [nihongo](https://github.com/gook-lab/nihongo) | 간격 반복과 AI 튜터를 결합한 일본어 학습 PWA | React · Vite · Firebase · IndexedDB |
| `couple-app` | [couple-map](https://github.com/gook-lab/couple-map) | 함께 다닌 장소와 기록을 지도에 남기는 커플 PWA | React · Vite · Firebase · Kakao Maps · d3-geo |
| `3d-map` | [osm-walker](https://github.com/gook-lab/osm-walker) | OpenStreetMap 데이터로 만든 3D 공간을 걷는 웹 앱 | React · React Three Fiber · Rapier |
| `water-balloon-arcade` | [water-balloon-arcade](https://github.com/gook-lab/water-balloon-arcade) | React 밖 게임 루프로 동작하는 물풍선 아케이드 | React · Vite · Canvas 2D |

저장소 이름과 로컬 디렉터리가 다른 이유는 [repo-names.md](repo-names.md)에
기록했습니다. 위 12개 저장소는 `clone-all.sh`로 한 번에 받을 수 있습니다.

## 공개하지 않는 것들

**Unity 3종 — 2026-08-22에 제외로 결정했습니다.** 유료 에셋 스토어 패키지가
히스토리에 이미 커밋되어 있고(EULA상 재배포 금지), 실측해 보니 **직접 작성한
코드가 전체의 2% 미만**이라 히스토리 필터링의 실익이 없습니다. 나중에 공개하게
되면 자체 코드만 담은 새 히스토리로 시작하는 편이 맞습니다. 각 레포 README에
근거와 함께 적어뒀습니다.

| 프로젝트 | 자체 코드 / 전체 | 서드파티 팩 | .git |
|---|---|---|---|
| **dragon-game-unity** | 282 / 15,260 (1.8%) | Layer Lab · SpecialSkillsEffectsPack · MagicArsenal · Honeti · Vefects · Spine · Blackthornprod · OctopathSprites 등 20종+ | 1.4 GB |
| **dragon-game-jrpg** | 161 / 17,937 (0.9%) | 위와 거의 동일 | 1.1 GB |
| **zombie-unity** | 37 / 6,181 (0.6%) | SmallScaleInt *2D Zombie City Tile pack 1* · Character Creator Modern | 95 MB |

> `OctopathSprites`(680개, `s01.png`~)는 이름과 형태로 보아 상용 게임 추출물입니다 —
> `spire-godot`과 같은 부류입니다.

### 그 밖에 제외한 것들

| 프로젝트 | 이유 |
|---|---|
| **spire-godot** | © Mega Crit 저작물(Slay the Spire 2 디컴파일 산출물)이 히스토리에 있습니다. **2026-08-18에 공개 제외로 결정**해서 그 레포 README에 기록해뒀습니다. .git 11 GB |
| **sample** | 서드파티 Three.js 데모 클론 모음 (minecraft/simcity/isometric-rpg) — 서드파티 코드 |
| **이력서 파일 정리 및 제안** | 개인정보 |
| **dragon-game-unity-asset-backup** | 에셋 백업 사본 |

## 문서량 — 2026-08-22 스냅샷

| 프로젝트 | md |
|---|---|
| dragon-game-unity | 54 |
| pig | 53 |
| nihongo-app | 31 |
| dragon-game-jrpg | 29 |
| game | 21 |
| dragon-game | 19 |
| stock-analysis | 17 |
| spire-godot | 13 |
| couple-app | 9 |
| saju · 이력서 | 각 7 |
| rhythm-godot | 6 |
| 3d-map · zombie-unity | 각 4 |

아래 수치는 2026-08-22에 측정한 기록입니다. 현재 저장소 수나 문서 상태를 나타내지
않습니다. 당시 합계는 279개였습니다. (전체 `.md`는 530개지만 251개가 벤더링입니다 —
`spire-godot/references/` 119개, `nihongo-app/.agents/skills/` 108개 등)
