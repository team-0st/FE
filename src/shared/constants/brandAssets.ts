import { brandUriSource } from './brandImageUris';

/**
 * 재료·마스코트·가챠 히어로: Granite용 data-uri (`brandImageUris.ts`).
 * shareCard 등 초대형 배경만 require 유지.
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
    shareCardPhoto: require('../../../assets/brand/share-card-photo-bg.png'),
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
} as const;

export type BrandAssetKey = keyof typeof BRAND_ASSET;
export type BrandEmojiKey = keyof typeof BRAND_EMOJI;
