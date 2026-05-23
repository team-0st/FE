import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

type ScreenProps = PropsWithChildren<{
    scrollable?: boolean;
    contentCentered?: boolean;
}>;

export function Screen({ children, scrollable = false, contentCentered = false }: ScreenProps) {
    if (scrollable) {
        return (
            <ScrollView
                style={styles.screen}
                contentContainerStyle={[styles.content, contentCentered && styles.contentCentered]}
            >
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
    contentCentered: {
        alignItems: 'center',
        maxWidth: 400,
        width: '100%',
        alignSelf: 'center',
    },
});
