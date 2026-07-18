#!/usr/bin/env python3
"""Generate Apps in Toss console exposure assets (exact pixel sizes)."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parent.parent / "assets" / "apps-in-toss-console"

C = {
    "bg": "#F7F5FA",
    "surface": "#FFFFFF",
    "primary": "#7C5CBF",
    "primary_light": "#EDE7F6",
    "primary_dark": "#5A3F94",
    "sprout": "#2DB87A",
    "sprout_tint": "#E8F8F0",
    "text": "#191F28",
    "muted": "#6B7684",
    "border": "#E5E8EB",
    "cta": "#3182F6",
    "dark_bg": "#1A1428",
    "dark_surface": "#2A2238",
}


def hex_rgb(value: str) -> tuple[int, int, int]:
    value = value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "/System/Library/Fonts/AppleSDGothicNeo.ttc",
        "/System/Library/Fonts/Supplemental/AppleGothic.ttf",
        "/Library/Fonts/Arial Unicode.ttf",
    ]
    index = 6 if bold else 4
    for path in candidates:
        p = Path(path)
        if not p.exists():
            continue
        try:
            if path.endswith(".ttc"):
                return ImageFont.truetype(path, size=size, index=index)
            return ImageFont.truetype(path, size=size)
        except OSError:
            continue
    return ImageFont.load_default()


def rounded_rect(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int, int, int],
    radius: int,
    fill: str,
    outline: str | None = None,
) -> None:
    draw.rounded_rectangle(xy, radius=radius, fill=hex_rgb(fill), outline=hex_rgb(outline) if outline else None, width=2)


def draw_logo(size: int, dark: bool) -> Image.Image:
    img = Image.new("RGB", (size, size), hex_rgb(C["dark_bg"] if dark else C["primary_light"]))
    draw = ImageDraw.Draw(img)
    cx, cy = size // 2, size // 2 - size // 16
    r = size // 3
    sprout = C["sprout"] if not dark else "#5FD99A"
    draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=hex_rgb(sprout))
    stem_w = max(8, size // 40)
    draw.rounded_rectangle(
        (cx - stem_w, cy + r // 2, cx + stem_w, cy + r + size // 8),
        radius=stem_w,
        fill=hex_rgb("#1E8E57" if not dark else "#2DB87A"),
    )
    leaf = max(18, size // 12)
    draw.ellipse((cx - r // 2 - leaf, cy - leaf, cx - r // 2 + leaf, cy + leaf // 2), fill=hex_rgb("#45C88E"))
    draw.ellipse((cx + r // 2 - leaf, cy - leaf // 2, cx + r // 2 + leaf, cy + leaf), fill=hex_rgb("#45C88E"))
    title_font = load_font(size // 7, bold=True)
    sub_font = load_font(size // 11, bold=True)
    title = "제로스트"
    sub = "0st"
    title_color = "#FFFFFF" if dark else C["primary_dark"]
    sub_color = "#CBB8FF" if dark else C["primary"]
    tw = draw.textlength(title, font=title_font)
    sw = draw.textlength(sub, font=sub_font)
    draw.text((cx - tw / 2, cy + r + size // 10), title, fill=hex_rgb(title_color), font=title_font)
    draw.text((cx - sw / 2, cy + r + size // 10 + size // 9), sub, fill=hex_rgb(sub_color), font=sub_font)
    return img


def draw_phone_frame(width: int, height: int, screen: str) -> Image.Image:
    img = Image.new("RGB", (width, height), hex_rgb(C["bg"]))
    draw = ImageDraw.Draw(img)
    pad = width // 14
    bar_h = height // 14
    draw.rectangle((0, 0, width, bar_h), fill=hex_rgb(C["surface"]))
    draw.text((pad, bar_h // 3), "제로스트", fill=hex_rgb(C["text"]), font=load_font(max(18, width // 22), bold=True))
    content_top = bar_h + pad // 2
    content_h = height - content_top - (height // 6 if screen != "missions" else pad)
    if screen == "home":
        rounded_rect(draw, (pad, content_top, width - pad, content_top + height // 5), 20, C["sprout_tint"], C["border"])
        draw.text((pad * 2, content_top + 18), "🌱 출석하고 재료 받기", fill=hex_rgb(C["text"]), font=load_font(width // 18, bold=True))
        draw.text((pad * 2, content_top + 52), "오늘 아직 출석 전이에요", fill=hex_rgb(C["muted"]), font=load_font(width // 24))
        y = content_top + height // 5 + pad
        rounded_rect(draw, (pad, y, width - pad, y + height // 5), 18, C["surface"], C["border"])
        draw.text((pad * 2, y + 16), "이번 주 미션", fill=hex_rgb(C["text"]), font=load_font(width // 20, bold=True))
        ox_y = y + 56
        for i, label in enumerate(["월", "화", "수", "목", "금"]):
            x = pad * 2 + i * ((width - pad * 4) // 5)
            color = C["primary"] if i < 2 else C["border"]
            draw.ellipse((x, ox_y, x + 28, ox_y + 28), fill=hex_rgb(color))
        y2 = y + height // 5 + pad
        rounded_rect(draw, (pad, y2, width - pad, y2 + height // 6), 18, C["surface"], C["border"])
        draw.text((pad * 2, y2 + 16), "내 주변 상점", fill=hex_rgb(C["text"]), font=load_font(width // 20, bold=True))
        draw.text((pad * 2, y2 + 48), "알맹상점 성수 · 약 420m", fill=hex_rgb(C["muted"]), font=load_font(width // 26))
        cta_y = height - height // 7
        rounded_rect(draw, (pad, cta_y, width - pad, cta_y + 52), 14, C["cta"])
        draw.text((pad * 2, cta_y + 14), "오늘 미션 하고 재료 받기", fill=(255, 255, 255), font=load_font(width // 22, bold=True))
    elif screen == "ingredients":
        slot_y = content_top
        slot_w = (width - pad * 2 - 24) // 4
        for i in range(4):
            x = pad + i * (slot_w + 8)
            fill = C["slot_filled"] if i < 3 else C["slot_empty"]
            rounded_rect(draw, (x, slot_y, x + slot_w, slot_y + slot_w), 14, fill, C["border"])
            if i < 3:
                draw.text((x + slot_w // 4, slot_y + slot_w // 4), ["🥕", "🌿", "💧"][i], font=load_font(slot_w // 2))
        grid_y = slot_y + slot_w + pad
        rounded_rect(draw, (pad, grid_y, width - pad, height - height // 7 - pad), 18, C["surface"], C["border"])
        draw.text((pad * 2, grid_y + 16), "보유 재료", fill=hex_rgb(C["text"]), font=load_font(width // 20, bold=True))
        items = ["제로 허브 x2", "당근 조각 x1", "이슬 x3", "씨앗 x1"]
        for i, item in enumerate(items):
            iy = grid_y + 52 + i * 34
            draw.text((pad * 2, iy), item, fill=hex_rgb(C["muted"]), font=load_font(width // 26))
        cta_y = height - height // 7
        rounded_rect(draw, (pad, cta_y, width - pad, cta_y + 52), 14, C["cta"])
        draw.text((pad * 2, cta_y + 14), "스프 만들기", fill=(255, 255, 255), font=load_font(width // 22, bold=True))
    else:
        missions = ["텀블러 챙기기", "장바구니 사용하기", "대중교통 이용하기"]
        y = content_top
        for mission in missions:
            rounded_rect(draw, (pad, y, width - pad, y + 88), 16, C["surface"], C["border"])
            draw.text((pad * 2, y + 18), mission, fill=hex_rgb(C["text"]), font=load_font(width // 22, bold=True))
            draw.text((pad * 2, y + 48), "랜덤 재료 1종 · verify", fill=hex_rgb(C["muted"]), font=load_font(width // 28))
            y += 98
    if screen != "missions":
        tab_y = height - height // 12
        draw.rectangle((0, tab_y, width, height), fill=hex_rgb(C["surface"]))
        tabs = ["제작", "가챠", "홈", "레시피", "마이"]
        active = {"home": "홈", "ingredients": "제작", "missions": "미션"}.get(screen, "홈")
        tab_w = width // len(tabs)
        for i, tab in enumerate(tabs):
            color = C["primary"] if tab == active else C["muted"]
            tx = i * tab_w + tab_w // 2 - 12
            draw.text((tx, tab_y + 10), tab, fill=hex_rgb(color), font=load_font(width // 30, bold=tab == active))
    return img


def resize_cover(img: Image.Image, target_w: int, target_h: int) -> Image.Image:
    src_w, src_h = img.size
    scale = max(target_w / src_w, target_h / src_h)
    new_size = (int(src_w * scale), int(src_h * scale))
    resized = img.resize(new_size, Image.Resampling.LANCZOS)
    left = (resized.width - target_w) // 2
    top = (resized.height - target_h) // 2
    return resized.crop((left, top, left + target_w, top + target_h))


def draw_thumbnail() -> Image.Image:
    w, h = 1932, 828
    img = Image.new("RGB", (w, h), hex_rgb(C["primary_light"]))
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle((0, 0, w, h), radius=0, fill=hex_rgb(C["primary_light"]))
    title_font = load_font(72, bold=True)
    sub_font = load_font(36)
    draw.text((80, 90), "제로스트", fill=hex_rgb(C["primary_dark"]), font=title_font)
    draw.text((80, 170), "일상 제로미션으로 재료를 모아 마녀스프를 만들어요", fill=hex_rgb(C["muted"]), font=sub_font)
    phone_w, phone_h = 320, 640
    home = draw_phone_frame(390, 844, "home").resize((phone_w, phone_h), Image.Resampling.LANCZOS)
    ing = draw_phone_frame(390, 844, "ingredients").resize((phone_w, phone_h), Image.Resampling.LANCZOS)
    img.paste(home, (w - phone_w * 2 - 120, h // 2 - phone_h // 2))
    img.paste(ing, (w - phone_w - 60, h // 2 - phone_h // 2))
    shadow = Image.new("RGBA", (phone_w + 20, phone_h + 20), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow)
    sdraw.rounded_rectangle((10, 10, phone_w + 10, phone_h + 10), 28, fill=(90, 60, 140, 40))
    return img


def draw_landscape() -> Image.Image:
    w, h = 1504, 741
    img = Image.new("RGB", (w, h), hex_rgb(C["bg"]))
    draw = ImageDraw.Draw(img)
    draw.text((60, 48), "제로스트 · 제로웨이스트 실천 미니앱", fill=hex_rgb(C["text"]), font=load_font(42, bold=True))
    draw.text((60, 108), "출석 · 미션 · 제작 · 레시피 · 제휴 상점", fill=hex_rgb(C["muted"]), font=load_font(28))
    pw, ph = 220, 440
    screens = ["home", "ingredients", "missions"]
    x = 60
    for screen in screens:
        phone = draw_phone_frame(390, 844, screen).resize((pw, ph), Image.Resampling.LANCZOS)
        rounded_rect(draw, (x - 8, 170, x + pw + 8, 170 + ph + 8), 24, C["surface"], C["border"])
        img.paste(phone, (x, 174))
        x += pw + 48
    return img


def main() -> None:
    C["slot_filled"] = "#DDD0F0"
    C["slot_empty"] = "#F0ECF5"
    OUT.mkdir(parents=True, exist_ok=True)

    draw_logo(600, dark=False).save(OUT / "app-logo-light-600.png", "PNG")
    draw_logo(600, dark=True).save(OUT / "app-logo-dark-600.png", "PNG")
    draw_thumbnail().save(OUT / "thumbnail-1932x828.png", "PNG")

    portrait_specs = [
        ("screenshot-portrait-01-home.png", "home"),
        ("screenshot-portrait-02-ingredients.png", "ingredients"),
        ("screenshot-portrait-03-missions.png", "missions"),
    ]
    for filename, screen in portrait_specs:
        phone = draw_phone_frame(390, 844, screen)
        resize_cover(phone, 636, 1048).save(OUT / filename, "PNG")

    draw_landscape().save(OUT / "screenshot-landscape-01.png", "PNG")

    keywords = "제로웨이스트, 제로미션, 알맹상점, 리필, 재활용, 마녀스프, 에코잼, 제로스트, 0st, 출석, 미션"
    (OUT / "search-keywords.txt").write_text(keywords + "\n", encoding="utf-8")

    copy = """# 앱인토스 콘솔 입력값 (제로스트)

