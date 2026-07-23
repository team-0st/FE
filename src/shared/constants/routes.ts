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
    shopPartners: '/shop/partners',
    profile: '/profile',
    about: '/about',
    adminReview: '/admin/review',
} as const;

type AppNavigationParams = {
    id?: string;
    recipeId?: string;
    soupId?: string;
    result?: string;
    rewardType?: string;
    rewardAmount?: string;
    rewardDescription?: string;
};

type AppNavigation = {
    navigate: (name: string, params?: AppNavigationParams) => void;
};

/**
 * react-navigation의 `navigate`는 크로스 내비게이터용 loose string 오버로드가 있어서
 * `AppNavigation.navigate`로 구조적 호환이 되지만, `replace`는 그 오버로드가 없어서
 * 실제 navigation 객체를 그대로 구조적으로 대입하면 타입 에러가 나요.
 * 라우트 스택 교체(뒤로가기 시 이전 화면 복귀 방지, 이슈 #30)가 필요한 곳에서만
 * 이 헬퍼로 `replace`가 있으면 그걸 쓰고, 없으면 `navigate`로 폴백해요.
 */
function replaceOrNavigate(navigation: AppNavigation, name: string, params?: AppNavigationParams): void {
    const nav = navigation as AppNavigation & {
        replace?: (name: string, params?: AppNavigationParams) => void;
    };
    if (nav.replace != null) {
        nav.replace(name, params);
        return;
    }
    navigation.navigate(name, params);
}

export function navigateMissionDetail(navigation: AppNavigation, id: string): void {
    navigation.navigate('/missions/:id', { id });
}

export function navigateMissionVerify(navigation: AppNavigation, id: string): void {
    navigation.navigate('/missions/:id/verify', { id });
}

/**
 * 인증 제출 화면(verify)을 스택에서 대체해요.
 * `navigate`를 쓰면 결과 화면에서 뒤로가기 시 제출 화면으로 복귀해요. (이슈 #30)
 */
export function navigateMissionResult(navigation: AppNavigation, id: string): void {
    replaceOrNavigate(navigation, '/missions/:id/result', { id });
}

export function navigateSoupResult(
    navigation: AppNavigation,
    recipeId: string,
    craft: SoupCraftResponse,
): void {
    const encoded = encodeSoupCraftForRoute(craft);
    replaceOrNavigate(navigation, '/soup/result', { recipeId, ...encoded });
}
