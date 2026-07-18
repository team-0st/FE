/**
 * Figma `제로스트 TDS 초안` (WSJgAg2xe1eSESfkzaWzXV) export.
 *
 * 주의: `download_assets` rawImages 는 TDS ListRow/Logo 샘플
 * (삼성 로고·해님·토스 S·파란 플레이스홀더) 뿐이라 앱에 쓰지 않음.
 * 화면 비주얼은 이모지 TEXT / Card 프레임 스크린샷 export.
 */
export const BRAND_ASSET = {
    /** 01 온보딩 · 홈 새싹 */
    heroSprout: require('../../../assets/brand/hero-sprout.png'),
    /** 06 가챠 idle */
    heroGacha: require('../../../assets/brand/hero-gacha.png'),
    /** 11 스프 결과 */
    heroSoup: require('../../../assets/brand/hero-soup.png'),
    /** 12 미션 결과 히어로 */
    heroMission: require('../../../assets/brand/hero-mission.png'),
    /** 06-1 C 축하 */
    heroParty: require('../../../assets/brand/hero-party.png'),
    /** 06-1 A · Pulling */
    gachaPulling: require('../../../assets/brand/gacha-pulling-art.png'),
    /** 06-1 B · Reveal */
    gachaReveal: require('../../../assets/brand/gacha-reveal-art.png'),
    /** 06-1 C · Result card */
    gachaResult: require('../../../assets/brand/gacha-result-art.png'),
    /** 12 SNS PhotoPlaceholder */
    shareCardPhoto: require('../../../assets/brand/share-card-photo-bg.png'),
} as const;

/** Figma 단독 이모지 노드 스크린샷 (재료·히어로 조각) */
export const BRAND_EMOJI = {
    sprout: require('../../../assets/brand/emoji/sprout.png'),
    gift: require('../../../assets/brand/emoji/gift.png'),
    soup: require('../../../assets/brand/emoji/soup.png'),
    camera: require('../../../assets/brand/emoji/camera.png'),
    carrot: require('../../../assets/brand/emoji/carrot.png'),
    lettuce: require('../../../assets/brand/emoji/lettuce.png'),
    party: require('../../../assets/brand/emoji/party.png'),
} as const;

export type BrandAssetKey = keyof typeof BRAND_ASSET;
export type BrandEmojiKey = keyof typeof BRAND_EMOJI;
