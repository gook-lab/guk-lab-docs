# 프로젝트 manifest

여러 문서에 반복되는 프로젝트 식별 정보와 검증 명령을 한곳에서 관리합니다. 코드와
함께 바뀌는 설계 설명은 넣지 않고 해당 프로젝트의 문서 경로만 기록합니다.

## 필드

| 필드 | 용도 |
|---|---|
| `id` | CLI에서 사용하는 고유 이름 |
| `name` | 보고서에 표시할 이름 |
| `localPath` | 이 저장소를 기준으로 한 프로젝트 상대 경로 |
| `repository` | `.git`을 제외한 원격 저장소 URL |
| `demo` | 공개 데모 URL. 데모가 없으면 생략 |
| `status` | `active`·`maintenance`·`archived` 중 하나 |
| `visibility` | 비공개 저장소만 `private`로 표시. 생략하면 `public` |
| `catalog` | `false`이면 `projects.md` 등재 검사에서 제외 |
| `stack` | 확인한 주요 기술 목록 |
| `commands` | 프로젝트가 제공하는 검증 명령 |
| `docs` | 작업 전에 확인할 프로젝트 문서와 디렉터리 |
| `metadataSources` | 저장소·데모 링크를 대조할 프로젝트 문서 |
| `portfolio.featured` | 포트폴리오 한·영 프로젝트 데이터 등재 여부 |

파일은 YAML 1.2와 호환되는 JSON 문법으로 작성합니다. 이를 통해 외부 YAML 파서 없이
Node.js만으로 검사할 수 있습니다.

## 프로젝트 추가

1. `<id>.project.yml`을 추가합니다.
2. `node scripts/project-control.mjs audit <id>`로 경로와 명령을 확인합니다.
3. `node scripts/project-control.mjs sync`로 프로젝트 지도와 원본 문서를 대조합니다.
4. `node scripts/project-control.mjs fleet`으로 전체 리포트를 다시 만듭니다.
