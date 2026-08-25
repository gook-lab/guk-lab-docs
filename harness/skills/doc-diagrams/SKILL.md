---
name: doc-diagrams
description: Draw architecture/event-flow diagrams for docs with pig-ma's Mermaid import, then export them straight from the Konva stage into docs/diagrams/. Use when an ARCHITECTURE.md needs a flowchart, when the ASCII diagram deserves a visual version, or when updating a diagram after a structure change.
---

# 문서 다이어그램 — pig-ma Mermaid import + 스테이지 내보내기

아키텍처 문서의 이벤트 플로우를 **pig-ma 자신의 Mermaid import**로 그려서
PNG로 박는다. 도구를 직접 만든 프로젝트라서 다이어그램도 그 도구로 그리는
것 자체가 도그푸딩 증거가 된다. 2026-08-25에 game / dragon-game / pig /
stock-analysis 4개 레포에 적용했다.

## 산출물 규약

```
<repo>/docs/diagrams/<name>.mmd   # Mermaid 원본 — 이것이 정본
<repo>/docs/diagrams/<name>.png   # pig-ma 렌더 캡처 (2x, 흰 배경)
```

- 문서에는 `<img src="diagrams/<name>.png" width="620">` 로 임베드하고,
  바로 아래에 `.mmd` 링크 + "구조가 바뀌면 다시 import 해서 갱신" 캡션을 단다.
- 구조가 바뀌면 `.mmd` 를 고치고 이 절차로 PNG만 다시 뽑는다. PNG만 고치고
  `.mmd` 를 안 고치면 다음 갱신 때 어긋난다.

## 색과 선의 규약

문서 다이어그램은 **색이 의미를 나르게** 쓴다. pig-ma 파서가 `classDef` /
`class` / `style` 을 지원하므로(2026-08-25 추가) `.mmd` 안에서 지정한다.

```
classDef core fill:#e0e7ff,stroke:#4f46e5,color:#1e1b4b,stroke-width:3
classDef view fill:#ffffff,stroke:#475569,color:#0f172a
classDef store fill:#dcfce7,stroke:#16a34a,color:#052e16
classDef external fill:#fef3c7,stroke:#d97706,color:#451a03
classDef tool fill:#f1f5f9,stroke:#94a3b8,color:#334155
class SYS,LOOP core
```

| 클래스 | 뜻 | 색 |
|---|---|---|
| `core` | 그 프로젝트의 핵심 불변식이 사는 곳 (순수 리졸버, 게이트) | 남보라, 굵은 테두리 |
| `view` | 표현·배선 계층 | 흰색 |
| `store` | 저장소·상태 (원통 도형과 함께) | 초록 |
| `external` | 우리가 통제하지 못하는 외부 시스템 | 주황 |
| `tool` | 런타임 밖의 도구 (하네스·스크립트) | 회색 |

**선**: 실선 = 런타임 데이터 흐름(이벤트 포함). 점선 = **런타임 밖 경로**
(검증 하네스처럼 제품 실행에는 없는 흐름)에만 쓴다. 이벤트를 점선으로 그리면
"이벤트도 런타임 밖"으로 읽혀서 의미가 흐려진다 — 이벤트는 실선으로 두고
라벨로 구분한다.

## Mermaid 작성 규칙 (pig-ma 파서 서브셋)

- 지원: `flowchart TD|LR`, 노드 도형 9종(`[..]` `([..])` `[(..)]` `{..}` 등),
  엣지 실선/점선(`-.->`)/굵은선(`==>`), 엣지 라벨, 체인, `&`.
- 지원: `classDef` / `class` / `style` (fill · stroke · color · stroke-width).
- 미지원(스킵됨): subgraph, click, linkStyle, `A:::class` 인라인 표기.
- **사이클을 만들지 마라.** 레이아웃이 Kahn 위상정렬이라 A→B→A 순환이 있으면
  배치가 흐트러진다 (실측: LR + 역방향 엣지 2개 → 노드 겹침). 되돌아가는
  흐름은 노드를 복제하거나 라벨로 표현한다.
- 노드 8개 안팎, `flowchart TD` 가 가장 안정적이다.

## import 이 알아서 하는 것 (2026-08-25 개선)

문서 다이어그램을 실제로 뽑아 보고 고친 것들이다 — 손으로 만질 필요 없다.

- **커넥터는 도형 경계에서 출발한다.** attached 커넥터는 앵커가 없으면
  `"center"` 로 해석되어 선이 도형 한가운데서 뻗어 나온다. import 가
  흐름 방향에 맞는 변(TD면 bottom→top)을 앵커로 박는다.
- **경로는 엘보우(직교)**다. 레이어드 레이아웃에서 랭크를 가로지르는 사선은
  읽기 어렵다. 모서리는 `rounded`.
