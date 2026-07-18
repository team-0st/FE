#!/usr/bin/env python3
"""Build polished phone-frame gallery for PPT slide 11."""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

SCREEN_DIR = Path(
    "/Users/yoonnarae/Library/CloudStorage/OneDrive-가천대학교"
    "/Extracurricular Activities/NSI_글로벌리더십_제로스트/FE/screenshots"
)
OUT_DIR = Path("/Users/yoonnarae/Downloads/zerost-ppt-assets")
MANIFEST = SCREEN_DIR / "manifest.json"

COLS = 6
ROWS = 3
PHONE_W = 200
PHONE_H = 420
GAP_X = 28
GAP_Y = 36
PAD = 48
LABEL_H = 28

BG = (245, 247, 250)
ACCENT = (49, 130, 246)
TEXT = (25, 31, 40)
MUTED = (107, 118, 132)


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "/System/Library/Fonts/AppleSDGothicNeo.ttc",
        "/System/Library/Fonts/Supplemental/AppleGothic.ttf",
        "/Library/Fonts/Arial Unicode.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            try:
                return ImageFont.truetype(path, size=size, index=1 if bold and path.endswith(".ttc") else 0)
            except OSError:
                try:
                    return ImageFont.truetype(path, size=size)
                except OSError:
                    continue
    return ImageFont.load_default()


def draw_phone_frame(base: Image.Image, x: int, y: int, screen: Image.Image, label: str) -> None:
    draw = ImageDraw.Draw(base)
    rx, ry = x, y
    rw, rh = PHONE_W, PHONE_H

    # shadow
    draw.rounded_rectangle((rx + 4, ry + 6, rx + rw + 4, ry + rh + 6), radius=28, fill=(210, 214, 220))

    # body
    draw.rounded_rectangle((rx, ry, rx + rw, ry + rh), radius=28, fill=(20, 22, 28))
    draw.rounded_rectangle((rx + 3, ry + 3, rx + rw - 3, ry + rh - 3), radius=24, fill=(255, 255, 255))

    # notch
    nw, nh = 56, 10
    nx = rx + (rw - nw) // 2
    draw.rounded_rectangle((nx, ry + 8, nx + nw, ry + 8 + nh), radius=5, fill=(230, 233, 238))

    inner_x = rx + 8
    inner_y = ry + 24
    inner_w = rw - 16
    inner_h = rh - 32
    fitted = screen.resize((inner_w, inner_h), Image.Resampling.LANCZOS)
    mask = Image.new("L", (inner_w, inner_h), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, inner_w, inner_h), radius=18, fill=255)
    base.paste(fitted, (inner_x, inner_y), mask)

    font = load_font(13, bold=False)
    tw = draw.textlength(label, font=font)
    draw.text((rx + (rw - tw) / 2, ry + rh + 8), label, fill=MUTED, font=font)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    if MANIFEST.exists():
        items = json.loads(MANIFEST.read_text(encoding="utf-8"))
        screens = [(Path(it["filePath"]).name.replace(".png", ""), it.get("route", "")) for it in items]
    else:
        screens = [(p.stem, p.stem) for p in sorted(SCREEN_DIR.glob("*.png"))]

    labels = {
        "01-onboarding": "온보딩",
        "02-onboarding-shop": "샵 선택",
        "03-home": "홈",
        "04-ingredients": "제작",
        "05-gacha": "가챠",
        "06-recipes": "레시피",
        "07-profile": "마이",
        "08-home-checkin": "출석",
        "09-missions": "미션",
        "10-mission-detail": "미션 상세",
        "11-mission-verify": "인증",
        "12-mission-result": "완료",
        "13-soup-success": "스프 성공",
        "14-soup-fail": "스프 실패",
        "15-shop": "내 샵",
        "16-shop-select": "샵 변경",
        "17-login": "로그인",
        "18-404": "404",
    }

    canvas_w = PAD * 2 + COLS * PHONE_W + (COLS - 1) * GAP_X
    canvas_h = PAD * 2 + 56 + ROWS * (PHONE_H + LABEL_H) + (ROWS - 1) * GAP_Y
    canvas = Image.new("RGB", (canvas_w, canvas_h), BG)
    draw = ImageDraw.Draw(canvas)

    title_font = load_font(34, bold=True)
    sub_font = load_font(18, bold=False)
    draw.text((PAD, PAD), "제로스트 FE — 전체 화면 (앱인토스 MVP Demo)", fill=TEXT, font=title_font)
    draw.text((PAD, PAD + 42), "Granite · TDS · mock-first · 18 screens", fill=MUTED, font=sub_font)

    y0 = PAD + 56
    for idx, (stem, _route) in enumerate(screens[:18]):
        col = idx % COLS
        row = idx // COLS
        x = PAD + col * (PHONE_W + GAP_X)
        y = y0 + row * (PHONE_H + LABEL_H + GAP_Y)
        png = SCREEN_DIR / f"{stem}.png"
        if not png.exists():
            continue
        screen = Image.open(png).convert("RGB")
        draw_phone_frame(canvas, x, y, screen, labels.get(stem, stem))

    out = OUT_DIR / "slide11-fe-phone-gallery.png"
    canvas.save(out, format="PNG", optimize=True)
    print(out)


if __name__ == "__main__":
    main()
