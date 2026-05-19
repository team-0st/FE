# Commit Convention

모든 커밋 메시지는 아래 형식을 따릅니다.

```text
[type] 한글 또는 영문 요약 (50자 내외 권장)
```

## Types

| Type | 용도 |
| --- | --- |
| `[feat]` | 새 기능, 화면, 라우트 |
| `[fix]` | 버그 수정 |
| `[docs]` | 문서만 변경 |
| `[refactor]` | 동작 변경 없는 구조 개선 |
| `[chore]` | 빌드, 의존성, 설정 |

## Examples

```text
[feat] 홈·로그인 라우트 스켈레톤 추가
[fix] 샌드박스 연결 시 라우트 파라미터 타입 오류 수정
[docs] ARCHITECTURE 레이어 규칙 보완
[refactor] API 클라이언트를 src/api로 이동
[chore] @apps-in-toss/framework 2.5.2 업데이트
```

## Rules

- 한 커밋에 하나의 목적만 담습니다.
- WIP 커밋은 `main` / `develop`에 push하지 않습니다.
- 자동 생성 파일(`src/router.gen.ts`)만 바뀐 경우 `[chore]` 또는 해당 기능 커밋에 포함합니다.
