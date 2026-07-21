import type { AlphaVisibleBounds } from './cauldronImages';
import { brandUriSource } from './brandImageUris';

/** 제작·가챠 기능의 메인 이미지가 공유하는 고정 높이 */
export const FEATURE_STAGE_HEIGHT = 220;

/**
 * 제작·가챠 헤더 영역(제목/서브타이틀 또는 잔액칩/확률 안내)이 공유하는 고정 슬롯 높이.
 * 두 화면 모두 이 높이만큼 확보한 뒤 그 바로 아래에서 stage viewport가 시작해야
 * 두 stage의 세로 위치가 같아진다.
 */
export const FEATURE_HEADER_SLOT_HEIGHT = 112;

/** 헤더 슬롯과 stage viewport 사이 여백. 제작·가챠 모두 동일해야 stage 위치가 같아진다. */
export const FEATURE_STAGE_TOP_SPACING = 16;

/**
 * assets/brand/hero-gacha.png 실측 alpha bbox.
 * 405x395 원본 기준, bbox (6,6,400,390) → top=6, bottom=390.
 * 제작 가마솥 합성 stage를 이 기준에 맞춰 정렬한다 (cauldronImages의 computeStageAlphaAlignment 참고).
 */
export const GACHA_HERO_ALPHA_BOUNDS: AlphaVisibleBounds = {
    imageHeight: 395,
    top: 6,
    bottom: 390,
};

/**
 * 재료·마스코트·가챠·공유카드: Granite용 data-uri (`brandImageUris.ts`).
 */
export const BRAND_ASSET = {
    heroSprout: brandUriSource('mascotCarrot'),
    mascotCarrot: brandUriSource('mascotCarrot'),
    heroGacha: brandUriSource('heroGacha'),
    heroSoup: brandUriSource('heroSoup'),
    heroMission: brandUriSource('heroMission'),
    heroParty: brandUriSource('heroParty'),
    gachaPulling: brandUriSource('gachaPulling'),
    gachaBangA: brandUriSource('gachaBangA'),
    gachaBangB: brandUriSource('gachaBangB'),
    gachaBangC: brandUriSource('gachaBangC'),
    gachaFail1: brandUriSource('gachaFail1'),
    gachaFail2: brandUriSource('gachaFail2'),
    gachaFail3: brandUriSource('gachaFail3'),
    gachaFail4: brandUriSource('gachaFail4'),
    gachaFail5: brandUriSource('gachaFail5'),
    gachaFail7: brandUriSource('gachaFail7'),
    gachaFail8: brandUriSource('gachaFail8'),
    shareCardPhoto: brandUriSource('shareCardPhoto'),
} as const;

/** 당첨 시 빵 연출 — 희귀도별 고정 (랜덤 아님) */
export const GACHA_BANG_BY_TIER = {
    common: BRAND_ASSET.gachaBangA,
    hidden: BRAND_ASSET.gachaBangB,
    rare: BRAND_ASSET.gachaBangC,
} as const;

/** 꽝 결과 아트 — 뽑을 때마다 랜덤 1장 */
export const GACHA_FAIL_ASSETS = [
    BRAND_ASSET.gachaFail1,
    BRAND_ASSET.gachaFail2,
    BRAND_ASSET.gachaFail3,
    BRAND_ASSET.gachaFail4,
    BRAND_ASSET.gachaFail5,
    BRAND_ASSET.gachaFail7,
    BRAND_ASSET.gachaFail8,
] as const;

/** 재료·히든 아이템 (Granite `{ uri: data:... }` ) */
export const BRAND_EMOJI = {
    sprout: brandUriSource('sprout'),
    gift: brandUriSource('gift'),
    soup: brandUriSource('soup'),
    camera: brandUriSource('camera'),
    carrot: brandUriSource('carrot'),
    tomato: brandUriSource('tomato'),
    onion: brandUriSource('onion'),
    mushroom: brandUriSource('mushroom'),
    broccoli: brandUriSource('broccoli'),
    paprika: brandUriSource('paprika'),
    lettuce: brandUriSource('lettuce'),
    ecoStar: brandUriSource('eco_star'),
    refillCrystal: brandUriSource('refill_crystal'),
    party: brandUriSource('party'),
    ecoJam: brandUriSource('eco_jam'),
    /** 에코잼 당첨 결과(빵 이후)용 — 이펙트 포함 */
    ecoJamReveal: brandUriSource('eco_jam_reveal'),
    almangPoint: brandUriSource('almang_point'),
    completedSoups: brandUriSource('completed_soups'),
} as const;

export type BrandAssetKey = keyof typeof BRAND_ASSET;
export type BrandEmojiKey = keyof typeof BRAND_EMOJI;
