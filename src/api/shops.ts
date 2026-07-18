import { apiRequest, isApiEnabled } from './client';
import { MOCK_SHOPS } from './mock/shops';
import { API_PATHS, type ShopDto } from './notion/types';

/** GET /api/v1/shops — URL 없으면 mock 카탈로그 */
export async function getShops(): Promise<ShopDto[]> {
    if (isApiEnabled()) {
        return apiRequest<ShopDto[]>(API_PATHS.shops);
    }
    await new Promise((r) => setTimeout(r, 20));
    return MOCK_SHOPS.map((shop, index) => ({
        id: index + 1,
        name: shop.name,
        description: shop.description,
        imageUrl: shop.imageUrl,
    }));
}
