# 웹 최적화 룰 — 이미지 · 폰트 · 코드

토이 레포 전수 점검(2026-08-24)에서 확정한 최적화 규칙입니다. 원칙은
[measure-first](measure-first.md)와 같습니다 — **재보고 나서, 이득이 실측되는
것만 합니다.**

## 이미지 — WebP가 기본, 픽셀아트는 예외

- **스크린샷·사진·일러스트는 WebP로 저장합니다** (품질 ~82). 특히 200KB를
  넘는 PNG/JPG는 전환 대상입니다. GitHub README·문서 임베드도 WebP를
  그대로 렌더링합니다.
- **픽셀아트·스프라이트·타일셋은 PNG를 유지합니다.** 게임 에셋은 파일당
  수 KB라 전환 이득이 없고, 무손실 보존과 파이프라인(아틀라스·팔레트)이
  PNG 전제입니다. 실측: `game` 스프라이트 2,895개 합계 5.7MB — 개별 평균
  2KB로 전환 실익 없음.
- 실측 사례: **nihongo-app** — 200KB+ 이미지 14개를 WebP로 전환해
  추적 이미지 총량 **11.8MB → 5.4MB (−54%)**, 참조 전수 갱신 후 build 통과.
- 전환 도구: `cwebp` 또는 `npx sharp-cli -f webp -q 82`. 전환 후
  `git grep <옛파일명>`으로 참조 잔존 0을 확인하고 원본은 `git rm` 합니다.
- 투명도가 필요한 UI 에셋은 WebP lossless 또는 PNG 유지를 케이스별로
  판단합니다.

## 폰트

- 웹폰트는 **woff2 단일 포맷**이면 충분합니다 (전 브라우저 지원).
- 쓰는 글리프가 좁으면 서브셋을 고려하되, 이것도 용량을 재보고 결정합니다.

## 코드

- **추측성 최적화는 하지 않습니다** — [fe-radio](fe-radio.md)의 O 단계 규칙
  그대로, NFR에서 도출된 항목만 손댑니다. 병목은 프로파일로 확인합니다
  (pig 사례: 짐작한 persist 7% vs 실범인 zoom 구독 리렌더 35%+).
- 죽은 코드 제거·의존성 정리는 **번들 diff(gzip Δ)로 미포함을 확인한 뒤**
  지웁니다.
- 무거운 선택 기능(PDF 내보내기 등)은 dynamic import로 분리합니다.
- 폴링·타이머는 `document.hidden` 게이트를 겁니다 (pulse-dashboard 규약).

## 점검 커맨드

```bash
# 200KB 이상 추적 이미지 찾기
git ls-files -z | grep -zE '\.(png|jpe?g)$' \
  | xargs -0 stat -f '%z %N' | awk '$1>200000' | sort -rn

# 레포별 이미지 총량
git ls-files -z | grep -zE '\.(png|jpe?g|webp)$' \
  | xargs -0 stat -f '%z' | awk '{s+=$1} END {printf "%.1fMB\n", s/1048576}'
```
