import { Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

type HomeNudgeBannerProps = {
    message: string;
};

export function HomeNudgeBanner({ message }: HomeNudgeBannerProps) {
    return (
        <View style={styles.banner} accessibilityRole="text">
            <Txt typography="t7" color="grey700" style={styles.text}>
                {message}
            </Txt>
        </View>
    );
}

const styles = StyleSheet.create({
    banner: {
        width: '100%',
        backgroundColor: colors.primaryLight,
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 12,
    },
    text: {
        textAlign: 'center',
        lineHeight: 20,
    },
});
