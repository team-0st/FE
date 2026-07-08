import { Txt } from '@toss/tds-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { ROUTES } from '../constants/routes';
import { colors } from '../theme/colors';

export type MainTabId = 'ingredients' | 'gacha' | 'home' | 'recipes' | 'profile';

type TabItem = {
    id: MainTabId;
    label: string;
    route: (typeof ROUTES)[keyof typeof ROUTES];
};

export const MAIN_TABS: TabItem[] = [
    { id: 'ingredients', label: '제작', route: ROUTES.ingredients },
    { id: 'gacha', label: '가챠', route: ROUTES.gacha },
    { id: 'home', label: '홈', route: ROUTES.home },
    { id: 'recipes', label: '레시피', route: ROUTES.recipes },
    { id: 'profile', label: '마이', route: ROUTES.profile },
];

type MainTabBarProps = {
    activeTab: MainTabId;
    onPressTab: (route: string) => void;
};

export function MainTabBar({ activeTab, onPressTab }: MainTabBarProps) {
    return (
        <View style={styles.bar} accessibilityRole="tablist">
            {MAIN_TABS.map((tab) => {
                const active = tab.id === activeTab;
                return (
                    <Pressable
                        key={tab.id}
                        onPress={() => onPressTab(tab.route)}
                        style={styles.item}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: active }}
                        accessibilityLabel={`${tab.label} 탭`}
                    >
                        <Txt
                            typography="t7"
                            fontWeight={active ? 'bold' : 'regular'}
                            style={{ color: active ? colors.primary : colors.textSecondary }}
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
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.tabBar,
        paddingTop: 8,
        paddingBottom: 8,
    },
    item: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
        minHeight: 44,
        justifyContent: 'center',
    },
});