- **랭크를 건너뛰는 엣지는 도해 바깥쪽으로 우회한다.** 흐름 방향 변에서 나가면 중간
  랭크의 노드를 관통해 지나간다 (실측: balance.js → systems 선이
  engine/loop 박스를 통과). 랭크 간격의 1.6배를 넘으면 옆면 앵커로 빼되,
  **도해 중심의 바깥쪽**으로 돌린다 — 안쪽으로 돌면 반대편 열을 가로지른다.
- **엣지 라벨은 겹치지 않는 구간에 놓인다.** 기본값 t=0.5 는 랭크 사이의
  공용 가로 구간이라 한 노드로 모이는 엣지끼리 라벨이 겹친다. 모이면
  출발 쪽(0.18~), 갈라지면 도착 쪽(~0.82), **둘 다면 가운데(0.5~)** 로
  밀고, 같은 끝점을 공유하는 엣지끼리 순번만큼 더 어긋낸다.
- 랭크 간격은 140 — 세로 구간과 라벨이 들어갈 자리를 확보한 값.

## 절차 (browse 데몬 `$B` 기준)

```bash
cd <pig 레포> && npm run dev     # 포트 3874
$B viewport 1600x1000 --scale 2  # ⚠️ --scale 변경은 컨텍스트를 재생성해
                                 #   localStorage 보드가 날아간다 — import 전에
$B goto http://localhost:3874/
```

1. **캔버스 비우기** — 전체 삭제 버튼은 아이콘 버튼이라 textContent 가 아니라
   **aria-label** 로 찾는다. 확인 모달은 앱 자체 모달(네이티브 dialog 아님)이라
   `dialog-accept` 가 안 먹는다. 버튼 텍스트 정확일치 JS 클릭이 확실하다.
   `전체 삭제` 가 disabled 면 빈 캔버스다.
2. **Import** — File → Import Mermaid. 모달 textarea 는 React 제어
   컴포넌트라 `$B fill` 이 아니라 **네이티브 value setter + input 이벤트**로
   주입한다:
   ```js
   const setter = Object.getOwnPropertyDescriptor(
     HTMLTextAreaElement.prototype, "value").set;
   setter.call(ta, mmd);
   ta.dispatchEvent(new Event("input", { bubbles: true }));
   ```
3. **화면 안에 들어오는지 확인** — 뷰포트 가상화 때문에 **화면 밖 도형은 씬
   그래프에 아예 없다.** 도형 경계가 스테이지 안에 들어올 때까지 Zoom Out 을
   누른다.
4. **스테이지를 직접 내보낸다** — 페이지 스크린샷을 쓰면 헤더·툴바·미니맵이
   같이 잡히고 클립 좌표를 손으로 맞춰야 한다. `stage.toDataURL({x,y,w,h,
   pixelRatio:2})` 은 캔버스만 뽑는다:
   ```bash
   $B eval capture.js --out out.png   # eval 은 --out 으로 data URL 을 파일로 씀
   ```
   - 경계는 **도형 children + Text 노드**의 clientRect 로 잡는다. 커넥터
     Group 은 절대좌표 points 라 rect 가 원점에서 시작해 못 쓰고, 우회 경로
     끝의 라벨은 도형 경계 밖으로 나갈 수 있어 Text 를 같이 넣어야 한다.
   - 점 그리드는 CSS 라 캔버스에 없다. 그대로 두면 **투명 PNG** 가 나오고
     GitHub 다크 테마에서 배경이 비어 보인다 — `toCanvas()` 로 받아서
     흰 캔버스에 `drawImage` 로 합성한다. `Konva.Rect` 를 얹는 방식은
     react-konva 재조정에 지워질 수 있어 쓰지 않는다.
   - `eval` 은 **프로미스를 기다리지 않는다.** 배경 합성을 async 이미지
     로드로 하면 빈 파일이 나온다 — 위처럼 동기로 처리한다.
   - `--out` 경로는 `/private/tmp` 또는 cwd 안이어야 한다. 스크래치패드에
     쓰고 레포로 복사한다.
5. `.png` 와 `.mmd` 를 `docs/diagrams/` 로 복사하고 문서에 임베드한다.

## 함정

- **연속으로 여러 장을 그릴 때 캔버스를 안 비우면 겹쳐 들어간다.** import 는
  기존 캔버스에 추가되는 동작이다. 장마다 1번(비우기)을 반드시 거친다.
- **import 코드를 고쳤으면 페이지를 새로고침하고 뽑는다.** 안 그러면 옛 코드로
  렌더된 결과를 보고 "안 고쳐졌다"고 판단하게 된다.
- 캡처 전 `--scale` 을 바꾸면 보드가 사라진다(컨텍스트 재생성). 반드시
  **스케일 먼저, import 나중** 순서.
