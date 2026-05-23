import { Txt } from '@toss/tds-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { ROUTES } from '../constants/routes';
import { colors } from '../theme/colors';

export type MainTabId = 'home' | 'missions' | 'shop' | 'profile';

type TabItem = {
    id: MainTabId;
    label: string;
    route: (typeof ROUTES)[keyof typeof ROUTES];
};

export const MAIN_TABS: TabItem[] = [
    { id: 'home', label: '홈', route: ROUTES.home },
    { id: 'missions', label: '실천', route: ROUTES.missions },
    { id: 'shop', label: '내 샵', route: ROUTES.shop },
    { id: 'profile', label: '기록', route: ROUTES.profile },
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
                            color={active ? 'blue500' : 'grey500'}
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
