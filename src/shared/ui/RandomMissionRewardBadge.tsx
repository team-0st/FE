import { MISSION_RANDOM_REWARD_LABEL } from '@api/mock/ingredients';
import { Asset, frameShape, Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import { TDS_ICON } from '../constants/tdsAssets';
import { colors } from '../theme/colors';

export function RandomMissionRewardBadge() {
    return (
        <View style={styles.badge}>
            <Asset.Icon
                name={TDS_ICON.gachaGift}
                frameShape={frameShape.CircleMedium}
                backgroundColor={colors.surface}
                accessibilityLabel="랜덤 재료 보상"
            />
            <Txt typography="t6" fontWeight="bold">
                {MISSION_RANDOM_REWARD_LABEL}
            </Txt>
            <Txt typography="t7" color="grey600">
                완료하면 재료 풀에서 1종을 받아요
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
