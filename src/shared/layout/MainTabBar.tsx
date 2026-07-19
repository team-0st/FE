import { Asset, Txt, frameShape } from '@toss/tds-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
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
            style={[styles.bar, { paddingBottom: Math.max(12, bottomInset) }]}
            accessibilityRole="tablist"
        >
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
                            style={{ color: tint, marginTop: 4 }}
                        >
                            {tab.label}
                        </Txt>
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    bar: {
        flexDirection: 'row',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.border,
        backgroundColor: colors.tabBar,
        paddingTop: 8,
        paddingHorizontal: 2,
    },
    item: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
    },
});
