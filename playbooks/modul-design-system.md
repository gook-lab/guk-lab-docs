# MODUL 컴포넌트 소비 규칙

MODUL 은 토이 프로젝트들에서 반복해 만들던 폼·표·오버레이를 한 벌로 모은 React
컴포넌트 라이브러리입니다. 이 문서는 라이브러리를 **만드는 쪽**이 아니라 **가져다 쓰는
쪽**의 규칙서입니다. 새 프로젝트에서 `@modul/ui` 를 붙일 때 무엇을 임포트하고, 무엇을
덮어쓸 수 있고, 어디까지가 앱의 몫인지를 정리했습니다.

원본은 MODUL 저장소의 `PROMPT.md`(절대 계약 6개)와 `docs/` 입니다. 여기에는 소비자
관점으로 옮긴 규칙만 두고 수치는 원본 경로를 함께 적었습니다. 값이 어긋나면 원본이
맞습니다.

## 설치와 진입점 — 패키지 4종 · CSS 한 줄 · Provider 하나

```tsx
// 앱 엔트리에서 한 번
import '@modul/tokens/styles.css';
import { ModulProvider, Button } from '@modul/ui';

<ModulProvider theme="light">   {/* 'light' | 'dark' | 'malt' */}
  <Button variant="primary">저장</Button>
</ModulProvider>
```

| 패키지 | 무엇 | 진입점 |
|---|---|---|
| `@modul/tokens` | CSS 변수 + 컴포넌트 클래스 | `@modul/tokens/styles.css` · 값은 `theme.json` |
| `@modul/ui` | 컴포넌트 40여 종 | `import { Button } from '@modul/ui'` |
| `@modul/motion` | 모션 훅·컴포넌트 + 프리셋 8종 | `@modul/motion` |
| `@modul/icons` | Lucide 재export | `@modul/icons` |

`ModulProvider` 는 `document.documentElement.dataset.theme` 를 설정하고 라벨·토스트·툴팁
Provider 를 함께 묶습니다(`packages/ui/src/ModulProvider.tsx`). 테마만 바꾸고 싶다면
`<html data-theme="dark">` 를 직접 써도 동작합니다.

컴포넌트 문구는 한국어 기본값이 들어 있고 `labels` prop 으로 덮어씁니다.

```tsx
<ModulProvider labels={{ 'toast.undo': 'Undo', 'common.close': 'Close' }}>
```

안정도는 두 단계로 표시됩니다 — Button · Input · Tag · Card · Table · Modal · Toast 가
stable 이고 나머지는 beta 입니다(`.changeset/README.md`). beta 컴포넌트를 화면의 중심에
쓸 때는 props 변경 가능성을 감안해 주세요.

## 스타일 우선순위 — 레이어 밖 앱 CSS 가 이기는 구조

MODUL 의 컴포넌트 CSS 는 전부 `@layer modul` 안에 있습니다. CSS 캐스케이드 레이어에서
레이어에 속하지 않은 규칙은 레이어 안 규칙보다 우선하므로, 앱에서 평범하게 쓴 클래스가
명시도를 올리지 않고도 컴포넌트 스타일을 덮습니다. `!important` 를 붙일 일이 거의
없습니다.

```css
/* 앱 CSS — @layer 밖에 두면 이 규칙이 이깁니다 */
.checkout .btn { border-radius: 0; }
```

여기서 한 가지 함정이 있습니다. 앱 CSS 를 통째로 `@layer app { … }` 안에 넣으면 이
우선순위가 사라집니다. Tailwind 처럼 자체 레이어를 쓰는 도구를 얹을 때는 레이어 순서를
먼저 확인해 주세요.

### `!` 접두 — 같은 그룹의 컴포넌트 클래스를 치환

`className` 은 항상 마지막에 병합되고, `!` 로 시작하는 클래스는 **같은 그룹**(마지막
`-` 앞 접두)의 컴포넌트 클래스를 제거한 뒤 자기만 남깁니다. 근거는
`packages/ui/src/utils/cx.ts` 와 `docs/cx-audit.md` 입니다.

