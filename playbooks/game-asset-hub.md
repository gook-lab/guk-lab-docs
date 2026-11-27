# 게임 공용 에셋 허브 — 묶음 카탈로그 · Release zip · 골라 받기

새 게임을 시작할 때마다 KayKit · Kenney 팩을 다시 받고, 예전 게임 레포에서
그림과 소리를 손으로 복사했습니다. 출처와 라이선스는 복사하는 순간 사라졌습니다.
2026-11-27 에 이 일을 한 저장소로 모았습니다. 비공개 저장소
`gook-lab/feys-game-assets` 와 갤러리 화면
[feys-assets.vercel.app](https://feys-assets.vercel.app) 입니다.

## 저장 구조 — 목록은 git, 원본은 Release

| 위치 | 담는 것 | 크기 상한 |
|---|---|---|
| `bundles/<id>/bundle.json` | 묶음 정보 — 출처 · 라이선스 · 파일별 sha256 · 분류 · 화풍 | — |
| `bundles/<id>/` | 라이선스 원문 · 표지 · 항목별 미리보기(webp · png · ogg · json) | 파일당 96KB |
| GitHub Release `<id>@<version>` | 원본 zip 한 개(라이선스 문서 포함) | — |
| `.store/<id>/` | 묶기 전 원본 스테이징(gitignore) | — |

- git 에 원본을 넣지 않은 까닭은 용량입니다. 첫 적재의 zip 합계가 160.8MB 였고,
  미리보기까지 넣은 `bundles/` 는 34MB 입니다.
- zip 은 같은 내용이면 같은 바이트가 나오게 묶습니다(수정 시각 고정, `zip -X`).
  카탈로그의 sha256 이 다르면 내용이 바뀐 것입니다.
- 묶음 내용을 바꾸면 버전을 올립니다. 라이선스 문서도 zip 에 들어 있어서,
  문구만 고쳐도 새 버전이 됩니다(`rhythm-godot-music` 1.0.1).

## 받기 — fetch.mjs · 잠금 파일 · 출처 표기

게임 레포 루트에서 묶음과 경로 패턴을 골라 받습니다.

```sh
node ~/sonix/toy/feys-game-assets/tools/fetch.mjs \
  kaykit-skeletons:'**/*.glb' kenney-ui-audio --to public/assets
```

- 결과는 `<to>/<id>/<경로>` 에 놓이고, 게임 레포에 `assets.lock.json` 과
  `ASSET-CREDITS.md` 가 생깁니다. 크레디트 화면은 이 파일에서 만들면 됩니다.
- `.gltf` 를 고르면 그 파일이 가리키는 `.bin` · 텍스처도 같이 받습니다.
  묶을 때 glTF 의 `uris` 를 카탈로그에 적어 두기 때문입니다.
- zip 은 `~/.cache/feys-game-assets` 에 한 번만 받고 sha256 을 대조합니다.
- `GH_TOKEN` 이 없으면 `gh auth token -u gook-lab` 을 씁니다. 세션마다 gh 활성
  계정이 바뀌어도 받기와 올리기가 같은 계정으로 돌아갑니다.

## 넣기 — 묶음 추가 순서

1. `.store/<id>/` 에 원본을 둡니다.
2. `bundles/<id>/bundle.json` 에 출처 · 라이선스 · 분류 · 화풍을 적고 라이선스 원문을 둡니다.
3. `node tools/pack.mjs <id>` 로 zip 을 묶고 files · release 를 채웁니다.
4. `node tools/publish.mjs <id>` 로 Release 를 만듭니다.
5. `node tools/previews.mjs <id>` 로 미리보기를 만듭니다.
6. `node tools/index.mjs && node tools/check.mjs` 로 목록을 다시 만들고 검사합니다.

`check.mjs` 는 CI 에서도 돕니다. 라이선스 허용 목록 밖, 표기 문구 누락,
96KB 넘는 미리보기, 오래된 `CATALOG.md` 를 실패로 처리합니다. 병합하다
`CATALOG.md` 가 충돌하면 손으로 고치지 않고 `node tools/index.mjs` 로 다시
만듭니다.

## 라이선스 허용 목록 — 다섯 종

| 라이선스 | 표기 문구 | 첫 적재 묶음 수 |
|---|---|---|
| `CC0-1.0` | 선택 | 37 (KayKit 무료 등급 25 · Kenney 9 · Meshy 커뮤니티 2 · 기타 1) |
| `LicenseRef-gook-lab` | 없음 | 24 (gook-lab 게임 8개에서 모은 자체 제작) |
| `OFL-1.1` | 필수 | 1 (Galmuri 글꼴) |
| `MIT` | 필수 | 1 (픽셀 이펙트) |
| `CC-BY-4.0` | 필수 | 0 |

- KayKit 은 무료 등급만 넣었습니다. 유료 EXTRA · SOURCE · Series · Complete 는
  재배포할 수 없어서 넣지 않았습니다.
- `LicenseRef-gook-lab` 은 gook-lab 게임 안에서만 쓰는 묶음입니다. 갤러리는 이
  묶음에 「gook-lab 게임 안에서만 써요」 안내를 붙입니다.
- 파일별 출처 기록이 없는 것은 넣지 않았습니다(osm-walker 3D 모델).

## 갤러리 — 미리보기만 담은 정적 위키 화면

`site/`(Vite + React, 해시 라우팅)는 `bundles/**` 의 목록 · 미리보기 · 표지만
읽습니다. 분류 · 화풍 · 검색으로 찾고, 묶음 문서에서 받기 명령을 복사합니다.

- 배포는 `site/dist` 를 레포 밖 폴더로 복사해 그 폴더에서 `vercel deploy --prod`
  로 합니다. 공개 주소에는 미리보기와 목록만 올라가고, 원본 zip 은 비공개
  Release 에 남습니다.
- `vercel link` 를 하면 배포 폴더에 OIDC 토큰이 든 `.env.local` 이 생깁니다.
  지운 뒤 올리고, 배포 뒤 `/.env.local` 이 404 인지 확인했습니다.
- 묶음을 더하면 갤러리를 다시 배포해야 화면에 나타납니다.

## 첫 적재에서 틀린 지점 — 2026-11-27

- **불러오기만 해도 묶기가 돌았습니다.** `pack.mjs` 의 CLI 코드가 모듈 맨 위에
  있어서 `publish.mjs` 가 가져오는 순간 실행됐습니다. `process.argv[1]` 이 그
  파일일 때만 돌도록 막았습니다.
- **받을 파일 수가 실제보다 적게 찍혔습니다.** glTF 의존 파일을 더하기 전에
  개수를 셌기 때문입니다. 의존 파일을 먼저 더하고 세도록 순서를 바꿨습니다.
- **올리기만 실패했습니다.** 받기 도구에만 gook-lab 토큰 대체 경로가 있었고,
  올리기 도구는 gh 활성 계정을 그대로 썼습니다. 두 도구가 같은 함수를 쓰도록
  `tools/lib/catalog.mjs` 로 옮겼습니다.
- **작업 트리를 지우자 원본 스테이징도 사라졌습니다.** `git worktree remove` 는
  gitignore 된 `.store/` 를 함께 지웁니다. 묶음 하나를 고치려고 Release zip 을
  다시 받아 `.store/` 를 되살렸습니다. Release 가 원본의 정본이라 복구할 수
  있었습니다.
