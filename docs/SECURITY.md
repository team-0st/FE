# FE / BE 보안 현황

> 앱인토스 미니앱(FE) + Spring BE 기준.  
> 아래 체크리스트 중 **대부분이 BE·인프라 책임**이며, FE에 “있었다”고 단정할 수 없는 항목은 ❌.

범례: ✅ 있음 · ⚠️ 부분 · ❌ 없음 · 🔒 BE/인프라 전담

---

## 1. 에러·로깅

| 항목 | FE | BE (미검증/추정) |
|------|----|------------------|
| AppError / 에러 타입 분리 | ⚠️ `ApiClientError` + 화면별 토스트 코드 | 🔒 envelope `{ success, error.code }` |
| 전역 핸들러 | ❌ | 🔒 |
| RequestID | ❌ | 🔒 (응답에 없음 — 미검증) |
| 에러 노출 차단 | ⚠️ API 실패를 사용자 문구로 축약 (코드 혼동 이슈 #9) | 🔒 |
| 구조화 로그 | ❌ (`console` 민감정보 로그 금지 권장) | 🔒 |
| 민감 필드 로깅 금지 | ⚠️ 코드상 phone dump 없음. 로컬 저장에 phone 존재 | 🔒 |

## 2. 웹·앱 보안

| 항목 | FE | BE |
|------|----|----|
| CORS | 🔒 (미니앱→API) | 🔒 서버 설정 |
| CSRF | 🔒 (쿠키 세션 없음, Device-Id) | 🔒 |
| XSS + CSP | ⚠️ 지도 HTML은 JSON.stringify로 주입. CSP는 샌드박스/웹뷰 제약 | 🔒 |
| SSRF | 🔒 | 🔒 |
| 보안 헤더 | 🔒 | 🔒 |

## 3. 인증·인가

| 항목 | FE | BE |
|------|----|----|
| AuthN | ⚠️ `X-Device-Id`만 (약한 기기 식별) | ⚠️ 동일 |
| AuthZ / RBAC / 테넌트 격리 | ❌ | ❌ (단일 유저 스코프 추정) |
| 쿠키/세션 / 세션 타임아웃 | ❌ | ❌ |
| 2FA/TOTP | ❌ | ❌ |
| 최소 권한 | ⚠️ 앱 권한 `permissions: []` (카메라 등 추후) | 🔒 IAM/DB |

## 4. 입력·데이터

| 항목 | FE | BE |
|------|----|----|
| Validation | ⚠️ 닉네임·전화 클라이언트 검증 | ⚠️ OpenAPI pattern |
| SQLi | 🔒 FE N/A | 🔒 |
| 암호화 (전송/저장) | ⚠️ HTTPS 권장(샌드박스는 HTTP 허용). 로컬 AsyncStorage 평문 | 🔒 TLS + DB |
| 민감 필드 별도 권한 | ❌ | ❌ |
| DB 권한 분리 / RLS | 🔒 | 🔒 |

## 5. 운영

| 항목 | FE | BE |
|------|----|----|
| Rate Limit | ❌ | ❌ (미검증) |
| Secret 관리 | ✅ `.env` gitignore · 실비밀 미커밋 | ⚠️ Notion에 인프라 비밀 존재(레포 밖) |
| Audit Log | ❌ | ❌ (미검증) |
| 의존성 점검 | ✅ `docs/SECURITY.md` npm overrides · #4 잔여 | 🔒 |
| 자동 백업 | 🔒 | 🔒 RDS |

---

## FE에서 한 조치 (이번)

- 카카오맵 mock 주소 내 휴대전화 마스킹
- TDS 샘플 로고 PNG 레포에서 제거 (`assets/figma-export/raw-unique`)
- API 활성 시 등록 실패 로컬 폴백(1001) 제거 · 리셋 후 재등록
- 출석 `USER_NOT_FOUND` 등 에러 코드 분리

## BE에 요청할 항목 (이슈로 추적 권장)

CORS/보안헤더, Rate limit, RequestID, 구조화 로그, 세션·RBAC(필요 시), DB 권한·백업, Secret을 Notion→시크릿 스토어로 이전

## npm audit

`package.json` **overrides**로 transitive 취약점 패치 (기존 내용 유지).

```bash
npm audit
npm test
npm run typecheck
```
