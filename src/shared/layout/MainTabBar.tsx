import { Asset, Txt, frameShape } from '@toss/tds-react-native';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
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

type MainTabBarProps = {
    activeTab: MainTabId;
    onPressTab: (route: string) => void;
    /** 홈 인디케이터 등 하단 safe area */
    bottomInset?: number;
};

export function MainTabBar({ activeTab, onPressTab, bottomInset = 0 }: MainTabBarProps) {
    return (
        <View
            style={[styles.dock, { paddingBottom: Math.max(10, bottomInset) }]}
            pointerEvents="box-none"
        >
            <View style={styles.bar} accessibilityRole="tablist">
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
                                onPressTab(tab.route);
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
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.tabBar,
        borderRadius: 28,
        paddingVertical: 10,
        paddingHorizontal: 6,
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
    item: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 44,
    },
});
