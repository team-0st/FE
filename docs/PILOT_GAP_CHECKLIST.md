# 파일럿 기능 Gap 체크리스트

> 고금숙(알맹) 메일 기능 목록 · Notion 보상안 대비 FE 상태 (2026-07-10)

## 범례

- ✅ 완료
- ⚠️ 부분 / mock
- ❌ 미구현
- 🔒 P0 보류 (공용 파일 — 팀 합의 후)

---

## 구현된 기능 (메일 기준)

| # | 기능 | 상태 | 비고 |
|---|------|------|------|
| 1 | 회원·인증·동의 | ✅ | `/onboarding/profile` |
| 2 | 온보딩 샵 선택 | ✅ | 파일럿 **마포점** 기본값 (`pilotShop.ts`) |
| 3 | 홈 (출석·미션·힌트) | ✅ | `WitchSoupHomeScreen` |
| 4 | 미션·사진 인증 | ✅ | 검수 mock / DEV 자동승인 |
| 5 | 마녀스프 제작 | ⚠️ | UI·mock 있음, **보상 구조는 Notion 최종안과 불일치** 🔒 |
| 6 | 가챠 (100잼) | ✅ | 독립 가챠 mock |
| 7 | 레시피·마이 | ✅ | |
| 8 | 주변 상점 | ✅ | `/shop/partners`, 좌표 approximate |

## 추가 검토 기능

| 기능 | 상태 | 비고 |
|------|------|------|
| A. SNS 공유 + 리워드 | ✅ | 하루 1회 에코잼 30 mock (`shareRewardPolicy.ts`) |
| B. 공동 미션·목표 | ⚠️ | `COOP_MISSIONS` + `CommunityGoalSection` mock, BE 집계 없음 |

---

## Notion 보상안 (최종) — FE 정합 🔒 P0 보류

| 항목 | Notion | FE | 조치 |
|------|--------|-----|------|
| 일반 스프 5등급 | 대박~꽝 확률표 | 70% 성공/실패 | `soupCraftMock.ts` 팀 합의 후 |
| 히든 확정+가챠 | 500P+300잼 + 추가 뽑기 | REAL_ITEM 일괄 | 동일 |
| 전설 확정+가챠 | 1500P+500잼+뱃지 | REAL_ITEM 일괄 | 동일 |
| 에코잼 소모처 | 50~1000 표 | 가챠 100만 | `ecoJamPolicy` 팀 합의 후 |

---

## 에셋

| 항목 | 상태 | 비고 |
|------|------|------|
| 앱인토스 브랜드 아이콘 | ⚠️ | `granite.config.ts` 로컬 로고 경로 |
| 새싹·마녀 일러스트 | ✅ | TDS `Asset.Icon` (`icon-leaf-mono`) |
| 가챠·스프·재료 일러스트 | ✅ | TDS Asset — gift / food / Text+이모지 |
| 재료 이미지 (전체) | ⚠️ | 이모지 + `Asset.Text` (Kit PNG 대기) |
| Figma TDS 와이어 | ✅ | v4 + `docs/TDS_FIGMA_MAPPING.md` |
| 콘솔 스크린샷 | ✅ | `assets/apps-in-toss-console/` |

---

## 알맹 협업 대기

| 항목 | 상태 |
|------|------|
| 샵 운영자 기능 우선순위 회신 | ⏳ 금자님 내부 논의 후 |
| 포인트 지급 프로세스 | 오프라인 전화번호 (앱은 적립만) |

---

## 다음 작업 (P0 제외)

1. 금자님 회신 반영 → in/out 기능 분리
2. Figma 화면 재빌드·검증
3. 디자인 수령 시 일러스트·재료 PNG 적용
4. P0 보상안 — 팀 sync 후 `soupCraftMock` / `probabilityInfo` / `ecoJamPolicy` 일괄 수정
