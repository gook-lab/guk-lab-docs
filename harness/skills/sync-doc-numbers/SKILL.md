---
name: sync-doc-numbers
description: Keep numbers written in documentation (test counts, benchmark results, file counts) in sync with reality by measuring them instead of typing them. Use when a README or CLAUDE.md quotes a count, and whenever such a number is about to be written by hand.
---

# 문서의 숫자를 재서 적는다

**손으로 적은 숫자는 반드시 낡는다.** 스크린샷을 손으로 그리면 안 되는 것과
같은 이유다.

## 이게 실제로 얼마나 흔한가

2026-08-22 하루에 토이 프로젝트 4곳에서 발견한 것:

| 레포 | 문서가 주장한 값 | 실측 |
|---|---|---|
| `saju` | Vitest 514 · Playwright 161 | **556 · 206** |
| `dragon-game` (`CLAUDE.md`) | 317+ | **402** |
| `dragon-game` (`map-roadmap.md`) | 기준선 279 | **402** |
| `game` (`CLAUDE.md`) | 226 | **282** |

넷 다 "커밋 전에 반드시 통과시켜라"라고 적힌 **검증 기준선**이었다. 기준선이
낡으면 그 문장은 지시가 아니라 장식이 된다.

## 원칙

1. **세어서 다시 적는다.** 문서에 숫자를 타이핑하지 말고 스크립트가 채우게 한다.
2. **CI 는 스크립트를 돌린 뒤 파일이 바뀌었는지 본다** — 골든 정답지와 같은
   방식이다. 바뀌었다면 문서가 낡았다는 뜻이다.
3. **가능하면 테스트로 잠근다.** 수치를 문서에만 두면 아무도 안 고쳐 준다.
   테스트의 숫자는 틀리면 빨개진다.

## 구현

측정은 **도구에게 직접 묻는다** — 출력을 파싱해 추정하지 말고 목록 API 를 쓴다.

```js
// 단위 테스트 수
const r = spawnSync('npx', ['vitest', 'list', '--json'], { encoding: 'utf8' });
const unit = JSON.parse(r.stdout.slice(r.stdout.indexOf('['))).length;

// E2E 테스트 수
const p = spawnSync('npx', ['playwright', 'test', '--list'], { encoding: 'utf8' });
const e2e = Number(/Total:\s*(\d+)\s*test/.exec(p.stdout)[1]);
```

치환은 **명시적 마커**로 한다. 문장 표현에 맞춘 정규식은 문장을 고치는 순간
조용히 안 맞게 된다:

```md
단위 테스트 <!--n:unit-->402<!--/n--> 개 · E2E <!--n:e2e-->31<!--/n--> 개
```

```js
const sub = (s, key, val) =>
  s.replace(new RegExp(`(<!--n:${key}-->)[^<]*(<!--/n-->)`, 'g'), `$1${val}$2`);
```

## 자동화할 수 없는 숫자라면

**잰 날짜를 함께 적는다.** 그것만으로도 읽는 사람이 신뢰도를 판단할 수 있다.

```md
| `npm test` | 402 vitest unit tests as of 2026-08-22 |
```

성능 수치는 여기에 더해 **어떻게 쟀는지**까지 적는다 — 표본 수와 중앙값 여부가
없으면 그 숫자는 재현할 수 없다.

```md
5k 노드 실측(중앙값, 각 3~5회): 줌 36 → 106fps, 드래그 113 → 436fps
```

## 함정

- **단일 실행값을 적지 마라.** `pig` 벤치는 줌 인/아웃을 왕복해 LOD 임계값
  통과 여부에 따라 이봉분포를 보인다. 중앙값을 쓴다
- **기계가 붐빌 때 재지 마라.** load average 6.77 에서 잰 값으로 없는 성능
  퇴행을 쫓을 뻔했다
- 표본이 작으면 읽지 마라 — `game` 밸런스 하네스는 기본 5시드지만 신뢰할
  수치는 24시드 이상이다

자세한 배경은 [measure-first 플레이북](../../../playbooks/measure-first.md).
