import { useEffect } from 'react';
import { ROUTES } from '../constants/routes';

/** Granite NavigationProps.replace 는 라우트 리터럴 유니온 — 호출부에서 느슨하게 받음 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyNav = { replace: (route: any, params?: any) => void; dispatch?: (action: any) => void };

/**
 * 온보딩 완료 사용자가 `/onboarding*` 에 머물거나 뒤로가기로 들어오면 홈으로 보냄.
 * (생에 1회 온보딩)
 */
export function useRedirectHomeIfOnboarded(
    navigation: AnyNav,
    isReady: boolean,
    onboardingCompleted: boolean,
): void {
    useEffect(() => {
        if (isReady && onboardingCompleted) {
            navigation.replace(ROUTES.home);
        }
    }, [isReady, navigation, onboardingCompleted]);
}

/**
 * 온보딩 종료 후 스택을 홈만 남긴다. (뒤로가기 → 온보딩 방지)
 * Granite/React Navigation 에 reset이 있으면 사용, 없으면 replace.
 */
export function navigateHomeClearingOnboarding(navigation: AnyNav): void {
    if (typeof navigation.dispatch === 'function') {
        try {
            navigation.dispatch({
                type: 'RESET',
                payload: {
                    index: 0,
                    routes: [{ name: ROUTES.home }],
                },
            });
            return;
        } catch {
            // fall through
        }
    }
    navigation.replace(ROUTES.home);
}
