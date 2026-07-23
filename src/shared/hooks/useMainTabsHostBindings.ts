import type { SoupCraftResponse } from '@api/notion/types';
import { navigateSoupResult, ROUTES } from '../constants/routes';

type LooseNavigation = {
    navigate: (route: string, params?: Record<string, string>) => void;
    replace: (route: string) => void;
};

/** 메인 탭 셸에 넘기는 화면 이동·액션 바인딩 */
export function useMainTabsHostBindings(navigation: object) {
    const nav = navigation as LooseNavigation;

    return {
        onPressMissions: () => {
            nav.navigate(ROUTES.missions);
        },
        onPressPartnerShops: () => {
            nav.navigate(ROUTES.shopPartners);
        },
        onSoupMade: (recipeId: string, craft: SoupCraftResponse) => {
            navigateSoupResult(nav, recipeId, craft);
        },
        onPressChangeShop: () => {
            nav.navigate(ROUTES.shopSelect);
        },
        onPressAbout: () => {
            nav.navigate(ROUTES.about);
        },
        onPressAdminReview: () => {
            nav.navigate(ROUTES.adminReview);
        },
        onPressLogout: () => {
            nav.replace(ROUTES.login);
        },
    };
}
