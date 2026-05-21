import { ROUTES } from '../constants/routes';
import type { MainTabId } from '../layout/MainTabBar';

type TabNavigation = {
    replace: (screen: '/' | '/missions' | '/ranking' | '/team' | '/profile') => void;
};

export function useMainTabPress(navigation: TabNavigation) {
    return (route: string) => {
        if (route === ROUTES.home) {
            navigation.replace('/');
            return;
        }
        if (route === ROUTES.missions) {
            navigation.replace('/missions');
            return;
        }
        if (route === ROUTES.ranking) {
            navigation.replace('/ranking');
            return;
        }
        if (route === ROUTES.team) {
            navigation.replace('/team');
            return;
        }
        if (route === ROUTES.profile) {
            navigation.replace('/profile');
        }
    };
}

export function tabIdFromRoute(pathname: string): MainTabId {
    if (pathname.startsWith('/missions')) {
        return 'missions';
    }
    if (pathname === ROUTES.ranking) {
        return 'ranking';
    }
    if (pathname.startsWith('/team')) {
        return 'team';
    }
    if (pathname === ROUTES.profile) {
        return 'profile';
    }
    return 'home';
}
