import { ROUTES } from '../constants/routes';
import type { MainTabId } from '../layout/MainTabBar';

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

export function tabIdFromRoute(pathname: string): MainTabId {
    return routeToTabId(pathname);
}
