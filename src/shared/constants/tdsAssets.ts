/**
 * TDS 공식 아이콘 (static.toss.im) — Figma Tab Bar / ListRow Asset 슬롯과 동일 name 사용.
 * 커스텀 일러스트(재료·캐릭터)와 무관. 디자이너 그림 오기 전에도 이 기본 에셋으로 UI를 맞춘다.
 */
export const TDS_ICON = {
    tabHome: 'icon-home-mono',
    /** 제작 — 스프/음식 그릇 */
    tabCraft: 'icon-food-mono',
    /** 가챠 — 선물 상자 */
    tabGacha: 'icon-gift-mono',
    /** 레시피 — 문서/종이 */
    tabRecipes: 'icon-document-mono',
    /** 마이 — 사람 */
    tabProfile: 'icon-user-mono',

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
