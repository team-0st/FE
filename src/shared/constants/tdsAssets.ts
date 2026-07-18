/**
 * TDS 공식 아이콘 (static.toss.im) — Figma Tab Bar / ListRow Asset 슬롯과 동일 name 사용.
 * 커스텀 일러스트(재료·캐릭터)와 무관. 디자이너 그림 오기 전에도 이 기본 에셋으로 UI를 맞춘다.
 */
export const TDS_ICON = {
    /** Figma 05 제작 Tab Bar Resource= */
    tabHome: 'icon-home-mono',
    tabCraft: 'icon-diamond-mono',
    tabGacha: 'icon-shopping-bag-mono',
    /** Figma는 graph-up(주식형) — 레시피 의미에 맞게 food로 교체 */
    tabRecipes: 'icon-food-mono',
    tabProfile: 'icon-line-three-mono',

    sprout: 'icon-sprout-mono',
    gachaGift: 'icon-gift-mono',
    soupBowl: 'icon-food-mono',
    missionCamera: 'icon-camera-mono',
    nearbyShop: 'icon-map-mono',
    missionRow: 'icon-sprout-mono',
    missionLock: 'icon-lock-mono',
    shopStore: 'icon-store-mono',
    check: 'icon-check-mono',
    star: 'icon-star-mono',
    document: 'icon-document-mono',
    receipt: 'icon-receipt-mono',
    user: 'icon-user-mono',
} as const;

export type TdsIconKey = keyof typeof TDS_ICON;

export const TDS_ICON_CDN_BASE = 'https://static.toss.im/icons/png/4x';

export function tdsIconPngUrl(iconName: string): string {
    return `${TDS_ICON_CDN_BASE}/${iconName}.png`;
}
