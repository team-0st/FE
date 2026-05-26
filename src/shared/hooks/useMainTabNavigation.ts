import { ROUTES } from '../constants/routes';
import type { MainTabId } from '../layout/MainTabBar';

type TabNavigation = {
    replace: (screen: '/' | '/ingredients' | '/recipes' | '/profile') => void;
};

export function useMainTabPress(navigation: TabNavigation) {
    return (route: string) => {
        if (route === ROUTES.home) {
            navigation.replace('/');
            return;
        }
        if (route === ROUTES.ingredients) {
            navigation.replace('/ingredients');
            return;
        }
        if (route === ROUTES.recipes) {
            navigation.replace('/recipes');
            return;
        }
        if (route === ROUTES.profile) {
            navigation.replace('/profile');
        }
    };
}

export function tabIdFromRoute(pathname: string): MainTabId {
    if (pathname.startsWith('/ingredients')) {
        return 'ingredients';
    }
    if (pathname.startsWith('/recipes')) {
        return 'recipes';
    }
    if (pathname === ROUTES.profile) {
        return 'profile';
    }
    return 'home';
}
