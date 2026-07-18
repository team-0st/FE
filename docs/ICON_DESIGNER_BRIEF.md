# 재료 아이콘 — 재료별 색상 지정

아이콘(이모지 스타일) 디자이너용.  
각 재료 **본체에 쓸 Hex**를 고정합니다. 앱 UI 보라(`#7C5CBF`)는 일반 채소 본체에 쓰지 마세요.

공통: 512×512 · 투명 PNG · 3D 소프트 이모지 톤 · 하이라이트는 표의 **Highlight**, 그림자는 **Shadow**.

---

## 일반 재료 (7)

| 재료 | 파일명 | Main (본체) | Highlight | Shadow / 줄기·잎 |
|------|--------|-------------|-----------|------------------|
| 양배추 | `ingredient-cabbage.png` | `#7CB342` | `#C5E1A5` | `#558B2F` (겉잎) / `#F1F8E9` (속) |
| 토마토 | `ingredient-tomato.png` | `#E53935` | `#FF8A80` | `#B71C1C` · 꼭지 `#43A047` |
| 양파 | `ingredient-onion.png` | `#F5D0A9` | `#FFF3E0` | `#D4A574` · 속 고리 `#FFE0B2` · 뿌리 `#8D6E63` |
| 당근 | `ingredient-carrot.png` | `#FB8C00` | `#FFB74D` | `#EF6C00` · 잎 `#66BB6A` / `#2E7D32` |
| 버섯 | `ingredient-mushroom.png` | 갓 `#C62828` | `#EF9A9A` | 갓 아래 `#8E0000` · 대 `#FFF8E1` / `#FFE082` |
| 브로콜리 | `ingredient-broccoli.png` | 꽃송이 `#43A047` | `#81C784` | `#2E7D32` · 줄기 `#9CCC65` |
| 파프리카 | `ingredient-paprika.png` | `#FF7043` (주황) | `#FFAB91` | `#E64A19` · 꼭지 `#558B2F` |

파프리카를 **빨강**으로 그리고 싶으면 Main `#E53935`, Highlight `#FF8A80` (토마토와 구분: 각진 형태).

---

## 히든 재료 (3)

| 재료 | 파일명 | Main | Highlight | Shadow / 포인트 |
|------|--------|------|-----------|-----------------|
| 리필 크리스탈 | `ingredient-refill-crystal.png` | `#4FC3F7` | `#E1F5FE` | `#0288D1` · 반짝 `#B3E5FC` |
| 자연의 새싹 | `ingredient-nature-sprout.png` | 잎 `#2DB87A` | `#A5D6A7` | 줄기 `#1B5E20` · 흙/화분(선택) `#8D6E63` |
| 에코 스타 | `ingredient-eco-star.png` | `#FFC107` | `#FFE082` | `#FF8F00` · 윤곽 `#F9A825` |

히든만 앱 Primary 보라를 **아주 약하게** 글로우로 써도 됨: `#7C5CBF` @ 15~20% opacity.

---

## 한눈에 (복붙용)

```
cabbage   main #7CB342  hi #C5E1A5  sh #558B2F
tomato    main #E53935  hi #FF8A80  sh #B71C1C  stem #43A047
onion     main #F5D0A9  hi #FFF3E0  sh #D4A574
carrot    main #FB8C00  hi #FFB74D  sh #EF6C00  leaf #66BB6A
mushroom  cap  #C62828  hi #EF9A9A  stem #FFF8E1
broccoli  main #43A047  hi #81C784  sh #2E7D32
paprika   main #FF7043  hi #FFAB91  sh #E64A19
crystal   main #4FC3F7  hi #E1F5FE  sh #0288D1
sprout    main #2DB87A  hi #A5D6A7  sh #1B5E20
eco-star  main #FFC107  hi #FFE082  sh #FF8F00
```

---

## 미션 아이콘 (참고 — 재료보다 후순위)

미션은 단색+심볼보다, 아래 accent만 맞추면 됩니다.

| 미션 | Accent |
|------|--------|
| 텀블러·인증 전반 | `#7C5CBF` |
| 분리배출·리필·플로깅 | `#2DB87A` |
| 상점 방문 | `#FB8C00` |

---

## 납품

`assets/brand/ingredients/` 에 위 파일명으로 주시면 FE `require` 연결합니다.
