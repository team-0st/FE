# BE 전달 사항 (FE 마무리 기준)

> FE `feat/align-fe-notion-api-spec` 기준. Notion [DB](https://app.notion.com/p/38a4b87320c780859934c5cdd5facc66) · [API](https://app.notion.com/p/49e4b87320c782618efa81c5529b2bc7) 대비 **백엔드에서 추가·확정**이 필요한 항목.

## 1. Notion에 없지만 FE·운영에 필요 (신규 API/테이블)

| 우선순위 | 항목 | FE 기대 |
|---|---|---|
| P0 | **전화번호·알맹 포인트 동의** | `Users`: `phone_enc`, `phone_masked`, `almang_payout_consent`, `consent_at`, `consent_version` |
| P0 | **알맹 포인트 원장** | 적립(`accrued`) / 매장 지급(`paid_out`) 분리. `Profile` 또는 `/api/almang-points` |
| P0 | **매장 방문 지급 Admin** | `POST /api/admin/almang-payout` — 본인 확인 후 차감·지급 기록 |
| P1 | **닉네임 금칙어** | `POST /api/onboarding/complete` 시 `409 NICKNAME_NOT_ALLOWED` + 메시지 (최종 검증 BE) |
| P1 | **OTP/전화번호 검증** | 동의 시 SMS OTP (FE는 번호 입력·동의 UI만) |

## 2. Notion 명세 있음 — BE 구현·FE 연동 대기

| API | FE 상태 | BE 필요 |
|---|---|---|
| `POST /api/users/register` | mock (`src/api/users.ts`) | deviceId → userId 매핑, 응답 그대로 |
| `X-Device-Id` 헤더 | `getDeviceIdHeader()` 준비 | 모든 API(register 제외) 검증 |
| `POST /api/onboarding/complete` | 로컬 only | nickname + shopId + (phone/consent) 저장 |
| `POST /api/missions/{id}/verify` | PENDING/ DEV 자동승인 mock | multipart `photo`, PENDING 반환 |
| `GET /api/missions/completions` | 빈 mock | 검수 결과·재료 지급 상태 |
| `PATCH /api/admin/mission-completions/{id}` | FE 없음 | 승인/반려 + 재료 지급 |
| `GET /api/check-in/status` | 앱 기동 시 mock 호출 | 서버 출석 여부 |
| `POST /api/check-in` | mock | 1일 1회·랜덤 재료 |
| `GET /api/profile` | 로컬 state | ecoJam, ingredients, **알맹 포인트·동의 상태** 포함 권장 |
| `GET /api/eco-jam/history` | 로컬 ledger | `source_id` 포함 원장 |
| `POST /api/soup/craft` | mock | DUPLICATE, 확률, 1회 제한 |
| `POST /api/gacha` | mock | 비용 100 에코잼 (FE 확정값) |

## 3. Notion 보완(스펙 갭)

- **Profile 응답**에 `totalAlmangPoints`, `almangPointsPayable`, `almangPayoutConsent`, `phoneMasked` 추가
- **레시피** 입문 2 · 전설 5칸 — `GET /api/recipes` 범위 명시
- **스프 결과 조회** 경로: Notion `GET /api/soup/{soupId}` (FE `API_PATHS` 반영 완료)
- **미션** 하루 1회 — `todayStatus` 날짜 기준 리셋 정책 BE에서 처리
- **가챠 비용** — FE 100 에코잼 (Notion "미정" → 확정 필요)

## 4. FE에서 BE 붙일 때 교체할 파일

- `src/api/users.ts` — register
- `src/api/missions.ts` — verify, completions
- `src/api/checkIn.ts` — check-in, status
- `src/api/soup.ts`, `src/api/gacha.ts` — 실 HTTP
- `src/features/user/UserProvider.tsx` — 초기 sync, verify PENDING 폴링(선택)

## 5. 정책 확정 요청 (BE·기획)

1. 알맹 포인트: **동의 거부 사용자** 매장 방문 시 당장 동의 후 지급 vs 수기만  
2. 개인정보 **보유 기간** (현재 FE 카피: 3년 — 법무 확인)  
3. 미션 검수 SLA (푸시/알림톡 연동 여부)  
4. 실물 리워드(`REAL_ITEM`) 수령 프로세스 — `pendingRealRewards` 대응 테이블

---

*작성: FE 기준 자동 정리. BE 레포 연동 시 이 문서를 Notion API 명세 하단에 붙여넣기 권장.*
