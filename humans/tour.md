# 프로젝트 투어

9개입니다. 각각 3분이면 무엇이고 왜 만들었는지 알 수 있게 썼습니다.
자세한 건 각 레포 README로 가시면 됩니다.

---

## 캔버스 · 도구

### [pig-ma](https://github.com/gook-lab/pig-ma) — FigJam 스타일 무한 캔버스

화이트보드를 처음부터 만들면 뭐가 어려운지 궁금해서 시작했습니다. 도형·커넥터·
스티키노트·리치텍스트·댓글까지 붙었고, npm 라이브러리로도 배포하고 있습니다.

**흥미로운 지점** — 텍스트를 두 벌로 렌더링해요. 볼 때는 Konva Text(캔버스 안,
DOM 없음), 편집할 때는 Tiptap(HTML 오버레이)이죠. 둘의 padding·lineHeight 상수가
1px만 어긋나도 편집을 시작하는 순간 글자가 튀어요. 그래서 상수를 `constants/`에
모아 양쪽이 같은 값을 보게 했습니다.

5,000개 노드에서 줌이 36fps였습니다. 범인은 짐작했던 localStorage 저장(7%)이
아니라, 컴포넌트들이 `zoom`을 구독해서 매 프레임 전체가 리렌더되는 것(35%+)
이었습니다. 고치고 나니 106fps가 나왔습니다.

---

## 데이터 · 계산

### [myeongri-seojae](https://github.com/gook-lab/myeongri-seojae) — 명리서재

사주 사이트인데 "오늘의 운세 87점" 같은 건 하지 않습니다. 인생을 **10년 단위(대운)로
펼쳐** 놓고 "여기가 당신의 25~34세"라고 짚어줍니다. 사람이 소름 돋는 순간은 오늘
점수가 아니라 **자기 과거가 설명될 때**입니다.

**흥미로운 지점** — 이건 알고리즘이 정확해야만 성립합니다. 오늘 운세는 하루 틀려도
아무도 모르지만, 대운수가 1년 어긋나면 타임라인이 통째로 밀리기 때문입니다. 그래서 절기
계산을 1900~2050 전 구간 천체력으로 검증하고, 그 위에 **한국천문연구원(KASI)
공식 값과 한 번 더 대조**합니다. "구현 둘이 서로 맞다"와 "공식 기관과 맞다"는
다른 문장입니다.

생년월일은 서버로 보내지 않습니다.

| 시작 | 계산 | 대운 타임라인 |
|---|---|---|
| <img src="https://raw.githubusercontent.com/gook-lab/myeongri-seojae/main/docs/screenshots/01-intro.png" width="230"> | <img src="https://raw.githubusercontent.com/gook-lab/myeongri-seojae/main/docs/screenshots/04-calculating.png" width="230"> | <img src="https://raw.githubusercontent.com/gook-lab/myeongri-seojae/main/docs/screenshots/05-result.png" width="230"> |


### [stock-pulse](https://github.com/gook-lab/stock-pulse) — PULSE 시황 대시보드

한국·미국 시장을 한 화면에 담았습니다. 실시간 체결/호가, 히트맵, 감성 스코어 뉴스,
모의 포트폴리오, 그리고 부동산 단지를 OSM 발자국에서 압출한 3D 배치도까지입니다.

**흥미로운 지점** — 실질적인 난이도는 UI가 아니라 **남의 API를 견디는 일**이었습니다.
KIS 모의계좌는 초당 상한이 낮아서 라우트가 각자 호출하면 서로를 밀어냅니다
(실측: 서로 다른 종목 연속 조회에서 6/10 실패). 전역 직렬 큐 + **적응형 간격**
(실패하면 ×1.6, 성공하면 −15ms)으로 0/12까지 내렸습니다. 고정 간격은 TR마다
상한이 달라서 항상 틀렸습니다.

그리고 **재시도는 게이트에 넣지 않았습니다** — 주문까지 재시도되면 중복 주문이
되기 때문입니다.

### [osm-walker](https://github.com/gook-lab/osm-walker) — OSM 3D 탐험

검색한 좌표 주변 500m의 실제 건물·도로를 OpenStreetMap에서 받아 압출하고,
치비 캐릭터로 그 위를 걸어다닙니다.

**흥미로운 지점** — 지도 프로젝트 버그의 대부분은 좌표계 혼동에서 납니다.
그래서 WGS84(위경도) · LocalXZ(씬 좌표, 1 unit = 1 m) · Screen(NDC) 셋을
**타입으로 분리**하고, 변환은 파일 하나에서만 합니다.

---

## 게임

### [crypt-survivors](https://github.com/gook-lab/crypt-survivors) — 뱀서라이크

Vampire Survivors 풍 오토배틀러 로그라이트입니다. 순수 JS + PixiJS로 만들었습니다.

