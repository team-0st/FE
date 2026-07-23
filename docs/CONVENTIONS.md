# FE 컨벤션 (BE 정렬)

Kotlin/RN 구조까지 1:1로 맞추지 않는다. **API·에러·PR·도메인 용어·들여쓰기**만 BE와 공유한다.  
파일/심볼 **대규모 rename은 하지 않는다** (빌드·호출 깨짐 위험).

## PR 제목

BE와 동일:

```text
[Gitmoji][<Prefix>] #<Issue_Number> - <Description>
```

예: `💫 [feature] #12 - 로그인 화면 추가`

템플릿: `.github/pull_request_template.md`

| Prefix | 용도 |
|--------|------|
| `feature` | 기능 |
| `fix` | 버그 |
| `chore` | 의존성·설정·CI |
| `refactor` | 동작 동일 정리 |
| `docs` | 문서만 |

## 포맷 · CI

- 들여쓰기 **스페이스 4** (`biome.json` `indentWidth: 4`) — BE Kotlin과 맞춤
- PR/push 시 CI: `biome check` + `typecheck` + `test` (`.github/workflows/ci.yml`)

## API 경로

- 단일 출처: `src/api/notion/types.ts` → `API_PATHS`
- BE prefix: `/api/v1/...` (변경 시 FE `API_PATHS`와 함께 맞출 것)
- 새 BE 엔드포인트가 생기면 **먼저 `API_PATHS`에 경로를 추가**한 뒤 feature에서 호출

참고 (FE 미연동일 수 있음):

- `POST /api/v1/missions/completions/{completionId}/claim` — 미션 보상 수령

## 에러 코드

- BE 원본: `ErrorCode` enum (`team-0st/BE`)
- FE는 `ApiClientError.code`로 수신. 화면 문구는 `src/shared/feedback/messages.ts`
- 분기할 때는 **BE `code` 문자열을 그대로** 비교 (`ALREADY_CHECKED_IN`, `USER_NOT_FOUND` …)
- 알 수 없는 코드는 네트워크/일반 실패로 묶지 말고, 가능하면 코드를 로그에 남긴다

자주 쓰는 코드:

| code | 맥락 |
|------|------|
| `USER_NOT_FOUND` | 등록/세션 |
| `INVALID_LOGIN_CREDENTIALS` | 로그인 |
| `ALREADY_CHECKED_IN` | 출석 |
| `INGREDIENT_NOT_FOUND` | 출석 재료 풀 |
| `MISSION_*` / `MISSION_REWARD_*` | 미션·보상 수령 |
| `INSUFFICIENT_ECO_JAM` | 가챠·해금 |
| `INSUFFICIENT_INGREDIENT_QUANTITY` | 스프 |

## 도메인 용어 (이름만 통일, rename 강제 없음)

| 용어 | 의미 | FE에서 |
|------|------|--------|
| check-in / checkIn | 출석 | `checkIn`, `/check-in` |
| mission | 일일 미션 | `missions` |
| community mission | 공동 미션 | `communityMissions` |
| soup / brew | 스프 제작 | `soupsBrew` |
| reroll | 스프 리롤 | `soupReroll` |
| gacha | 가챠 | `gachas*` |
| eco-jam / ecoJam | 에코잼 | `ecoJam` |
| ingredient | 재료 | `ingredients` |

새 모듈·주석·경로 키를 만들 때 위 표의 영문 키를 우선한다. 기존 파일명을 맞추려고 일괄 rename하지 않는다.

## 레이어 (참고)

| BE | FE |
|----|-----|
| presentation | `pages/` + feature screen |
| application | `src/features/*` + `src/api/*` |
| domain | types / state logic |

폴더를 BE 패키지명으로 바꾸지 않는다.
