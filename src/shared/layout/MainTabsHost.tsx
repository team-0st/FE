import type { SoupCraftResponse } from '@api/notion/types';
import PagerView from '@granite-js/native/react-native-pager-view';
import { useSafeAreaInsets } from '@granite-js/native/react-native-safe-area-context';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { CraftScreen } from '../../features/craft/CraftScreen';
import { GachaScreen } from '../../features/gacha/GachaScreen';
import { WitchSoupHomeScreen } from '../../features/home/WitchSoupHomeScreen';
import { ProfileScreen } from '../../features/profile/ProfileScreen';
import { RecipesScreen } from '../../features/recipes/RecipesScreen';
import { colors } from '../theme/colors';
import { MainTabBar, MAIN_TAB_ORDER, type MainTabId } from './MainTabBar';

type MainTabsHostProps = {
    initialTab: MainTabId;
    onPressMissions: () => void;
    onPressPartnerShops: () => void;
    onSoupMade: (recipeId: string, craft: SoupCraftResponse) => void;
    onPressChangeShop: () => void;
    onPressAbout?: () => void;
    onPressRestartOnboarding?: () => void;
};

function tabToIndex(tab: MainTabId): number {
    const index = MAIN_TAB_ORDER.indexOf(tab);
    return index >= 0 ? index : 0;
}

/**
 * 메인 5탭을 한 셸에서 가로 스와이프·탭 전환.
 * 하단 인디케이터는 페이지 스크롤에 연동된다.
 */
export function MainTabsHost({
    initialTab,
    onPressMissions,
    onPressPartnerShops,
    onSoupMade,
    onPressChangeShop,
    onPressAbout,
    onPressRestartOnboarding,
}: MainTabsHostProps) {
    const insets = useSafeAreaInsets();
    const initialIndex = tabToIndex(initialTab);
    const pagerRef = useRef<PagerView>(null);
    const [pageIndex, setPageIndex] = useState(initialIndex);
    const [visited, setVisited] = useState(() => new Set<number>([initialIndex]));
    const scrollProgress = useRef(new Animated.Value(initialIndex)).current;

    useEffect(() => {
        const next = tabToIndex(initialTab);
        setPageIndex(next);
        scrollProgress.setValue(next);
        setVisited((prev) => {
            if (prev.has(next)) {
                return prev;
            }
            const copy = new Set(prev);
            copy.add(next);
            return copy;
        });
        pagerRef.current?.setPageWithoutAnimation(next);
    }, [initialTab, scrollProgress]);

    const markVisited = useCallback((index: number) => {
        setVisited((prev) => {
            if (prev.has(index)) {
                return prev;
            }
            const copy = new Set(prev);
            copy.add(index);
            return copy;
        });
    }, []);

    const onPressTab = useCallback(
        (tab: MainTabId) => {
            const next = tabToIndex(tab);
            if (next === pageIndex) {
                return;
            }
            markVisited(next);
            pagerRef.current?.setPage(next);
        },
        [markVisited, pageIndex],
    );

    const pages = useMemo(
        () =>
            MAIN_TAB_ORDER.map((tabId, index) => {
                const ready = visited.has(index);
                return (
                    <View key={tabId} style={styles.page} collapsable={false}>
                        {!ready ? null : tabId === 'home' ? (
                            <WitchSoupHomeScreen
                                onPressMissions={onPressMissions}
                                onPressPartnerShops={onPressPartnerShops}
                            />
                        ) : tabId === 'ingredients' ? (
                            <CraftScreen onSoupMade={onSoupMade} active={index === pageIndex} />
                        ) : tabId === 'gacha' ? (
                            <GachaScreen />
                        ) : tabId === 'recipes' ? (
                            <RecipesScreen />
                        ) : (
                            <ProfileScreen
                                onPressChangeShop={onPressChangeShop}
                                onPressAbout={onPressAbout}
                                onPressRestartOnboarding={onPressRestartOnboarding}
                            />
                        )}
                    </View>
                );
            }),
        [
            visited,
            pageIndex,
            onPressMissions,
            onPressPartnerShops,
            onSoupMade,
            onPressChangeShop,
            onPressAbout,
            onPressRestartOnboarding,
        ],
    );

    const activeTab = MAIN_TAB_ORDER[pageIndex] ?? 'home';

    return (
        <View style={[styles.root, { paddingTop: insets.top }]}>
            <PagerView
                ref={pagerRef}
                style={styles.pager}
                initialPage={initialIndex}
                onPageScroll={(event) => {
                    const { position, offset } = event.nativeEvent;
                    scrollProgress.setValue(position + offset);
                }}
                onPageSelected={(event) => {
                    const next = event.nativeEvent.position;
                    setPageIndex(next);
                    markVisited(next);
                }}
            >
                {pages}
            </PagerView>
            <MainTabBar
                activeTab={activeTab}
                scrollProgress={scrollProgress}
                onPressTab={onPressTab}
                bottomInset={insets.bottom}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.background,
    },
    pager: {
        flex: 1,
        overflow: 'hidden',
    },
    page: {
        flex: 1,
    },
});
