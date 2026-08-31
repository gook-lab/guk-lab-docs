---
name: doc-screenshots
description: Generate README and portfolio screenshots with the same browser automation used for tests, so they stay current instead of rotting after every UI change. Use when a README has no screenshots, when the UI changed and the images are stale, or when setting up a portfolio page.
---

# 문서용 스크린샷을 자동으로 찍는다

**손으로 찍은 스크린샷은 손으로 적은 숫자와 똑같이 낡는다.** 화면을 고칠
때마다 다시 찍어야 하는데 아무도 안 한다. 그래서 테스트와 같은 도구로 만든다.

참조 구현: `myeongri-seojae/e2e/screenshots.spec.ts` (실제로 도는 것)

## 왜 필요한가

토이 프로젝트 9개 중 README 에 스크린샷이 있는 건 **하나뿐**이었다
(2026-08-22 확인). 나머지는 코드를 읽지 않으면 뭘 만든 건지 알 수 없다.
포트폴리오로서는 치명적이다 — 보는 사람은 코드를 읽지 않는다.

## 구조

### 1. 기본 실행에서 빼 둔다

스크린샷은 매 커밋마다 찍을 필요가 없다. CI 를 느리게 하고 이미지 diff 로
커밋을 더럽힌다.

```ts
// playwright.config.ts
{
  name: 'shots',
  testMatch: /screenshots\.spec\.ts/,
},
{
  name: 'desktop',
  testIgnore: /screenshots\.spec\.ts/,   // 기본 실행에서 제외
}
```

```json
{ "scripts": { "shots": "playwright test --project=shots --workers=1" } }
```

`--workers=1` 이 중요하다. 병렬로 찍으면 순서가 섞이고 애니메이션 타이밍이 갈린다.

### 2. 상태를 초기화하는 헬퍼

```ts
async function fresh(page) {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
}
```

> ⚠️ **`addInitScript` 로 `localStorage.clear()` 를 하지 마라.** 그건
> `reload()` 를 포함한 **모든 네비게이션에서 다시 돈다.** 새로고침 테스트가
> 스스로 데이터를 지우고, 앱이 데이터를 날린 것처럼 보인다 — 실제로 이걸로
> 없는 버그를 반나절 쫓았다.

### 3. 화면까지 가는 경로를 함수로

```ts
async function toResult(page) {
  await fresh(page);
  await page.getByRole('button', { name: '시작하기' }).click();
  // ...
  await expect(page.getByRole('region', { name: '결과' })).toBeVisible();
}
```

**반드시 `expect(...).toBeVisible()` 로 끝낸다.** 안 그러면 로딩 중인 화면을
찍고도 성공으로 끝난다 — 조용히 잘못된 그림이 문서에 박힌다.

### 4. 찍고 나서 줄인다

```ts
await page.screenshot({ path, fullPage });
shrink(path);   // 폭 720px
```

모바일 뷰포트는 밀도가 높아 원본이 1440px 이 나온다. 문서에 들어갈 그림이
장당 수백 KB 일 이유가 없다. `sips`(macOS) 나 `sharp` 로 줄인다.

### 5. README 에 표로 배치

```md
| 시작 | 입력 | 결과 |
|---|---|---|
| <img src="docs/screenshots/01-intro.png" width="240"> | ... | ... |
```

`<img width>` 를 쓰면 마크다운 이미지 문법보다 크기를 다루기 쉽다.

## 언제 돌리나

화면을 손본 뒤 **한 번.** 커밋 훅에 넣지 않는다 — 이미지가 매번 바뀌면
diff 가 쓸모없어진다.

## 애니메이션은 끄고 찍는다

기본 스펙에서 애니메이션을 죽이는 fixture 를 쓰면 스크린샷이 결정적이 된다.
움직임 자체를 봐야 하는 테스트만 별도 프로젝트로 분리한다
(`myeongri-seojae` 는 `motion` 프로젝트를 따로 뒀다).

## 비밀정보 주의

**로그인된 화면을 찍을 때 실제 계정 정보가 들어가지 않게 한다.** 시드 계정을
쓰고, 찍은 뒤 이미지에 이메일·토큰·실명이 보이는지 한 번 눈으로 본다.
스크린샷은 커밋되면 히스토리에 남는다.
