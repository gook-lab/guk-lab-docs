# 헤드리스 하네스

게임 4개에서 **각각 따로** 같은 결론에 도달했어요: 시뮬레이션이 렌더러를
모르면 게임을 브라우저·에디터 없이 검증할 수 있고, 그때부터 밸런싱이 추측에서
측정으로 바뀌어요.

## 전제 하나

**시뮬레이션 계층이 렌더러를 import 하지 않는다.**

`game/scripts/balance.js` 첫 주석이 이걸 정확히 말해줘요:

> Runs the full game simulation in Node — no renderer, no browser (…) This is
> possible only because the simulation never imports PixiJS: the whole game is
> just data + pure functions.

이 한 줄이 전부예요. 렌더러 의존이 시뮬 안으로 한 번이라도 새어 들어가면
하네스는 그날로 못 돌려요. 그래서 이건 "테스트 편의"가 아니라 **아키텍처
불변식**이고, `game`과 `dragon-game`의 `CLAUDE.md` 둘 다 이걸 최상위 규칙으로
못박아 뒀어요.

## 넷이 각각 어떻게 썼냐면요

| 프로젝트 | 하네스 | 무엇을 답해 주나 |
|---|---|---|
| `game` (Crypt Survivors) | `node scripts/balance.js [N]` — N개 시드 × 10분, 카이팅 AI | 난이도 곡선. 생존/4분내사망/중앙값/런당 골드 분포 |
| `dragon-game` (던전크래프트) | `npm run balance` — BASELINE / MERCY / RUTHLESS 3패스 | 평균 라운드·사망수. 유대(bond) 부호에 따른 빌드 편차 |
| `dragon-game-jrpg` | `dotnet run --project harness/DiffHarness` — JS 골든 코퍼스 vs C# 출력 차등 비교 | 포팅한 C# 전투가 원본 JS와 **비트 동일**한가 |
| `spire-godot` | `godot -- --shot=<모드>` — 실제 게임을 띄워 특정 화면/전투를 만들고 캡처 | 그 화면이 실제로 어떻게 보이는가 |

`dragon-game-jrpg`의 차등 하네스가 가장 멀리 간 형태예요. `Core/`를 의존성
없이 쓰고 **이중 빌드**(Unity asmdef + `harness/Core.csproj`)해서, Unity를 열지
않고도 전투 수학을 검증해요. JS 쪽에서 `golden/*.json`을 뽑아두고 C# 출력과
diff 하죠 — 포팅이 "돌아간다"가 아니라 "원본과 같다"를 증명하는 거예요.

## 규칙

**시드를 고정해요.** 결정적이지 않으면 하네스는 밸런스가 아니라 잡음을 재요.
`game`은 시드 기반이라 같은 시드가 같은 런을 재생해요. 다만 **표본이 작으면
읽지 않는 게 좋아요** — `game/CLAUDE.md`는 신뢰할 수치를 얻으려면 24개 이상
시드를 쓰라고 적어뒀어요 (기본값 5는 빠른 확인용이에요).

**하네스를 두 갈래로 나눠요 — 그림이 필요한 것과 아닌 것.** `spire-godot`이
여기서 값을 치렀어요: 헤드리스에는 렌더 결과가 없어서 `frame_post_draw`를
기다리다 **조용히 무한 대기**에 걸렸거든요. 지금은 캡처만 건너뛰고 크게
알려요. 반대로 그림이 필요 없는 검증(카드가 실제로 무슨 일을 하는가)은
헤드리스가 더 빠르고 창도 안 뺏어요.

**오디오 드라이버를 명시해요.** 창 모드로 촬영할 땐 `--audio-driver Dummy`.
반대로 `rhythm-godot`은 통합 씬에서 `--audio-driver CoreAudio`가 **필수**예요 —
기본 Dummy로 돌리면 -4% 드리프트가 생겨서 리듬 판정이 통째로 틀어져요. 같은
엔진에서 정반대 요구가 나온다는 게 요점이에요: **하네스가 무엇을 재는지에 따라
달라요.**

**엔진 실행 모드의 함정을 문서에 박아둬요.** `rhythm-godot`: `--script` 모드엔
autoload가 없어서 통합 테스트는 씬으로만 돌아가요. `spire-godot`: user args
앞에 `--` 구분자가 필요해요. 이런 건 한 번 겪고 잊으면 다음에 똑같이 30분을
태우거든요.

**생성물은 커밋하지 않고 생성 스크립트를 커밋해요.** `rhythm-godot`은 `.wav`와
`*.expected.json`을 gitignore 하고 `./tools/gen_all.sh`로 재생성해요 — 새로
클론하면 이걸 먼저 돌려야 해요.

## 이 패턴을 안 쓰는 프로젝트

`pig` 같은 앱은 렌더러가 곧 제품이라 이 분리가 성립하지 않아요. 대신 같은
목적을 Playwright + CDP 프로파일러로 달성해요 —
[measure-first](measure-first.md) 참고.
