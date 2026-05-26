import { Txt } from '@toss/tds-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { ROUTES } from '../constants/routes';
import { colors } from '../theme/colors';

export type MainTabId = 'ingredients' | 'home' | 'recipes' | 'profile';

type TabItem = {
    id: MainTabId;
    label: string;
    route: (typeof ROUTES)[keyof typeof ROUTES];
};

export const MAIN_TABS: TabItem[] = [
    { id: 'ingredients', label: '재료', route: ROUTES.ingredients },
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
        <View style={styles.bar}>
            {MAIN_TABS.map((tab) => {
                const active = tab.id === activeTab;
                return (
                    <Pressable
                        key={tab.id}
                        onPress={() => onPressTab(tab.route)}
                        style={styles.item}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
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
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.tabBar,
        paddingBottom: 8,
        paddingTop: 8,
    },
    item: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 6,
    },
});
