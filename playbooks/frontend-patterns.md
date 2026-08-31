# 프론트엔드 공용 설계 패턴 — 컴포넌트 · 훅 · 상태

실무 프로젝트에서 검증된 설계 규칙 중 **프로젝트를 가리지 않고 성립하는
것들만** 일반화해 옮겼습니다 (2026-08-25). 도메인 종속 규칙은 뺐고, 각 토이
레포의 상세 룰은 여전히 그 레포 `.claude/rules/`가 정본입니다
([하네스 카탈로그](../harness/README.md)가 색인).

## 1. 컴포넌트 계층 — 의존성은 한 방향

```
ui/        원시 컴포넌트 (헤드리스 라이브러리 래퍼)
  ↓
shared/    재사용 가능한 공용 비즈니스 컴포넌트
  ↓
domain/    도메인별 컴포넌트
```

- **역방향 import 금지.** ui가 domain을 알면 계층이 무너집니다.
- 컴포넌트를 만들기 전에 ui/ → shared/ 순으로 **이미 있는지 먼저
  확인합니다** — [fe-radio](fe-radio.md)의 C(Context) 게이트와 같은
  동작입니다.
- **네이티브 요소를 직접 쓰지 않습니다**: `<button>` → `<Button>`,
  `alert()`/`confirm()` → `<Dialog>`/`<ConfirmDialog>`, 애드혹 로딩 텍스트
  → `<Loading>`. stock-pulse의 `components/common` 강제 규칙,
  couple-map 디자인 시스템의 금지 목록이 같은 원리의 토이 구현입니다.

## 2. UI 프리미티브 래핑 규칙

- `className`을 항상 받아 `cn()`으로 병합하고, 원본 props는 `...spread`로
  통과시킵니다 — 래퍼가 라이브러리 기능을 잘라먹지 않게.
- 공통 Props 어휘를 통일합니다: `size`(`xs|s|m|l`),
  `status`(`default|error|warning`). 부모→자식 전파는 Context로.
- Dialog·Popover류는 Portal로 DOM 최상위에 렌더링합니다 — 스태킹 컨텍스트
  버그의 예방책입니다.
- React 19에서는 `ref`를 일반 prop으로 받습니다 (`forwardRef` 불필요).

## 3. 서버 상태 — Query / Mutation 훅

- **queryKey는 상수로 export** 하고 배열 형태 `[KEY, ...params]`를
  지킵니다. 무효화 전략이 키 구조에서 나오기 때문입니다 — 정확 키
  무효화 vs prefix 무효화(관련 쿼리 전체).
- 응답 가공은 컴포넌트가 아니라 `select`에서 합니다.
- **mutation 훅에는 공통 동작만** 둡니다(invalidate + toast). 화면별 추가
  동작은 `mutate(data, { onSuccess })` 콜백 주입으로 — 훅이 화면 사정을
  알기 시작하면 재사용이 끝납니다.
- 파일·네이밍 규칙을 고정합니다: `use-{domain}-query.ts` /
  `use-{domain}-mutation.ts`, 서비스 함수는 `getXxx as getXxxAPI` 별칭.

## 4. 에러 · 로딩 · 빈 상태 — 공통 3종으로 통일

```tsx
if (isLoading) return <Loading />;
if (isError) return <ApiErrorFallback error={error} />;
if (!data?.length) return <EmptyResult>No data found.</EmptyResult>;
```

- 화면마다 에러 UI를 직접 그리지 않습니다. 상태 코드별 메시지는 공통
  컴포넌트 한 곳이 처리합니다.
- 알림은 toast 헬퍼 하나로 통일하고 `alert()`는 금지합니다.
- 사용자 취소·정상 흐름은 에러로 보고하지 않습니다 — nihongo-app의
  에러 처리 룰(`reportXxxError` + 사용자 피드백 동시 처리)이 토이 쪽
  구현입니다.

## 5. 클라이언트 상태 — 스토어

- 컴포넌트는 **필요한 조각만 셀렉터로 구독**합니다. 스토어 전체 구독은
  리렌더 폭탄입니다 — pig의 ShapeRenderer 격리·`getState()` 이벤트 핸들러
  패턴이 실측 사례입니다(줌 36→106fps).
- 고빈도 이벤트(wheel·drag)는 reactive 구독 대신 `getState()`로 읽어
  의존성 배열을 비웁니다. 단, 렌더링에 쓰는 값은 반드시 reactive 셀렉터로.
- 민감 데이터를 persist 할 때는 암호화 스토리지 어댑터를 끼웁니다 —
  평문 localStorage 금지.

## 6. 코드 수정 후 검증 습관

- 수정한 파일 단위로 바로 확인합니다: `npx tsc --noEmit` ·
  `npx eslint <파일>`. 커밋 게이트 전에 자기 손으로 한 번.
- `const`는 TDZ가 적용됩니다 — 선언 순서를 옮길 때 그 변수를 참조하는
  `useEffect`/`useCallback`이 전부 선언 **뒤에** 있는지 확인합니다.

## 7. 테스트 — 전략별 물리 분리

- 목 기반 시나리오 테스트와 실 API 계약 테스트를 **폴더로 분리**합니다.
  섞이면 "이 스펙이 뭘 믿고 초록인지"를 알 수 없게 됩니다.
- 개발용 목(MSW 등)은 테스트가 아닙니다 — 테스트는 자기 목(`page.route`)
  또는 실 API로 셋업합니다.
- 하나의 시나리오 본문을 mocked/live 스펙이 공유하는 dual-mode 패턴이
  중복을 없앱니다. assertion은 통제된 목과 임의의 실 데이터 양쪽에서
  성립하게(상대적 read→act→assert-change) 작성합니다.

## 토이에 적용할 때

- 이 문서는 **강제 룰이 아니라 기본값**입니다 — React 앱형 토이(신규
  화면·데이터 연동)를 시작할 때 이 패턴에서 출발하고, 벗어날 때는 그 레포
  `.claude/rules/`에 근거를 남깁니다.
- 게임형 토이(순수 JS 루프)는 1·5·6장만 해당됩니다 — 나머지는 서버 상태가
  있는 앱의 이야기입니다.
