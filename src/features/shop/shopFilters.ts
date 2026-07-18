import type { Shop } from '@api/mock/shops';
import type { ShopCategoryFilter } from '@api/mock/shopCategories';

export function filterShopsByCategory(shops: Shop[], category: ShopCategoryFilter): Shop[] {
    if (category === 'all') {
        return shops;
    }
    return shops.filter((shop) => shop.category === category);
}
