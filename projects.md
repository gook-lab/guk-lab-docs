# 프로젝트 지도

`~/sonix/toy/` 아래 토이 프로젝트 전수 목록입니다. 각 프로젝트의 상세는 그 레포의
`README.md` / `CLAUDE.md`가 단일 소스라서, **여기에 복제하지 않습니다.**

조사 시점: 2026-08-22. (2026-08-24 갱신: 신규 2건 — water-balloon-arcade, roomcast · roomcast는 같은 날 공개)

## 공개 가능 — 그대로 올릴 수 있습니다

| 프로젝트 | 무엇 | 스택 | git | 마지막 커밋 |
|---|---|---|---|---|
| **pig** | FigJam 스타일 무한 캔버스 드로잉 앱. npm 라이브러리 `pig-ma`로도 배포 중 | React 18 · TS · Vite · Konva · Zustand | 3.9M / 30 | 2026-08-20 |
| **saju** | 명리서재 — 인생을 10년 단위(대운)로 펼쳐 보는 사주 사이트. 생년월일은 로컬 계산(서버 전송 없음) | React 19 · TS · Vite · Tailwind v4 · Zustand | 25M / 39 | 2026-08-22 |
| **stock-analysis** | PULSE — 한국·미국 시황 통합 다크 트레이딩 대시보드. KIS 실시간 체결/호가 SSE, 히트맵, 감성 뉴스, 모의 포트폴리오, 부동산 3D 배치도 | React 18 · TS · Vite · Node 프록시 | 4.1M / 43 | 2026-08-05 |
| **rhythm-godot** | 얼불춤(ADOFAI)류 원버튼 리듬게임. 시간축을 오디오 클럭 하나로 통일 | Godot 4.7 · GDScript · Python(표준 라이브러리만) | 4.3M / 54 | 2026-08-11 |
| **dragon-game** | 던전크래프트 — 드래곤퀘스트풍 턴제 RPG. 전투 리졸버가 PixiJS를 import 하지 않아 헤드리스 검증 가능 | JS(ESM) · PixiJS v8 · Vite · Vitest | 29M / 98 | 2026-07-21 |
| **roomcast** | 3D 인테리어 배치 도구 — 2D 평면도 에디터 + 1인칭 워크스루 + 조감도. 평면도 모델 하나(SSOT)에서 2D/3D 파생. 구현 진행 중 | React 18 · TS · Vite · R3F | 2.0M / 22 | 2026-08-24 |

### git 초기화가 필요한 것 (원격 없음)

| 프로젝트 | 무엇 | 스택 | 주의 |
|---|---|---|---|
| **game** | Crypt Survivors — 뱀서라이크 오토배틀러 로그라이트. 시뮬레이션이 렌더러와 분리 | JS · PixiJS v8 · Vite · Vitest (226개) | `.gitignore`에 `.env` 추가 필요 |
| **nihongo-app** | 니혼고 — 마스코트 기반 일본어 학습 PWA. SM-2 간격반복 + Gemini AI 튜터, 오디오 IndexedDB 오프라인 캐시 | React 19 · Vite · Firebase | `.env` 존재 (gitignore 확인됨 ✓) · `.agents/skills/`는 벤더링된 서드파티 |
| **couple-app** | 커플이 다닌 곳을 카카오 지도에 기록·공유하는 모바일 PWA. 타임라인·기념일·편지·타임캡슐 | React 19 · Vite · Firebase | `.env` 존재 (gitignore 확인됨 ✓) |
| **3d-map** | OpenStreetMap 실제 건물·도로를 압출해 만든 로우폴리 3D 월드를 치비 캐릭터로 걸어다니는 웹 앱 | React 19 · R3F · Rapier | `.gitignore`에 `.env` 추가 필요 |
| **water-balloon-arcade** | 물풍선 대작전 — 크레이지아케이드류 픽셀 아케이드. 디자인 캔버스 프로토타입을 React로 이식, 게임 루프는 React 밖 순수 JS 엔진 | React 18 · Vite · Canvas2D | 2026-08-24 신규. 원본 핸드오프는 `크레이지아케이드 (1)/` (공개 대상 아님) |

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

## 문서량 (직접 작성분, 벤더링 제외)

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

합계 279개입니다. (전체 `.md`는 530개지만 251개가 벤더링입니다 —
`spire-godot/references/` 119개, `nihongo-app/.agents/skills/` 108개 등)
