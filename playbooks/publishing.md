# 공개 전 체크리스트

토이 프로젝트를 GitHub에 올리기 전에 확인할 것들이에요. 이 목록은 실제로
`~/sonix/toy` 15개를 전수 점검하며 걸린 것들로 만들었어요 (2026-08-22).

## 순서가 중요해요

**히스토리에 한 번 들어간 것은 `.gitignore`로 못 지워요.** `git rm --cached`를
해도 과거 커밋에는 그대로 남거든요. 그래서 위험한 것을 먼저 확인하고, 첫 커밋
전에 막아야 해요. 이미 들어갔다면 선택지는 두 개뿐이에요 — `git filter-repo`로
히스토리를 다시 쓰거나, 에셋을 뺀 **새 히스토리로 다시 시작**하거나.

## 1. 상용 에셋 — 가장 흔하고 가장 비싸요

Unity 에셋 스토어 유료 패키지는 **EULA상 재배포가 금지**돼요. 공개 레포에
올리는 것은 재배포예요. 게임 프로젝트를 올릴 땐 이걸 먼저 봐요.

```bash
git ls-files | grep -iE "Assets/(.*Pack|.*Kit|SmallScaleInt|Synty|.*Studios)" \
  | sed 's|/[^/]*$||' | sort -u | head
```

토이에서 걸린 것:

| 프로젝트 | 커밋된 패키지 |
|---|---|
| `dragon-game-unity` · `dragon-game-jrpg` | Blackthornprod *100 Fantasy Characters Pack* |
| `zombie-unity` | SmallScaleInt *2D Zombie City Tile pack 1* · Character Creator Modern |

셋 다 **히스토리에 있어서** 지금 상태로는 공개가 안 돼요.

### 필터링을 고민하기 전에 자체 코드 비율부터 재요

에셋이 히스토리에 있으면 반사적으로 `git filter-repo`를 떠올리게 되는데,
**먼저 무엇이 남는지 세어보는 게 좋아요.**

```bash
total=$(git ls-files | wc -l)
own=$(git ls-files "Assets/Game" "Assets/Scenes" ProjectSettings Packages | wc -l)
echo "자체 $own / 전체 $total"
```

토이 Unity 3종 실측 (2026-08-22):

| 레포 | 자체 / 전체 |
|---|---|
| `dragon-game-unity` | 282 / 15,260 — **1.8%** |
| `dragon-game-jrpg` | 161 / 17,937 — **0.9%** |
| `zombie-unity` | 37 / 6,181 — **0.6%** |

98%를 걷어내는 건 필터링이 아니라 **새로 만드는 것**이에요. 이 비율이면
`filter-repo`로 1 GB 히스토리를 몇 시간 갈아봐야, 거의 모든 커밋이 삭제된
파일만 건드린 껍데기가 돼요. 자체 코드만 담은 **새 히스토리**로 시작하고
에셋은 각자 스토어에서 받게 안내하는 편이 정직하고 빨라요.

**그리고 결정을 그 레포 README에 남겨요.** 나중에 무심코 원격을 붙이는 걸
막아주거든요.

## 2. 저작물 — 디컴파일·추출 산출물

`spire-godot`은 Slay the Spire 2의 C# DLL을 디컴파일해 파싱한 데이터·이미지를
포함해요(© Mega Crit). 프레임워크는 MIT, codex 코드는 PolyForm Noncommercial,
**게임 데이터와 아트는 원작사 저작물** — 세 라이선스가 한 레포에 섞여 있죠.

2026-08-18에 **공개 제외**로 결정하고 그 레포 README에 근거와 함께 기록해뒀어요.
추적 파일 12,723개 중 이미지·폰트·오디오가 10,643개, 팩 1.19 GiB이에요.

> 결정을 내렸으면 **그 레포 README에 적어요.** 6개월 뒤에 다시 판단하지 않아도
> 되고, 다른 사람(또는 에이전트)이 무심코 원격을 붙이는 것도 막아줘요.

## 3. 용량