`!` 가 지우는 범위는 **같은 그룹 + 같은 축**입니다. 축은 두 개로, 크기 값(`xs` · `sm` ·
`md` · `lg` · `xl` · `2xl` · `3xl`)이 size 축이고 나머지 variant·tone 이 look 축입니다.
그래서 variant 를 덮어도 크기 클래스는 남습니다 — 덮어쓸 때마다 크기를 다시 지정하지
않아도 됩니다.

| 상황 | 쓰는 법 | 결과 |
|---|---|---|
| variant 교체 | `className="!btn-ghost"` | `btn btn-primary btn-sm` 이 `btn btn-sm btn-ghost` 가 됩니다(크기는 유지) |
| elevation 교체 | `className="!elev-lg"` | `elev-*` 그룹만 치환 |
| Tailwind variant | `className="!hover:bg-red"` | `:` 가 포함되면 규칙을 적용하지 않고 그대로 통과합니다 |
| 열림·활성 상태 색 | `data-state` 는 덮지 않습니다 | 앱 CSS 에서 `.my-tabs .tab[data-state=active]{…}` |
| 인라인 스타일 | `sx()` 로 병합 | 소비자 값이 마지막 |

`CommandPalette` · `Toast` · `Tooltip` 은 루트가 Radix Portal/Provider 라 `className` 을
받지 않습니다. 대신 `contentProps` · `containerProps` 로 내부 표면에 전달하고, 규칙은
동일하게 동작합니다.

## 토큰 — theme.json 단일 출처 · 리터럴 사용 금지

색·폰트·간격·반경·모션 값은 전부 CSS 변수로 나와 있습니다. 앱에서 새 색이나 폰트를
직접 적으면 3테마 중 하나에서 반드시 어긋납니다.

```tsx
// 권장
<div style={{ color: 'var(--color-neutral-700)', gap: 'var(--space-3)' }} />

// 피하는 형태
<div style={{ color: '#605d5d' }} />
```

`theme.json` 이 정하는 것은 **base 값**입니다 — 테마별 bg · surface · text · accent ·
divider, 폰트, 반경, 간격, 모션, 이징. 이 값을 바꿀 때는 `theme.json` 과 배포 CSS
(`styles.css` · `theme-malt.css`)를 같이 고칩니다. `pnpm --filter @modul/tokens build` 가
둘을 대조해 어긋나면 어느 변수가 왜 다른지 찍고 실패합니다.

램프(`--color-neutral-100..900` · `--color-accent-100..900`)는 생성물이 아니라 손으로
튜닝한 값입니다. `docs/contrast-audit.md` 의 실측 대비값과 스토리북 axe 통과가 그 값에
걸려 있어서, 알고리즘으로 다시 뽑으면 테마당 18개 값이 달라지고 검수가 무효가 됩니다.
램프를 바꿀 때는 CSS 를 고치고 대비 검수를 다시 하는 순서입니다.

앱 쪽 레이아웃 px 는 예외입니다. MODUL 저장소의 `eslint.config.js` 는 `apps/**` 에서
레이아웃 px 를 허용하고 있습니다.

## 모션 — 프리셋 8종 밖의 값 사용 안 함

`packages/motion/src/presets.ts` 의 8종 밖에서 duration·easing 을 새로 정의하지
않습니다. `prefers-reduced-motion` 대체 동작이 프리셋 안에 함께 정의되어 있어서,
프리셋을 쓰면 축소 모션 분기를 화면마다 따로 쓰지 않아도 됩니다.

| 프리셋 | duration | 움직이는 속성 | reduced |
|---|---|---|---|
| tap | 120ms | opacity | 정지 |
| reveal | 320ms | transform · opacity | 200ms · opacity |
| move | 320ms | transform | 정지 |
| page | 720ms | transform | 150ms · opacity |
| spring | 물리(stiffness 300 · damping 24) | transform | 정지 |
| loop | 18,000ms | transform | 정지 |
| count | 1,400ms | transform · opacity | 정지 |
| scrub | 스크롤 연동 | transform · opacity · clip-path | opacity |

움직이는 속성은 `transform` · `opacity` · `clip-path` 세 가지입니다. `height` · `top` 처럼
레이아웃을 다시 계산하는 속성은 애니메이션 대상에서 뺍니다. 애니메이션 라이브러리는
현재 0 의존이므로, 새로 추가하려면 `@modul/motion` 밖에서 이유를 적고 씁니다.

