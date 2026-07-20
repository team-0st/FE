import { MISSION_RANDOM_REWARD_LABEL } from '@api/mock/ingredients';
import { Asset, frameShape, Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import { TDS_ICON } from '../constants/tdsAssets';
import { colors } from '../theme/colors';

type RandomMissionRewardBadgeProps = {
    /** 특별 미션처럼 재료가 고정돼 있으면 실제 재료 이름을 넘겨주세요. */
    label?: string;
    subtitle?: string;
};

export function RandomMissionRewardBadge({
    label = MISSION_RANDOM_REWARD_LABEL,
    subtitle = '완료하면 재료 풀에서 1종을 받아요',
}: RandomMissionRewardBadgeProps = {}) {
    return (
        <View style={styles.badge}>
            <Asset.Icon
                name={TDS_ICON.gachaGift}
                frameShape={frameShape.CircleMedium}
                backgroundColor={colors.surface}
                accessibilityLabel="재료 보상"
            />
            <Txt typography="t6" fontWeight="bold">
                {label}
            </Txt>
            <Txt typography="t7" color="grey600">
                {subtitle}
            </Txt>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        padding: 16,
        borderRadius: 12,
        backgroundColor: colors.primaryLight,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        gap: 4,
    },
});
