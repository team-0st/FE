import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { Txt } from '@toss/tds-react-native';
import { colors } from '../../shared/theme/colors';

type RecipeCompletedStampProps = {
    visible: boolean;
};

export function RecipeCompletedStamp({ visible }: RecipeCompletedStampProps) {
    if (!visible) {
        return null;
    }
    return (
        <View style={styles.stampWrap} pointerEvents="none">
            <View style={styles.stamp}>
                <Txt typography="t6" fontWeight="bold" style={styles.stampText}>
                    완료
                </Txt>
            </View>
        </View>
    );
}

export function RecipeListRowShell({ children, done }: PropsWithChildren<{ done: boolean }>) {
    return (
        <View style={styles.rowShell}>
            {children}
            <RecipeCompletedStamp visible={done} />
        </View>
    );
}

const styles = StyleSheet.create({
    rowShell: {
        position: 'relative',
        width: '100%',
    },
    stampWrap: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingRight: 16,
        zIndex: 2,
    },
    stamp: {
        transform: [{ rotate: '-14deg' }],
        borderWidth: 2.5,
        borderColor: colors.primary,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: 'rgba(237, 231, 246, 0.92)',
    },
    stampText: {
        color: colors.primaryDark,
        letterSpacing: 1,
    },
});
