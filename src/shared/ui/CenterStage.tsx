import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

type CenterStageProps = PropsWithChildren<{
    footer?: React.ReactNode;
}>;

export function CenterStage({ children, footer }: CenterStageProps) {
    return (
        <View style={styles.root}>
            <View style={styles.stage}>{children}</View>
            {footer != null ? <View style={styles.footer}>{footer}</View> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    stage: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        maxWidth: 400,
        width: '100%',
        alignSelf: 'center',
    },
    footer: {
        padding: 20,
        maxWidth: 400,
        width: '100%',
        alignSelf: 'center',
    },
});
