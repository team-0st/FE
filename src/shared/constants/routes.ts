export const ROUTES = {
    home: '/',
    login: '/login',
    onboarding: '/onboarding',
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
    navigate: (name: string, params?: { id?: string; recipeId?: string }) => void;
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

export function navigateSoupResult(navigation: AppNavigation, recipeId: string): void {
    navigation.navigate('/soup/result', { recipeId });
}
