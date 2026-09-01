---
name: incident-reproduction
description: Turn an error report, Sentry trace, or GitHub issue into a reproducible Vitest/Testing Library or Playwright scenario, verify that it fails for the reported reason, and record the evidence before proposing a fix.
---

# 운영 오류 재현

오류 보고·Sentry trace·GitHub Issue를 받으면 수정부터 시작하지 않는다. 재현 가능한
테스트와 정상 조건을 먼저 만든다.

## 입력 확인

1. 오류 유형, release, 환경, route, 발생 시각을 확인한다.
2. 쿠키·토큰·이메일·사용자 데이터 등 민감한 값은 출력과 fixture에서 제거한다.
3. trace를 Given–When–Then 단계로 바꾸고 각 단계의 정상 조건을 적는다.
4. fixture와 계정이 없으면 추측하지 말고 `needs-reproduction`으로 남긴다.

## 테스트 계층 선택

- 훅·유틸·상태 전이·DOM 분기: Vitest + Testing Library
- route·팝업·네트워크·브라우저 상호작용: Playwright
- WebGL 계산: 렌더러 밖의 순수 함수·상태 테스트
- WebGL 최종 픽셀: 기준 GPU 환경과 허용 오차가 없으면 자동 판정하지 않는다

하나의 오류에 두 계층이 필요하면 작은 단위 테스트로 원인을 고정하고 Playwright로
사용자 경로를 확인한다.

## 실행 순서

1. 기존 테스트와 프로젝트의 검증 명령을 확인한다.
2. 보고된 오류를 재현하는 최소 테스트를 작성한다.
3. 수정 전 테스트가 실패하는지 실행한다.
4. 실패 메시지가 보고된 원인과 일치하는지 확인한다.
5. 최소 범위로 수정한다.
6. 새 테스트, 관련 테스트, 전체 검증을 순서대로 실행한다.
7. 수정의 핵심 조건을 되돌려 새 테스트가 다시 실패하는지 확인하고 원복한다.

## 결과 형식

- 재현 조건
- 선택한 테스트 계층과 이유
- 수정 전 실패 결과
- 변경 내용
- 수정 후 검증 결과
- 역검증 결과
- 자동화하지 못한 범위와 이유

외부 이슈 생성, PR 생성, 배포는 사용자가 요청한 경우에만 수행한다.

배경과 전체 운영 흐름은
[`incident-to-regression`](../../../playbooks/incident-to-regression.md)을 참고한다.
