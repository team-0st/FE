import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';
import { MainTabBar, type MainTabId } from './MainTabBar';

type MainTabShellProps = PropsWithChildren<{
    activeTab: MainTabId;
    onPressTab: (route: string) => void;
}>;

export function MainTabShell({ activeTab, onPressTab, children }: MainTabShellProps) {
    return (
        <View style={styles.root}>
            <MainTabBar activeTab={activeTab} onPressTab={onPressTab} />
            <View style={styles.content}>{children}</View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
    },
});
