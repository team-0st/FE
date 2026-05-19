# Code Convention

## Naming

| 대상 | 규칙 | 예시 |
| --- | --- | --- |
| 폴더 (feature) | kebab-case | `user-profile/` |
| React 컴포넌트 | PascalCase | `HomeScreen.tsx` |
| hook | camelCase + `use` prefix | `useHome.ts` |
| 상수 | UPPER_SNAKE_CASE | `ROUTES.HOME` |
| 타입/인터페이스 | PascalCase | `LoginParams` |
| Granite `appName` | kebab-case (숫자 단독 접미 불가) | `zero-start` |

## Import order

1. React / React Native
2. 외부 라이브러리 (`@granite-js/*`, `@apps-in-toss/*`, `@toss/*`)
3. `@app/*`, `@platform/*`, `@api/*`
4. `@features/*`
5. `@shared/*`
6. 상대 경로 (`./`, `../`)

각 그룹 사이에 빈 줄 1개. 사용하지 않는 import는 제거합니다.

## Folder rules

- 새 화면: `src/features/{name}/{Name}Screen.tsx` + `pages/{route}.tsx`
- 라우트 상수: `src/shared/constants/routes.ts`에만 추가
- Toss/환경 의존 코드: `src/platform`에만 둡니다.
- API 호출: `src/api` 또는 feature hook 내부 (화면 컴포넌트에서 직접 호출 지양)

## TypeScript

- `strict` 유지, `any` 금지 (불가피하면 `unknown` + narrowing)
- 화면 props는 명시적 type/interface 사용
- 공용 DTO는 `src/api/types/` (추가 시)에 정의

## UI (TDS)

- RN 기본 `Text`/`TouchableOpacity` 대신 `@toss/tds-react-native` 우선
- 로컬 브라우저에서는 TDS가 동작하지 않을 수 있음 → **샌드박스 앱**에서 UI 확인
- 브랜드 색: `granite.config.ts` → `appsInToss.brand.primaryColor`

## PR rules

- PR 제목: `[feat] …` / `[fix] …` 등 커밋 규칙과 동일 prefix
- 1 PR = 1 목적 (기능 또는 문서 또는 리팩터)
- `pages/`만 수정한 PR: 스크린샷(샌드박스) 또는 스킴 경로 기재
- `granite.config.ts`의 `appName` / `permissions` 변경 시 PR 본문에 콘솔 반영 여부 명시
- 리뷰 전 체크: `npm run typecheck`, `npm run lint`

## Scripts

| Script | 용도 |
| --- | --- |
| `npm run dev` | Metro / Granite 개발 서버 |
| `npm run build` | `.ait` 번들 (`ait build`) |
| `npm run typecheck` | TypeScript 검사 |
| `npm run lint` | Biome |
