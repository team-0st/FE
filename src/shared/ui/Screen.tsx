import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

type ScreenProps = PropsWithChildren<{
    scrollable?: boolean;
}>;

export function Screen({ children, scrollable = false }: ScreenProps) {
    if (scrollable) {
        return (
            <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
                {children}
            </ScrollView>
        );
    }
    return <View style={styles.screen}>{children}</View>;
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: 20,
        paddingBottom: 32,
    },
});
