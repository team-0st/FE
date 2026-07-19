import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from '@granite-js/native/react-native-safe-area-context';
import { colors } from '../theme/colors';
import { MainTabBar, type MainTabId } from './MainTabBar';

type MainTabShellProps = PropsWithChildren<{
    activeTab: MainTabId;
    onPressTab: (route: string) => void;
}>;

/** Figma: 콘텐츠 위 · Tab Bar 하단 고정 · 상태바/홈 인디케이터 safe area */
export function MainTabShell({ activeTab, onPressTab, children }: MainTabShellProps) {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.root, { paddingTop: insets.top }]}>
            <View style={styles.content}>{children}</View>
            <MainTabBar
                activeTab={activeTab}
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
    content: {
        flex: 1,
    },
});
