# TDS ↔ Figma ↔ 코드 매핑표

공식 기준: [TDS 컴포넌트](https://developers-apps-in-toss.toss.im/design/components.html) · [디자인 도구](https://developers-apps-in-toss.toss.im/design/prepare/design.html)

코드 패키지: `@toss/tds-react-native` 2.0.3  
Figma 파일: [제로스트 TDS 초안](https://www.figma.com/design/WSJgAg2xe1eSESfkzaWzXV)

---

## 1. 컴포넌트 매핑 (11종)

| Figma TDS | RN import | 용도 | 프로젝트 적용 |
|-----------|-----------|------|---------------|
| Navigation / Screen | Granite 라우트 + `Screen` | 375px 셸 | `pages/*`, `Screen.tsx` |
| Top | `Top` | 페이지 타이틀 | 홈·가챠·미션·상점·결과 |
| ListHeader | `ListHeader` | 섹션 제목 | 홈 주변상점, 미션 목록 |
| ListRow | `ListRow` | 리스트 행 | 미션·상점·홈 상점 |
| Button | `Button` | 인라인 CTA | 공유 약버튼 등 |
| BottomCTA | `BottomCTA.Single` / `Double` | 하단 고정 CTA | 홈·가챠·결과 |
| Asset | `Asset.Icon` / `Asset.Text` | 히어로·아이콘 | `TdsHeroAsset`, `SproutAvatar` |
| Badge | `Badge` | 상태 뱃지 | 상점 포인트 (추후) |
| Border | `Border` | 구분선 | 섹션 구분 (필요 시) |
| Paragraph | `Post.Paragraph` | 본문 블록 | 안내 문구 (필요 시) |
| Tab | `MainTabBar` | 하단 탭 | `MainTabShell` |

---

## 2. 화면별 매핑 (Figma v4 ↔ 코드)

| Figma 페이지 | 코드 파일 | Top | ListHeader | ListRow | Asset | BottomCTA |
|--------------|-----------|-----|------------|---------|-------|-----------|
| 04 홈 | `WitchSoupHomeScreen.tsx` | ✅ 제로스트 | ✅ 주변상점 | ✅ | leaf (출석 카드) | ✅ 미션 CTA |
| 06 가챠 | `GachaScreen.tsx` | ✅ | — | — | gift | ✅ Double |
| 09 미션 목록 | `MissionsListScreen.tsx` | ✅ | ✅ 섹션 3개 | ✅ | leaf (행) | — |
| 10 주변 상점 | `PartnerShopsScreen.tsx` | ✅ | — | ✅ | map (행) | — |
| 11 스프 결과 | `SoupResultScreen.tsx` | ✅ | — | — | food | ✅ Double |
| 12 미션 결과 | `MissionResultScreen.tsx` | ✅ | — | — | camera | ✅ Double |

---

## 3. 에셋 매핑

### 중요: Figma `download_assets` rawImages ≠ 제로스트 브랜드

파일 전 페이지 IMAGE fill을 추출하면 **고유 6장**뿐이며, 모두 TDS 컴포넌트 샘플입니다.

| raw | 내용 | 앱 사용 |
|-----|------|---------|
| 480² | 삼성 로고 | ❌ |
| 500² / 1000² | 해님 아이콘 | ❌ |
| 640² / 320² | 토스 S 로고 | ❌ |
| 512² | 파란 단색 플레이스홀더 | ❌ |

제로스트 화면 비주얼은 **이모지 TEXT / Card 프레임 스크린샷**이 본체입니다.

### 브랜드 PNG (`assets/brand/` → `brandAssets.ts`)

| 슬롯 | 파일 | 코드 |
|------|------|------|
| 새싹 히어로 | `hero-sprout.png` | 온보딩, `SproutAvatar` |
| 가챠 idle | `hero-gacha.png` | `GachaScreen` |
| 가챠 A/B/C | `gacha-*-art.png`, `hero-party.png` | 06-1 연출 |
| 스프 | `hero-soup.png` | `SoupResultScreen` |
| 미션 | `hero-mission.png` | `MissionResultScreen` |
| SNS 배경 | `share-card-photo-bg.png` | `MissionShareCard` |
| 재료 이모지 | `emoji/carrot·lettuce·sprout.png` | 보유 재료 ListRow / 슬롯 |

Figma에 **단독 노드가 없는** 재료(토마토·양파 등)는 텍스트 이모지 유지.

---

## 4. 작업 규칙 (prepare/design 준수)

- 화면 너비 375px · 라이트 모드만
- Figma `Screen` + `Navigation` 최상단
- 속성은 Figma 오른쪽 패널만 (캔버스 직접 수정 금지)
- Semantic Color ≠ 코드 색일 수 있음 → `src/shared/theme/colors.ts` 우선
- Figma SF Pro → 앱에서 Toss Product Sans 자동 적용

---

## 5. 적용 체크리스트

- [x] `TdsHeroAsset` — Asset.Icon / Asset.Image 래퍼
- [x] `tdsAssets.ts` — 공식 icon name 상수
- [x] `brandAssets.ts` + `assets/brand/` Figma PNG
- [x] P0 화면 BottomCTA / Result / ListHeader
- [ ] 전 화면 Badge·Border (필요 시)
