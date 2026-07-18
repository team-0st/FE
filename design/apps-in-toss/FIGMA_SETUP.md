# 앱인토스 TDS Figma UI Kit — 설치 가이드

## 다운로드된 파일

| 파일 | 설명 |
|------|------|
| `TDS_Mobile_for_Apps_in_Toss_(2602-3-2).zip` | 공식 UI Kit 원본 |
| `TDS_Mobile_for_Apps_in_Toss_(2602-3-2).fig` | Figma Import용 |

출처: https://developers-apps-in-toss.toss.im/design/prepare/design.html

## Figma 프로젝트 (제로스트)

https://www.figma.com/files/team/1555474609984595910/project/599851111

팀: **윤나래/컴퓨터공학과**

---

## 설치 순서 (디자이너)

### 1. `.fig` 파일 Import

1. Figma 앱(웹/데스크톱) 실행
2. 위 **프로젝트**로 이동
3. 상단 **Import** 클릭
4. `TDS_Mobile_for_Apps_in_Toss_(2602-3-2).fig` 선택 (또는 드래그&드롭)
5. 프로젝트 폴더 안에 파일 생성 확인

### 2. 라이브러리 Publish

1. Import한 TDS 파일 열기
2. 왼쪽 **Assets** 탭
3. 오른쪽 상단 **📚 Manage libraries**
4. 해당 파일 **Publish** → 다른 파일에서도 컴포넌트 사용 가능

### 3. 제로스트 작업 파일에서 연결

1. 제로스트 디자인 파일 열기 (또는 새 파일 생성)
2. Assets → **Add to file** (TDS Library 활성화)
3. `Screen`, `Navigation`, `Top`, `ListRow`, `Button` 등 드래그해서 사용

---

## 디자인 시 주의 (공식)

- 화면 너비 **375px** 기준
- 최상단 **Navigation** / **Screen** 컴포넌트 사용
- 속성은 **오른쪽 패널**에서만 조작 (캔버스 직접 수정 X)
- 다크모드 미지원 → **라이트 모드만**
- Figma 폰트는 SF Pro (앱에서는 Toss Product Sans 자동 적용)

## 라이선스

https://developers-apps-in-toss.toss.im/design/prepare/figma-ui-license.html
