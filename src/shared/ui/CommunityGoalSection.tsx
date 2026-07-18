import {
    getCommunityGoalProgressPercent,
    PILOT_COMMUNITY_GOAL,
} from '../constants/communityGoalMock';
import { Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

export function CommunityGoalSection() {
    const goal = PILOT_COMMUNITY_GOAL;
    const percent = getCommunityGoalProgressPercent(goal);

    return (
        <View style={styles.wrap}>
            <Txt typography="t6" fontWeight="semibold">
                {goal.title} · {percent}%
            </Txt>
            <Txt typography="t7" color="grey600">
                {goal.description}
            </Txt>
            <View style={styles.track}>
                <View style={[styles.fill, { width: `${percent}%` }]} />
            </View>
            <Txt typography="t7" color="grey500" style={styles.meta}>
                {goal.current}
                {goal.unit} / 목표 {goal.target}
                {goal.unit}
            </Txt>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 16,
        gap: 8,
    },
    track: {
        width: '100%',
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.primaryLight,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: 4,
    },
    meta: {
        textAlign: 'right',
    },
});