**흥미로운 지점** — 시뮬레이션이 **PixiJS를 import 하지 않습니다.** 그 덕에
게임 전체를 Node에서 헤드리스로 돌릴 수 있고, `node scripts/balance.js 24`로
24개 시드 × 10분을 자동 플레이시켜 난이도 곡선을 숫자로 봅니다. 밸런싱이
"해보니 어렵네"에서 "중앙값 생존 7분 12초"로 바뀌는 것입니다.

### [dungeon-craft](https://github.com/gook-lab/dungeon-craft) — 던전크래프트

드래곤퀘스트 풍 턴제 RPG입니다. 전투 리졸버도 PixiJS를 모릅니다.

**흥미로운 지점** — 밸런스 하네스를 3패스로 돌려요. BASELINE(중립) ·
MERCY(유대 긍정) · RUTHLESS(유대 부정). 같은 콘텐츠가 플레이 스타일에 따라
얼마나 갈리는지를 보는 것입니다.

플레이어의 선택은 미터기로 표시되지 않고, NPC 대사·파티 유대·엔딩으로 조용히
되돌아옵니다.

### [rhythm-godot](https://github.com/gook-lab/rhythm-godot) — 원버튼 리듬게임

얼불춤(ADOFAI) 류입니다. Godot 4.7 + GDScript.

**흥미로운 지점** — 리듬게임에서 가장 중요한 규칙 하나: **시간축은 하나다.**
모든 시각 요소가 `AudioClock.now_ms()`에서 파생되고 **Tween을 쓰지 않습니다.**
Tween은 프레임 시간을 따르는 두 번째 시간축이라, 오디오와 반드시 갈리기 때문입니다.

판정도 좌표 겹침이나 프레임 카운트가 아니라 오디오 클럭 ms 차이로만 합니다.
채보의 각도는 손으로 쓰지 않고 박자 패턴에서 역산합니다.

---

## 앱

### [nihongo](https://github.com/gook-lab/nihongo) — 일본어 학습 PWA

마스코트 캐릭터와 함께 매일 조금씩 배우는 앱입니다. SM-2 간격반복이 코어고,
가나·한자 드릴, JLPT 모의고사, Gemini 기반 AI 튜터(채팅·작문 첨삭·이야기 생성)가
붙어 있습니다.

**흥미로운 지점** — 발음 오디오를 IndexedDB에 영속 캐시해서 **오프라인에서도
들립니다.** 학습 앱은 지하철에서 쓰이는데, 거기서 소리가 안 나면 앱이 죽은 거나
마찬가지기 때문입니다.

### [couple-map](https://github.com/gook-lab/couple-map) — 커플 지도

함께 다닌 곳을 카카오 지도에 핀으로 남기고, 다녀온 지역이 지도에 채워집니다.
타임라인·기념일·편지·채팅·타임캡슐까지 있습니다.

**흥미로운 지점** — 여섯 가지 팔레트를 갈아끼우는 글래스 디자인 시스템입니다.
디자인 규칙에 **금지 목록**이 있습니다 — 하지 말아야 할 것을 적어두면 매번
"이건 되나?"를 묻지 않아도 되기 때문입니다.

---

## 스크린샷 현황 (2026-08-22)

| 프로젝트 | 상태 |
|---|---|
| `myeongri-seojae` | 자체 파이프라인(`pnpm shots`)으로 13장 |
| `pig-ma` · `crypt-survivors` · `dungeon-craft` · `nihongo` · `couple-map` · `stock-pulse` | 헤드리스 브라우저로 촬영 |
| `osm-walker` | **못 찍었습니다** — 헤드리스 크롬에 WebGL이 없어서 Three.js 씬이 빈 화면으로 나옵니다 (2D 미니맵만 렌더됩니다). GPU 있는 브라우저가 필요합니다 |
| `rhythm-godot` | 웹이 아니라 Godot 실행이 필요합니다 |

`stock-pulse`는 백엔드 없이 찍어서 빈 상태입니다 — 다만 그 빈 상태 자체가
설계 결정입니다. 실데이터가 없으면 목이 아니라 `-`를 보여주기 때문입니다.

절차는 [doc-screenshots 스킬](../harness/skills/doc-screenshots/SKILL.md)에
정리해뒀습니다. 손으로 찍으면 화면을 고칠 때마다 낡기 때문입니다.

## 공개하지 않은 것들

유니티 3종(`dragon-game-unity` · `dragon-game-jrpg` · `zombie-unity`)과
`spire-godot`은 로컬에만 있습니다. 유료 에셋 스토어 패키지가 히스토리에 이미
커밋되어 있어서, 공개하면 재배포가 되기 때문입니다. 자세한 판단은
[publishing 체크리스트](../playbooks/publishing.md)에 있습니다.