## 데이터 경계 — fetch · 검증 · 라우팅은 앱이 소유

컴포넌트는 값을 들고 있지 않고 경계를 콜백으로 받습니다. 업로드는
`onUpload(file, onProgress) => Promise<url>`, 목록은 `renderItem`, 인라인 편집 저장은
`onCommit(value)` 형태입니다.

- 폼 상태는 react-hook-form + zod 가 소유하고, `Input` · `Select` 는 표시만 합니다
- `ViewState`(loading / empty / error / offline / ready)는 앱의 훅이 만들고 `EmptyState`
  가 그립니다
- 정렬·페이지 상태는 URL(`?sort=date:desc&page=2`)에 두고 `Table` 은 받은 값을 표시합니다

이 경계 덕분에 같은 컴포넌트를 서버 상태 라이브러리 종류와 무관하게 쓸 수 있습니다.
관련 패턴은 [frontend-patterns](frontend-patterns.md)에 정리해 두었습니다.

## 접근성 최소선 — 44px · neutral-700 · IME 가드

- 터치 타깃 44px 을 기본으로 잡습니다. Malt 테마는 `.btn` 에 `min-height` 를 강제하고,
  `AppBar` 의 뒤로 버튼과 `BottomActions` 의 버튼도 44px 입니다
- 포커스 표시는 `:focus-visible` 2px accent 링만 씁니다. `outline: none` 만 남기지
  않습니다
- 11–12px 캡션·메타·도움말에 `--color-neutral-600` 을 쓰지 않습니다. light 3.85 · malt
  2.75 로 4.5:1 기준에 못 미치고, `--color-neutral-700` 이 5.83 · 5.15 로 통과합니다
  (`docs/contrast-audit.md`, WCAG 2.1 계산값)
- 한글 입력에서 Enter/Escape/화살표 핸들러는 `guardIme()` 를 거칩니다. 조합 확정 Enter
  가 선택이나 저장으로 새는 사고를 막습니다(`packages/ui/src/utils/keyboard.ts`)
- 오버레이(Modal · Drawer · Sheet)는 네이티브 `<dialog>` + `showModal()` 을 씁니다.
  포커스 트랩·Esc·포커스 복귀를 브라우저가 처리하므로 직접 구현하지 않습니다

## 안티패턴 — 증상과 대체 방법

MODUL 저장소 `PROMPT.md` 4절의 "하지 말 것" 9개를 소비자 관점으로 옮긴 표입니다.

| 하지 않는 것 | 나타나는 증상 | 대신 |
|---|---|---|
| 컴포넌트를 감싸며 `className` 을 자체 조립 | `!` 규칙이 깨져 variant 를 덮을 수 없습니다 | `cx()` 를 쓰거나 `className` 을 그대로 넘깁니다 |
| 래퍼에서 `...rest` 를 삼키기 | `aria-*` · `data-*` · 이벤트가 DOM 에 도달하지 않습니다 | 고유 props 만 뽑고 나머지는 전달 |
| 래퍼에서 `forwardRef` 생략 | 포커스 이동·스크롤 제어가 막힙니다 | `forwardRef` 로 ref 를 통과시킵니다 |
| 앱 CSS 를 레이어 안에 넣어 `@layer modul` 우위를 없애기 | 덮어쓰기가 안 먹어 `!important` 가 늘어납니다 | 앱 CSS 는 레이어 밖에 둡니다 |
| hex·px·폰트명 직접 지정 | 3테마 중 한두 곳에서 색이 어긋납니다 | `var(--*)` 사용, 값 변경은 `theme.json` |
| 프리셋 밖 duration·easing 도입 | 화면마다 속도가 달라지고 축소 모션 분기가 빠집니다 | 프리셋 8종에서 고릅니다 |
| Tailwind 를 라이브러리 전제로 깔기 | 클래스 우선순위와 레이어가 얽힙니다 | 선택은 앱의 몫이고 라이브러리는 CSS 변수 + 클래스만 씁니다 |
| 차트를 라이브러리 안에서 확장 | SVG 3종 범위를 넘어 번들이 커집니다 | 별도 패키지로 두고 토큰만 공유합니다 |
| 도메인 프리미티브를 코어로 승격 | 한 앱의 업무 개념이 전 프로젝트에 딸려 옵니다 | 앱 전용 패키지에 두고 `@modul/ui` 에 넣지 않습니다 |

