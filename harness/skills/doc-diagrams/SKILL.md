---
name: doc-diagrams
description: Draw architecture/event-flow diagrams for docs with pig-ma's Mermaid import, then capture them headlessly into docs/diagrams/. Use when an ARCHITECTURE.md needs a flowchart, when the ASCII diagram deserves a visual version, or when updating a diagram after a structure change.
---

# 문서 다이어그램을 pig-ma로 그린다

아키텍처 문서의 이벤트 플로우를 **pig-ma 자신의 Mermaid import**로 그려서
PNG로 박는다. 도구를 직접 만든 프로젝트라서 다이어그램도 그 도구로 그리는
것 자체가 도그푸딩 증거가 된다. 2026-08-24에 game / dragon-game / pig /
stock-analysis 4개 레포에 적용했다.

## 산출물 규약

```
<repo>/docs/diagrams/<name>.mmd   # Mermaid 원본 — 이것이 정본
<repo>/docs/diagrams/<name>.png   # pig-ma 렌더 캡처 (2x)
```

- 문서에는 `<img src="diagrams/<name>.png" width="620">` 로 임베드하고,
  바로 아래에 `.mmd` 링크 + "구조가 바뀌면 다시 import 해서 갱신" 캡션을 단다.
- 구조가 바뀌면 `.mmd` 를 고치고 이 절차로 PNG만 다시 뽑는다. PNG만 고치고
  `.mmd` 를 안 고치면 다음 갱신 때 어긋난다.

## Mermaid 작성 규칙 (pig-ma 파서 서브셋)

- 지원: `flowchart TD|LR`, 노드 도형 9종(`[..]` `([..])` `[(..)]` `{..}` 등),
  엣지 실선/점선(`-.->`)/굵은선(`==>`), 엣지 라벨, 체인, `&`.
- 미지원(스킵됨): subgraph, style/classDef/click/linkStyle.
- **사이클을 만들지 마라.** 레이아웃이 Kahn 위상정렬이라 A→B→A 순환이 있으면
  배치가 흐트러진다 (실측: LR + 역방향 엣지 2개 → 노드 겹침). 되돌아가는
  흐름은 노드를 복제하거나(예: "store 갱신"을 별도 노드로) 라벨로 표현한다.
- 노드 8개 안팎, `flowchart TD` 가 가장 안정적이다.

## 절차 (browse 데몬 `$B` 기준)

```bash
cd <pig 레포> && npm run dev     # 포트 3874
$B viewport 1600x1000 --scale 2  # 레티나. ⚠️ --scale 변경은 컨텍스트를 재생성해
                                 #   localStorage 보드가 날아간다 — import 전에 설정할 것
$B goto http://localhost:3874/
```

1. **캔버스 비우기** — 전체 삭제 버튼은 아이콘 버튼이라 textContent가 아니라
   **aria-label**로 찾는다. 확인 모달은 앱 자체 모달(네이티브 dialog 아님)이라
   `dialog-accept` 가 안 먹는다. 버튼 텍스트 정확일치 JS 클릭이 확실하다:
   ```
   $B js "…find(b=>aria-label=='전체 삭제').click()" → 모달의 '삭제' 버튼 클릭
   → '전체 삭제' 버튼이 disabled 면 빈 캔버스 확인 완료
   ```
2. **Import** — File → Import Mermaid. 모달 textarea는 React 제어 컴포넌트라
   `$B fill` 이 아니라 **네이티브 value setter + input 이벤트**로 주입한다:
   ```js
   const setter = Object.getOwnPropertyDescriptor(
     HTMLTextAreaElement.prototype, "value").set;
   setter.call(ta, mmd);
   ta.dispatchEvent(new Event("input", { bubbles: true }));
   ```
   textarea 는 `placeholder` 가 `flowchart` 로 시작하는 것을 찾으면 된다.
3. **캡처** — import 는 뷰포트 중앙 배치라서 zoom-to-fit 없이 중앙 클립으로
   자른다. 토스트가 사라질 때까지 3~5초 기다린 뒤:
   ```bash
   $B screenshot out.png --clip <x,y,w,h>   # CSS px 기준, 2x 로 저장됨
   ```
   전체 스크린샷을 먼저 찍어 콘텐츠 좌표를 확인하고 클립을 잡는 편이 빠르다.
4. `.png` 와 `.mmd` 를 `docs/diagrams/` 로 복사하고 문서에 임베드한다.

## 함정

- **연속으로 여러 장을 그릴 때 캔버스를 안 비우면 겹쳐 들어간다.** import 는
  기존 캔버스에 추가되는 동작이다. 장마다 1번(비우기)을 반드시 거친다.
- 커넥터 화살표가 노드 중심을 향해 들어간다 — 현재 import 구현의 특성이다.
  거슬리면 pig-ma 쪽 개선 거리다(anchor를 노드 경계로).
- 캡처 전 `--scale` 을 바꾸면 보드가 사라진다(컨텍스트 재생성). 반드시
  **스케일 먼저, import 나중** 순서.
