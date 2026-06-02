# FE 보안 (npm audit)

## 조치 내역 (2026-05)

`package.json` **overrides**로 transitive 취약점 패치:

| 패키지 | 조치 |
|--------|------|
| `@fastify/middie` | 9.3.2 (critical 해소) |
| `fast-uri` | 3.1.2 |
| `find-my-way` | 9.6.0 |
| `fast-xml-parser` | 5.7.2 |
| `fastify` | 5.8.5 |
| `tmp` | 0.2.7 |

## 잔여 (9 high) — `ip` 패키지

- **경로:** `@apps-in-toss/plugin-compat` → `react-native@0.72.6` → `@react-native-community/cli*`
- **성격:** Metro/빌드 **개발 도구** 체인 (앱 런타임 `react-native@0.84`와 별도)
- **패치:** upstream(`@apps-in-toss/framework`) 업데이트 전까지 npm override로 제거 불가
- **추적:** [GitHub #4](https://github.com/team-0st/FE/issues/4)

## 확인 명령

```bash
npm audit
npm test
npm run typecheck
```
