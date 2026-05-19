# team-0st / FE

제로스타트 **앱인토스 미니앱** 프론트엔드 (Granite + React Native + TDS).

> GachonHack과 무관한 제품 레포입니다.

## Prerequisites

- Node.js 20+
- npm 10+
- iOS Simulator 또는 Android emulator / 실기기
- [앱인토스 샌드박스 앱](https://developers-apps-in-toss.toss.im/development/test/sandbox.html) (최신 빌드)

## Install

```bash
git clone https://github.com/team-0st/FE.git
cd FE
git checkout setup/foundation   # 최초 세팅 브랜치
npm install
```

## Configure Apps in Toss

1. [앱인토스 콘솔](https://developers-apps-in-toss.toss.im/)에서 앱을 등록합니다.
2. `granite.config.ts`의 `appName`을 콘솔 앱 이름(kebab-case)과 **동일하게** 맞춥니다.
3. `brand.displayName`, `primaryColor`, `icon`을 서비스에 맞게 수정합니다.

```ts
// granite.config.ts
appName: 'your-console-app-name',
```

## Run (local dev server)

```bash
npm run dev
```

Metro가 뜨면 샌드박스 앱에서 로컬 서버에 연결합니다.

### iOS Simulator

1. 샌드박스 앱 실행 → 개발자 로그인
2. 서버 IP 입력 (macOS: `ipconfig getifaddr en0`)
3. 스킴 실행: `intoss://{appName}` (예: `intoss://zero-start`)

### Android (USB)

```bash
adb reverse tcp:8081 tcp:8081
adb reverse tcp:5173 tcp:5173
```

샌드박스에서 `intoss://{appName}` 실행.

> TDS는 로컬 브라우저에서 검증되지 않습니다. UI 확인은 **샌드박스 필수**입니다.

## Sandbox test checklist

- [ ] 샌드박스 최신 버전 설치 (SDK 2.x / RN 0.84)
- [ ] 토스 비즈니스 **개인 계정**으로 샌드박스 로그인
- [ ] 콘솔에 등록한 앱 선택
- [ ] `npm run dev` 실행 후 `Bundling n%` 연결 확인
- [ ] `intoss://{appName}` 홈 → `/login` 이동
- [ ] (추후) 토스 로그인 플로우 — `src/platform/toss`

## Build

```bash
npm run build
```

프로젝트 루트에 `*.ait` 번들이 생성됩니다. (SDK 2.x: `ait build`)

## Quality

```bash
npm run typecheck
npm run lint
npm test
```

## Project docs

- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — 레이어 구조
- [docs/CODE_CONVENTION.md](./docs/CODE_CONVENTION.md) — 코딩·PR 규칙
- [docs/COMMIT_CONVENTION.md](./docs/COMMIT_CONVENTION.md) — 커밋 메시지

## Initial routes

| Path | Screen |
| --- | --- |
| `/` | Home (TDS placeholder) |
| `/login` | Toss login placeholder |

## Links

- [React Native 가이드 (앱인토스)](https://developers-apps-in-toss.toss.im/tutorials/react-native.html)
- [SDK 2.x 마이그레이션](https://developers-apps-in-toss.toss.im/bedrock/reference/framework/%EC%8B%9C%EC%9E%91%ED%95%98%EA%B8%B0/SDK2.0.1.html)
- [샌드박스 테스트](https://developers-apps-in-toss.toss.im/development/test/sandbox.html)
