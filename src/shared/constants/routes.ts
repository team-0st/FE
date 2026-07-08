import type { SoupCraftResponse } from '@api/notion/types';
import { encodeSoupCraftForRoute } from '@api/mock/soupCraftMock';

export const ROUTES = {
    home: '/',
    login: '/login',
    onboarding: '/onboarding',
    onboardingProfile: '/onboarding/profile',
    onboardingShop: '/onboarding/shop',
    ingredients: '/ingredients',
    gacha: '/gacha',
    recipes: '/recipes',
    soupResult: '/soup/result',
    missions: '/missions',
    shop: '/shop',
    shopSelect: '/shop/select',
    profile: '/profile',
} as const;

type AppNavigation = {
    navigate: (
        name: string,
        params?: {
            id?: string;
            recipeId?: string;
            soupId?: string;
            result?: string;
            rewardType?: string;
            rewardAmount?: string;
            rewardDescription?: string;
        },
    ) => void;
};

export function navigateMissionDetail(navigation: AppNavigation, id: string): void {
    navigation.navigate('/missions/:id', { id });
}

export function navigateMissionVerify(navigation: AppNavigation, id: string): void {
    navigation.navigate('/missions/:id/verify', { id });
}

export function navigateMissionResult(navigation: AppNavigation, id: string): void {
    navigation.navigate('/missions/:id/result', { id });
}

export function navigateSoupResult(
    navigation: AppNavigation,
    recipeId: string,
    craft: SoupCraftResponse,
): void {
    const encoded = encodeSoupCraftForRoute(craft);
    const params = { recipeId, ...encoded };
    const nav = navigation as AppNavigation & {
        replace?: (name: string, routeParams: Record<string, string>) => void;
    };
    if (nav.replace != null) {
        nav.replace('/soup/result', params);
        return;
    }
    navigation.navigate('/soup/result', params);
}
