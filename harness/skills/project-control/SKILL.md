---
name: project-control
description: Audit guk-lab projects from project manifests, create fleet health reports, prepare compact agent context, compare portfolio metadata, and generate incident or release checklists.
---

# 프로젝트 운영 검사

여러 프로젝트의 품질·문서·배포 정보를 확인할 때 저장소를 각각 열어 추측하지 않고
`project-manifests/*.project.yml`을 먼저 읽습니다.

## 명령

```bash
node scripts/project-control.mjs audit pig-ma
node scripts/project-control.mjs validate
node scripts/project-control.mjs fleet
node scripts/project-control.mjs verify pig-ma
node scripts/project-control.mjs links
node scripts/project-control.mjs context portfolio
node scripts/project-control.mjs sync
node scripts/project-control.mjs incident pig-ma "내보내기 실패"
node scripts/project-control.mjs readiness dungeon-craft
```

`audit`과 `fleet`은 코드를 변경하거나 검증 명령을 실행하지 않습니다. 파일과 설정의
존재 여부를 읽어서 보고합니다. 실제 테스트·빌드 실행은 프로젝트의 작업 범위와 현재
변경사항을 확인한 뒤 `verify`로 수행합니다. `links`는 공개 저장소와 데모에 실제 HTTP
요청을 보내므로 네트워크 검사가 필요할 때만 사용합니다.

## manifest 갱신

- 저장소·데모·기술·명령은 확인한 값만 기록합니다.
- 로컬 경로는 이 저장소를 기준으로 한 상대 경로를 사용합니다.
- JSON은 YAML 1.2의 일부이므로 별도 패키지 없이 읽을 수 있도록 JSON 문법으로 씁니다.
- 프로젝트 코드와 함께 변하는 설명은 manifest에 복사하지 않고 해당 저장소 문서를
  가리킵니다.
