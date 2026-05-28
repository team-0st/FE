import { MISSION_RANDOM_REWARD_LABEL } from '@api/mock/ingredients';
import { Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

export function RandomMissionRewardBadge() {
    return (
        <View style={styles.badge}>
            <Txt typography="t3">🎲</Txt>
            <Txt typography="t6" fontWeight="bold">
                {MISSION_RANDOM_REWARD_LABEL}
            </Txt>
            <Txt typography="t7" color="grey600">
                검수 후 풀에서 1종이 지급돼요
            </Txt>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        marginTop: 16,
        padding: 16,
        borderRadius: 12,
        backgroundColor: colors.primaryLight,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        gap: 4,
    },
});
