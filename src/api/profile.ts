import { apiRequest, isApiEnabled } from './client';
import { API_PATHS } from './notion/types';

export type MyPageResponse = {
    nickname: string | null;
    shopName: string | null;
    ecoJam: number;
    point: number;
    brewedSoupCount: number;
    completedMissionCount: number;
    totalIngredientQuantity: number;
    ingredients: Array<{
        ingredientId: number;
        name: string;
        type: string;
        imageUrl: string | null;
        quantity: number;
    }>;
};

/** GET /api/v1/my-page */
export async function getMyPage(): Promise<MyPageResponse | null> {
    if (!isApiEnabled()) {
        return null;
    }
    return apiRequest<MyPageResponse>(API_PATHS.myPage);
}
