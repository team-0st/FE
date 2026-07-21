import { Asset, Txt, frameShape } from '@toss/tds-react-native';
import { useState } from 'react';
import {
    Animated,
    type LayoutChangeEvent,
    Platform,
    Pressable,
    StyleSheet,
    View,
} from 'react-native';
import { ROUTES } from '../constants/routes';
import { TDS_ICON } from '../constants/tdsAssets';
import { colors } from '../theme/colors';

export type MainTabId = 'home' | 'ingredients' | 'gacha' | 'recipes' | 'profile';

type TabItem = {
    id: MainTabId;
    label: string;
    /** Figma Tab Bar Icons Resource= 값 그대로 */
    iconName: string;
    route: (typeof ROUTES)[keyof typeof ROUTES];
};

/**
 * 메인 탭 아이콘:
 * 홈=home · 제작=food(스프) · 가챠=gift · 레시피=document · 마이=user
 * 앱인토스 비게임 가이드: 플로팅 형태 (최대 5탭)
 */
export const MAIN_TABS: TabItem[] = [
    { id: 'home', label: '홈', iconName: TDS_ICON.tabHome, route: ROUTES.home },
    { id: 'ingredients', label: '제작', iconName: TDS_ICON.tabCraft, route: ROUTES.ingredients },
    { id: 'gacha', label: '가챠', iconName: TDS_ICON.tabGacha, route: ROUTES.gacha },
    { id: 'recipes', label: '레시피', iconName: TDS_ICON.tabRecipes, route: ROUTES.recipes },
    { id: 'profile', label: '마이', iconName: TDS_ICON.tabProfile, route: ROUTES.profile },
];

/** 탭바 왼쪽→오른쪽 순서 */
export const MAIN_TAB_ORDER: readonly MainTabId[] = MAIN_TABS.map((tab) => tab.id);

const TAB_COUNT = MAIN_TABS.length;
const INDICATOR_WIDTH = 44;
const INDICATOR_HEIGHT = 36;

type MainTabBarProps = {
    activeTab: MainTabId;
    onPressTab: (tab: MainTabId) => void;
    /** 페이지 스크롤 진행도 (0 ~ TAB_COUNT-1) */
    scrollProgress: Animated.Value;
    /** 홈 인디케이터 등 하단 safe area */
    bottomInset?: number;
};

export function MainTabBar({
    activeTab,
    onPressTab,
    scrollProgress,
    bottomInset = 0,
}: MainTabBarProps) {
    const [trackWidth, setTrackWidth] = useState(0);

    const onTrackLayout = (event: LayoutChangeEvent) => {
        const width = event.nativeEvent.layout.width;
        const horizontalPadding = 12;
        setTrackWidth(Math.max(0, width - horizontalPadding));
    };

    const itemWidth = trackWidth > 0 ? trackWidth / TAB_COUNT : 0;
    const indicatorTranslateX =
        itemWidth > 0
            ? scrollProgress.interpolate({
                  inputRange: MAIN_TABS.map((_, index) => index),
                  outputRange: MAIN_TABS.map(
                      (_, index) => index * itemWidth + (itemWidth - INDICATOR_WIDTH) / 2,
                  ),
              })
            : 0;

    return (
        <View
            style={[styles.dock, { paddingBottom: Math.max(10, bottomInset) }]}
            pointerEvents="box-none"
        >
            <View style={styles.bar} accessibilityRole="tablist" onLayout={onTrackLayout}>
                {itemWidth > 0 ? (
                    <Animated.View
                        pointerEvents="none"
                        style={[
                            styles.indicator,
                            {
                                width: INDICATOR_WIDTH,
                                height: INDICATOR_HEIGHT,
                                transform: [{ translateX: indicatorTranslateX }],
                            },
                        ]}
                    />
                ) : null}
                {MAIN_TABS.map((tab) => {
                    const active = tab.id === activeTab;
                    const tint = active ? colors.primary : colors.textSecondary;
                    return (
                        <Pressable
                            key={tab.id}
                            onPress={() => {
                                if (active) {
                                    return;
                                }
                                onPressTab(tab.id);
                            }}
                            style={styles.item}
                            accessibilityRole="tab"
                            accessibilityState={{ selected: active }}
                            accessibilityLabel={`${tab.label} 탭`}
                        >
                            <Asset.Icon
                                name={tab.iconName}
                                frameShape={frameShape.CleanW24}
                                color={tint}
                                accessibilityLabel={tab.label}
                            />
                            <Txt
                                typography="st13"
                                fontWeight={active ? 'bold' : 'medium'}
                                style={{ color: tint, marginTop: 2 }}
                            >
                                {tab.label}
                            </Txt>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    dock: {
        paddingHorizontal: 16,
        paddingTop: 4,
    },
    bar: {
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.tabBar,
        borderRadius: 28,
        paddingVertical: 10,
        paddingHorizontal: 6,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.12,
                shadowRadius: 12,
            },
            android: {
                elevation: 8,
            },
            default: {},
        }),
    },
    indicator: {
        position: 'absolute',
        left: 6,
        top: '50%',
        marginTop: -INDICATOR_HEIGHT / 2,
        borderRadius: INDICATOR_HEIGHT / 2,
        backgroundColor: colors.primaryLight,
    },
    item: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 44,
        zIndex: 1,
    },
});
