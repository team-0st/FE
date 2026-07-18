/** 알맹 카카오맵 폴더·서울시 지도 등 출처별 분류 (지도 표시용) */
export type ShopCategory =
    | 'almae-direct'
    | 'zero-waste'
    | 'shop-in-shop'
    | 'reuse'
    | 'eco-stay';

export type ShopCategoryFilter = ShopCategory | 'all';

export const SHOP_CATEGORY_META: Record<
    ShopCategory,
    { label: string; shortLabel: string; emoji: string }
> = {
    'almae-direct': { label: '알맹 직영', shortLabel: '알맹', emoji: '♻️' },
    'zero-waste': { label: '제로웨이스트 샵', shortLabel: '제웨 샵', emoji: '🌿' },
    'shop-in-shop': { label: '샵앤샵', shortLabel: '샵앤샵', emoji: '🏪' },
    'reuse': { label: '재사용·중고', shortLabel: '재사용', emoji: '♻️' },
    'eco-stay': { label: '제웨 숙소', shortLabel: '숙소', emoji: '🏡' },
};

export const SHOP_CATEGORY_FILTER_ORDER: ShopCategoryFilter[] = [
    'all',
    'almae-direct',
    'zero-waste',
    'shop-in-shop',
    'reuse',
    'eco-stay',
];

export function getShopCategoryLabel(category: ShopCategory): string {
    return SHOP_CATEGORY_META[category].label;
}

export function getShopCategoryFilterLabel(filter: ShopCategoryFilter): string {
    if (filter === 'all') {
        return '전체';
    }
    return SHOP_CATEGORY_META[filter].shortLabel;
}
