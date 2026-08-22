# 시작하기

레포 하나를 받아 돌리기까지. **함정을 먼저 적었다** — 대부분의 시간은 설치가
아니라 함정에서 날아간다.

## 전부 한 번에 받기

```bash
git clone https://github.com/gook-lab/guk-lab-docs.git
cd guk-lab-docs
./clone-all.sh              # workspace/ 아래로 9개 clone
./clone-all.sh --status     # 상태만 확인
```

`workspace/` 는 gitignore 된다. git 레포 안에 git 레포를 그냥 넣으면 바깥
레포가 안쪽을 반쯤 추적하다 깨지기 때문이다.

## 프로젝트별 실행

전제: **Node 18 이상.** 대부분 `npm`, 두 개는 `pnpm` 을 쓴다.

| 프로젝트 | 패키지 매니저 | 개발 서버 | 추가 요구 |
|---|---|---|---|
| `pig-ma` | npm | 3874 | — |
| `crypt-survivors` | npm | 7153 | — |
| `dungeon-craft` | npm | 9153 | — |
| `osm-walker` | npm | 3000 | — |
| `myeongni-seojae` | **pnpm** | 기본(5173) | — |
| `pulse-dashboard` | **pnpm** | 5180 | 백엔드 프록시 별도 기동 |
| `nihongo` | npm | 5000 | `.env` 10개 (Firebase · Gemini) |
| `couple-map` | npm | 6173 | `.env` 6개 (Firebase · 카카오지도) |
| `rhythm-godot` | — | — | Godot 4.7 |

```bash
cd workspace/<프로젝트>
npm install     # 또는 pnpm install
npm run dev
```

### 키가 필요한 둘

`nihongo` 와 `couple-map` 은 `.env` 없이는 로그인부터 막힌다. 각 레포의
`.env.example` 을 복사해 채운다. **키는 각자 발급받아야 한다** — 레포에는
없다(있으면 그게 사고다).

`pulse-dashboard` 는 프론트만 띄우면 실시간 데이터가 안 온다. 백엔드 프록시를
같이 띄워야 하고, KIS 모의계좌 키가 있어야 체결/호가가 흐른다. 키 없이도 화면
구조는 볼 수 있는데 **실데이터가 없는 자리는 목이 아니라 `-` 로 표시된다** —
의도된 동작이다.

### Godot 프로젝트

`rhythm-godot` 은 Godot 4.7 이 필요하다. 클론 직후에 생성물부터 만들어야 한다:

```bash
./tools/gen_all.sh    # wav · *.expected.json 은 gitignore 다
```

⚠️ **통합 씬은 `--audio-driver CoreAudio` 로 돌린다.** 기본 Dummy 드라이버는
-4% 드리프트가 생겨 리듬 판정이 통째로 틀어진다.
⚠️ `--script` 모드에는 autoload 가 없다 — 통합 테스트는 씬으로만 돌아간다.

## 검증 돌려보기

각 레포에는 커밋 전에 통과시켜야 하는 검증이 있다.

```bash
npm test                # 대부분
npx vitest run          # 명시적으로
npx playwright test     # E2E 가 있는 레포 (pig-ma, myeongni-seojae)
```

`pig-ma` 는 lint 게이트가 따로 있다:

```bash
npm run lint:gate       # 신규 위반만 검사 (기존 부채는 베이스라인 통과)
```

> ⚠️ **파이프 뒤에서 종료코드를 읽지 말 것.** `npm test | tail` 은 `$?` 가
> tail 의 코드라 **실패가 0으로 보인다.** 모든 검증 커맨드에 해당한다.
> CI·훅에 붙일 땐 `set -o pipefail` 을 켜거나 파이프 없이 직접 실행한다.

## 게임 밸런스 하네스

`crypt-survivors` 와 `dungeon-craft` 는 브라우저 없이 게임을 돌려 난이도를 잰다.

```bash
node scripts/balance.js 24   # crypt-survivors — 24개 시드
npm run balance              # dungeon-craft — 3패스
```

기본 시드 수는 빠른 확인용이다. **신뢰할 수치를 원하면 24개 이상** 돌린다.

## 흔한 함정

**Tailwind v4 는 `tailwind.config.js` 를 안 쓴다.** `src/index.css` 의
`@theme` 을 쓴다. shadcn CLI 가 v4 와 호환되지 않아 컴포넌트는 수동 설치했다.
(`nihongo`)

**Framer Motion + Tailwind width** — `flex items-center justify-center` 부모
안의 `motion.div` 에서 `w-full` / `max-w-sm` 이 무시될 수 있다. 증상은
**텍스트가 세로로 한 글자씩** 나오는 것(width 가 0에 수렴). 인라인 스타일로
지정한다. (`nihongo`)

**HTML 오버레이의 zoom** — `fontSize × zoom` 을 하면 이중 스케일링이 된다.
CSS `transform: scale()` 을 쓴다. (`pig-ma`)

**Playwright 의 `addInitScript` 는 `reload()` 에서도 다시 돈다.**
`localStorage.clear()` 를 거기 넣어 두면 새로고침 테스트가 스스로 데이터를
지운다. 앱이 데이터를 날린 줄 알고 반나절을 날린 적이 있다.

## 문서 검사

문서를 고쳤으면 링크가 살아 있는지 본다:

```bash
node <허브>/harness/skills/audit-docs/check-docs.mjs
```

죽은 링크 · 없는 경로 · 헤더 없는 표를 잡는다. 자세한 건
[audit-docs 스킬](../harness/skills/audit-docs/SKILL.md).
