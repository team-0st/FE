import type { MainTabId } from '../layout/MainTabBar';
import { MAIN_TAB_ORDER } from '../layout/MainTabBar';

export { MAIN_TAB_ORDER };

export type TabReplaceAnimation = 'push' | 'pop';

let pendingReplaceAnimation: TabReplaceAnimation = 'push';

/**
 * 탭 전환 방향에 따라 replace 애니메이션을 정한다.
 * (딥링크·결과 화면에서 탭 루트로 진입할 때 사용)
 * - 오른쪽 탭으로 이동 → push (새 화면이 오른쪽에서 들어옴)
 * - 왼쪽 탭으로 이동 → pop (반대 방향)
 */
export function setTabReplaceAnimation(fromTab: MainTabId, toTab: MainTabId): void {
    const fromIndex = MAIN_TAB_ORDER.indexOf(fromTab);
    const toIndex = MAIN_TAB_ORDER.indexOf(toTab);
    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
        pendingReplaceAnimation = 'push';
        return;
    }
    pendingReplaceAnimation = toIndex > fromIndex ? 'push' : 'pop';
}

export function getTabReplaceAnimation(): TabReplaceAnimation {
    return pendingReplaceAnimation;
}

/** 메인 탭 화면용 — 딥링크 진입 시 가로 슬라이드 */
export function mainTabScreenOptions() {
    return {
        animationTypeForReplace: getTabReplaceAnimation(),
        /** Granite 기본 Android `fade_from_bottom` 대신 가로 슬라이드 */
        animation: 'ios_from_right' as const,
        headerShown: false,
    };
}
