import { Asset, Badge, frameShape, Txt } from '@toss/tds-react-native';
import type { Mission } from '@api/mock';
import { formatMissionIngredientReward } from '@api/mock/ingredients';
import { missionStatusLabel } from '@api/mock/missions';
import type { MissionProgressStatus } from '../../features/user/types';
import { Pressable, StyleSheet, View } from 'react-native';
import { TDS_ICON } from '../constants/tdsAssets';
import { colors } from '../theme/colors';

type MissionCardProps = {
    mission: Mission;
    status: MissionProgressStatus;
    onPress: () => void;
};

export function MissionCard({ mission, status, onPress }: MissionCardProps) {
    const isCompleted = status === 'completed';

    return (
        <Pressable onPress={onPress} style={styles.card}>
            <Asset.Icon
                name={TDS_ICON.missionRow}
                frameShape={frameShape.CircleSmall}
                backgroundColor={colors.primaryLight}
                accessibilityLabel={mission.title}
            />
            <Txt typography="t6" fontWeight="bold" numberOfLines={2} style={styles.title}>
                {mission.title}
            </Txt>
            <Txt typography="t7" color="grey600" numberOfLines={2}>
                {mission.description}
            </Txt>
            <View style={styles.footer}>
                <Badge
                    size="tiny"
                    badgeStyle="weak"
                    type={isCompleted ? 'green' : 'blue'}
                >
                    {isCompleted ? missionStatusLabel(status) : formatMissionIngredientReward(mission.id)}
                </Badge>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        width: 156,
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 14,
        marginRight: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    title: {
        marginTop: 8,
        marginBottom: 4,
    },
    footer: {
        marginTop: 10,
    },
});