| 한도 | 값 |
|---|---|
| 파일 하나 | **100 MB 하드 한도** (50 MB 부터 경고) |
| 레포 전체 | 1 GB 권장, 5 GB 강력 권장 상한 |

```bash
du -sh .git                 # 팩 크기
git ls-files | wc -l        # 추적 파일 수
```

토이에서는 `spire-godot` 11 GB, `dragon-game-unity` 1.4 GB, `dragon-game-jrpg`
1.1 GB였어요. 나머지는 전부 30 MB 미만이라 문제없어요.

## 4. 비밀정보

**첫 커밋 전에** `.gitignore`가 `.env`를 막는지 확인해요. 이미 커밋했다면
파일을 지우는 걸로 끝나지 않아요 — **그 키는 유출된 것이므로 폐기하고
재발급해야 해요.**

```bash
# 커밋된 키 파일
git ls-files | grep -iE "\.env$|\.env\.|credential|secret|serviceAccount|\.pem$|\.key$"

# 소스에 박힌 키
grep -rInE "(AIza[0-9A-Za-z_-]{30,}|sk-[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{30,}|figd_[A-Za-z0-9_-]{20,})" \
  --include="*.ts" --include="*.tsx" --include="*.js" --include="*.json" . \
  | grep -v node_modules | grep -viE "example|placeholder|YOUR_"
```

토이 점검 결과: 소스에 박힌 키 **0건**이었어요. `nihongo-app` / `couple-app`에
실제 `.env`가 있지만 둘 다 `.gitignore`로 막혀 있어요. `3d-map` / `game`은
`.env` 자체가 없지만 `.gitignore`에 항목이 없어서, git init 전에 넣어두는 게
맞아요.

## 5. 벤더링된 서드파티

남의 코드를 통째로 담고 있는 디렉토리는 올리지 않고 **링크로 대체**해요.

| 위치 | 무엇 |
|---|---|
| `nihongo-app/.agents/skills/` | Vercel 스킬팩 (md 108개) |
| `sample/` | Three.js 데모 클론 (minecraft / simcity / isometric-rpg) |
| `spire-godot/references/` | 3.6 GB — 이미 gitignore 됨 |

## 6. 회사 문서가 섞여 들어가지 않았는지

토이 프로젝트 폴더에 **회사 문서**가 굴러다니는 경우가 있어요. `couple-app/`에
회사 인사평가 입력용 성과목표 문서 3건이 들어 있었어요 — 개인 공개 레포에
들어가면 안 되는 것들이죠. git init 전에 발견해서 `.gitignore`로 막았어요.

```bash
grep -rliE "성과목표|인사평가|평가|사내|대외비|confidential" --include="*.md" . | grep -v node_modules
```

## 7. 도구 산출물

`.gstack/` 같은 도구 출력이 실수로 추적되는 일이 있어요 (`dragon-game`에서
`public/structures/.gstack/browse-audit.jsonl` 1건 발견). 첫 커밋 전에
`.gitignore`에 넣어요.

## 8. 개인정보

이력서·계약서·건강 기록 같은 건 토이 폴더에 섞여 있어도 **레포에는 안
들어가요.** `~/sonix/toy/이력서 파일 정리 및 제안/`이 그 예에요.

## 9. 회사 코드와 섞이지 않았는지

`~/sonix/` 아래에는 `be`, `fe`, `dicom` 같은 **회사 프로젝트**가 있어요. 개인
계정으로 푸시하는 작업에서는 경로를 `toy/`로 명시적으로 한정해요.

## 첫 푸시 직전 최종 확인

```bash
git status --short          # 의도치 않은 파일이 스테이징됐나
git ls-files | wc -l        # 파일 수가 예상 범위인가
du -sh .git                 # 용량
git log --oneline | head    # 커밋 메시지에 비밀정보가 없나
```

## 공개 후

`main` 브랜치 보호 규칙을 걸어요 — 직접 푸시 금지, PR 필수, 리뷰 승인 요구.
`gh api`로 배선할 수 있어요.