## 기본 정보
- 한국어 앱 이름: 제로스트
- 영어 앱 이름: Zerost
- appName: 0st
- 부제: 제로미션으로 재료 모아 스프 만들기
- 고객센터 이메일: support@0st.kro.kr

## 상세 설명
1. 앱에 처음 들어오면 온보딩에서 닉네임을 입력하고, 함께할 제로웨이스트 샵을 선택해요.
2. 홈에서 출석하기를 누르면 하루 1회 랜덤 재료 1개를 받아요.
3. 홈·미션 탭에서 제로웨이스트 미션을 확인하고, 인증 사진을 올리면 재료를 받아요.
4. 제작 탭에서 보유 재료를 슬롯에 넣고 스프를 만들면 에코잼 또는 특별 리워드를 받아요.
5. 가챠 탭에서 모은 에코잼으로 추가 재료·포인트를 뽑을 수 있어요.
6. 레시피 탭에서 이번 주 레시피와 히든 레시피 진행 상황을 확인해요.
7. 마이 탭에서 에코잼·완성 레시피·실천 기록을 볼 수 있어요.
8. 제휴 샵 탭에서 주변 알맹상점 위치와 정보를 확인해요.

## 카테고리
- 1: 생활
- 2: 일상

## 노출 정보 (파일)
- app-logo-light-600.png
- app-logo-dark-600.png (선택)
- thumbnail-1932x828.png
- screenshot-portrait-01~03.png
- screenshot-landscape-01.png

## 검색 키워드
""" + keywords + "\n"
    (OUT / "CONSOLE_COPY.md").write_text(copy, encoding="utf-8")
    print(f"Generated assets in {OUT}")


if __name__ == "__main__":
    main()
