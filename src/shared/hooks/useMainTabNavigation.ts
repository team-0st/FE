import { ROUTES } from '../constants/routes';
import type { MainTabId } from '../layout/MainTabBar';
import { setTabReplaceAnimation } from '../navigation/tabTransition';

type TabRoute = '/' | '/ingredients' | '/gacha' | '/recipes' | '/profile';

type TabNavigation = {
    replace: (screen: TabRoute) => void;
};

function routeToTabId(route: string): MainTabId {
    if (route === ROUTES.ingredients || route.startsWith('/ingredients')) {
        return 'ingredients';
    }
    if (route === ROUTES.gacha || route.startsWith('/gacha')) {
        return 'gacha';
    }
    if (route === ROUTES.recipes || route.startsWith('/recipes')) {
        return 'recipes';
    }
    if (route === ROUTES.profile || route === '/profile') {
        return 'profile';
    }
    return 'home';
}

function tabIdToPath(tab: MainTabId): TabRoute {
    switch (tab) {
        case 'ingredients':
            return '/ingredients';
        case 'gacha':
            return '/gacha';
        case 'recipes':
            return '/recipes';
        case 'profile':
            return '/profile';
        default:
            return '/';
    }
}

export function useMainTabPress(navigation: TabNavigation, currentTab: MainTabId) {
    return (route: string) => {
        const nextTab = routeToTabId(route);
        if (nextTab === currentTab) {
            return;
        }
        setTabReplaceAnimation(currentTab, nextTab);
        navigation.replace(tabIdToPath(nextTab));
    };
}

export function tabIdFromRoute(pathname: string): MainTabId {
    return routeToTabId(pathname);
}
