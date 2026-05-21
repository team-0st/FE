import { Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

type RewardPointsBadgeProps = {
    points: number;
    label?: string;
};

export function RewardPointsBadge({ points, label = '포인트' }: RewardPointsBadgeProps) {
    return (
        <View style={styles.badge}>
            <Txt typography="t7" color="grey600">
                {label}
            </Txt>
            <Txt typography="t4" fontWeight="bold" color="blue500">
                {`+${points}P`}
            </Txt>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        alignItems: 'center',
        backgroundColor: colors.heroTint,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: colors.border,
    },
});
