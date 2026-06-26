/** Notion DB/API 명세와 동일한 wire 타입 (BE 연동 시 그대로 사용) */

export type IngredientCatalogType = 'COMMON' | 'HIDDEN';

export type RecipeCatalogType = 'TRASH' | 'COMMON' | 'HIDDEN' | 'LEGENDARY';

export type SoupCraftResult = 'SUCCESS' | 'FAIL' | 'DUPLICATE';

export type RewardCatalogType = 'ECO_JAM' | 'REAL_ITEM' | 'TRASH_ITEM' | 'ALMANG_POINT';

export type GachaResultType = 'FAIL' | 'ECO_JAM' | 'INGREDIENT' | 'ALMANG_POINT';

export type EcoJamSourceType = 'SOUP' | 'GACHA' | 'MISSION' | 'CHECKIN';

export type IngredientDto = {
    id: number;
    name: string;
    type: IngredientCatalogType;
    imageUrl: string | null;
};

export type ShopDto = {
    id: number;
    name: string;
    description: string;
    imageUrl: string | null;
};

export type CheckInResponse = {
    alreadyChecked: boolean;
    rewardedIngredient?: IngredientDto;
};

export type MissionVerifyResponse = {
    missionId: number;
    rewardedIngredient: IngredientDto;
};

export type SoupCraftResponse = {
    soupId: number;
    result: SoupCraftResult;
    recipeName?: string;
    rewardType?: RewardCatalogType;
    rewardAmount?: number;
    rewardDescription?: string;
};

export type GachaResponse = {
    gachaId: number;
    costEcoJam: number;
    resultType: GachaResultType;
    resultAmount?: number;
    resultIngredient?: IngredientDto;
    remainingEcoJam: number;
};

export type OnboardingCompleteResponse = {
    userId: number;
    shopId: number;
};

export type ProfileResponse = {
    nickname: string;
    shopName: string;
    ecoJam: number;
    totalSoups: number;
    ingredients: Array<{
        ingredientId: number;
        name: string;
        type: IngredientCatalogType;
        imageUrl: string | null;
        quantity: number;
    }>;
    completedMissionsThisWeek: number;
};

export type EcoJamHistoryItem = {
    id: number;
    amount: number;
    sourceType: EcoJamSourceType;
    description: string;
    createdAt: string;
};

export const API_PATHS = {
    shops: '/api/shops',
    onboardingComplete: '/api/onboarding/complete',
    checkIn: '/api/check-in',
    checkInStatus: '/api/check-in/status',
    missions: '/api/missions',
    missionDetail: (id: number) => `/api/missions/${id}`,
    missionVerify: (id: number) => `/api/missions/${id}/verify`,
    ingredients: '/api/ingredients',
    recipes: '/api/recipes',
    recipesHidden: '/api/recipes/hidden',
    soupCraft: '/api/soup/craft',
    soupResult: (soupId: number) => `/api/soup/result/${soupId}`,
    profile: '/api/profile',
    ecoJamHistory: '/api/eco-jam/history',
    gacha: '/api/gacha',
} as const;