lint·test 규칙을 끄는 것도 같은 목록에 있습니다. `no-restricted-syntax` 가 색 리터럴과
폰트 리터럴을 잡는데, 규칙을 끄면 어긋난 값이 그대로 배포됩니다. 규칙을 끄는 대신 값을
토큰으로 바꾸는 편이 빠릅니다.

## 성능 예산 — 붙이기 전에 확인할 숫자

`docs/performance-budget.md` 의 값이고 MODUL 의 CI 가 `size-limit` 으로 강제합니다.
앱에서 초과하면 lazy 분할이나 가상화를 검토합니다.

`@modul/ui` 는 엔트리가 컴포넌트별로 나뉘어 있어서 `import { Button } from '@modul/ui'`
만으로는 Radix 가 따라오지 않습니다(실측 1.83 KB). 배럴 하나로 번들하면 최상단 import
문이 트리셰이킹 뒤에도 남아 47 KB 가 됩니다 — Radix · cmdk · react-day-picker 가
`sideEffects: false` 를 선언하지 않기 때문입니다.

| 항목 | 예산 |
|---|---|
| `@modul/tokens` CSS | 8 KB (gzip) |
| `@modul/ui` — Button+Input+Tag+Card | 4 KB |
| `@modul/ui` — 전부 (MODUL 코드) | 30 KB |
| `@modul/ui` — 전부 (Radix 포함) | 74 KB |
| `@modul/motion` — 훅 + Marquee/Reveal | 3 KB |
| lazy 청크 | DatePicker 18 KB · CommandPalette 9 KB |
| DOM 노드 | 모바일 화면 300 이하 · 데스크톱 1,500 이하 |
| INP p75 | 200ms 이하 (오버레이 열림 100ms 이하) |
| CLS | 0 |

`Table` 은 20행 × 5열에서 노드가 약 130개입니다. 200행을 넘기면 가상화나 페이지네이션
쪽으로 넘기는 편이 좋습니다. 측정 방식은 [measure-first](measure-first.md)와 같습니다 —
바꾸기 전에 재고, 잰 값을 커밋에 남깁니다.

## 새 프로젝트 부팅 체크리스트

1. `@modul/tokens` · `@modul/ui` 설치, 폼을 쓴다면 `react-hook-form` · `zod` ·
   `@hookform/resolvers` 도 함께 설치합니다(peerDependencies)
2. 엔트리에서 `import '@modul/tokens/styles.css'` 한 줄을 추가합니다
3. 앱 셸을 `ModulProvider` 로 감싸고 `theme` 과 필요한 `labels` 를 넘깁니다
4. 앱 CSS 가 `@layer` 밖에 있는지 확인합니다 — 덮어쓰기가 되는지 버튼 하나로 시험해
   봅니다
5. 색·폰트·간격을 쓰는 첫 화면에서 리터럴 대신 `var(--*)` 를 쓰고 있는지 확인합니다
6. 폼 화면이라면 값·검증의 소유자를 폼 쪽에 두고, 컴포넌트에는 표시만 맡깁니다
7. 3테마(light / dark / malt)를 각각 켜서 화면이 깨지지 않는지 봅니다
8. `prefers-reduced-motion: reduce` 를 켜고 모션이 프리셋의 reduced 대로 도는지
   확인합니다
9. 번들 크기와 DOM 노드 수를 한 번 재서 위 예산 표와 비교합니다
10. 접근성은 axe 로 확인합니다 — color-contrast 위반 0 이 기준선입니다

새 컴포넌트를 MODUL 안에 추가해야 한다면 `docs/radio/TEMPLATE.md` 로 RADIO 문서를 먼저
쓰고 시작합니다. 설계 순서에 관한 배경은 [fe-radio](fe-radio.md)에 있습니다.
