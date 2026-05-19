# Architecture

제로스타트 FE는 **Granite** 파일 기반 라우팅 + **Apps in Toss** 런타임 + **TDS React Native** UI 스택을 사용합니다.

## Tech stack

| Layer | Package / Tool |
| --- | --- |
| Runtime | `@apps-in-toss/framework` (SDK 2.x) |
| Router | `@granite-js/react-native` (`pages/`) |
| UI | `@toss/tds-react-native` |
| Build | `granite dev`, `ait build` |

## Directory layout

```text
.
├── pages/                 # Granite file-based routes (createRoute only)
├── src/
│   ├── app/               # App shell: TDSProvider, AppsInToss.registerApp
│   ├── platform/          # Toss / device / env adapters
│   ├── api/               # HTTP client, DTO mappers (BE 연동)
│   ├── features/          # Feature modules (screen + hooks + local types)
│   └── shared/            # Cross-feature UI, constants, utils
├── docs/                  # Team conventions
├── granite.config.ts      # Apps in Toss + Granite plugins
└── require.context.ts     # Route context for Granite
```

## Layer rules

### `pages/`

- **역할**: URL(스킴) ↔ 화면 매핑만 담당합니다.
- `createRoute`, `Route.useNavigation` 등 라우팅 API만 사용합니다.
- 비즈니스 UI·상태는 `src/features`로 위임합니다.

### `src/app`

- 앱 전역 Provider (`TDSProvider` 등)
- `AppsInToss.registerApp` 등록
- 라우트 단위 로직을 넣지 않습니다.

### `src/platform`

- Toss 로그인, 브릿지, 샌드박스/실서비스 환경 차이
- `process.env`, 네이티브 capability 래핑

### `src/api`

- REST/GraphQL 클라이언트, 인터셉터, 에러 정규화
- BE 스펙 확정 전에는 stub/목 타입만 두고, 화면에서 직접 `fetch` 하지 않습니다.

### `src/features`

- 기능 단위 폴더 (`home`, `login`, …)
- 권장: `HomeScreen.tsx`, `useHome.ts`, `types.ts`
- 다른 feature를 직접 import하지 않고, 공통은 `shared`로 올립니다.

### `src/shared`

- 디자인 시스템 래퍼, 공통 상수, 순수 유틸
- feature/domain 로직 금지

## Routing & deep link

- 스킴: `intoss://{appName}{path}`
- `appName`은 `granite.config.ts`의 `appName`과 콘솔 등록명이 **동일**해야 합니다.
- 예: `appName: zero-start` → `intoss://zero-start`, `intoss://zero-start/login`

## Data flow (planned)

```text
pages/ → features/screen → features/hook → api/client → BE
                ↑
         platform/toss (auth token, bridge)
```

BE 레포 연동 전에는 `src/api/client.ts`를 mock/stub으로 유지하고, 토스 로그인·샌드박스 플로우만 프론트에서 검증합니다.

## References

- [React Native 튜토리얼 (앱인토스)](https://developers-apps-in-toss.toss.im/tutorials/react-native.html)
- [SDK 2.x 마이그레이션](https://developers-apps-in-toss.toss.im/bedrock/reference/framework/%EC%8B%9C%EC%9E%91%ED%95%98%EA%B8%B0/SDK2.0.1.html)
- [TDS React Native](https://tossmini-docs.toss.im/tds-react-native/)
