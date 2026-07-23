/** 파일럿 단골 샵 — 알맹상점 마포(망원)점 */

export const PILOT_SHOP_ID = 'kakao-알맹상점-마포' as const;

/** BE `GET /api/v1/shops` 기준 파일럿 샵 numeric id (dev: 알맹상점) */
export const PILOT_SHOP_NUMERIC_ID = 1 as const;

export const PILOT_SHOP_DISPLAY_NAME = '알맹상점 마포점' as const;

/** 지도·주변 상점 미리보기용 (망원동 인근) */
export const PILOT_USER_LOCATION = {
    latitude: 37.5565,
    longitude: 126.905,
} as const;
