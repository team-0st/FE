import { DAILY_MISSIONS } from '@api/mock/missions';
import { Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import { missionStatusFor } from '../../features/user/selectors';
import type { AppUserState } from '../../features/user/types';
import { colors } from '../theme/colors';

type WeeklyMissionOxRowProps = {
    state: AppUserState;
};

export function WeeklyMissionOxRow({ state }: WeeklyMissionOxRowProps) {
    return (
        <View style={styles.wrap}>
            <Txt typography="t7" color="grey600">
                이번 주 미션
            </Txt>
            <View style={styles.row}>
                {DAILY_MISSIONS.map((mission) => {
                    const done = missionStatusFor(state, mission.id) === 'completed';
                    return (
                        <View key={mission.id} style={[styles.cell, done ? styles.cellDone : styles.cellPending]}>
                            <Txt typography="t6" fontWeight="bold" color={done ? 'green500' : 'grey500'}>
                                {done ? 'O' : 'X'}
                            </Txt>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        width: '100%',
        gap: 8,
        marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
        gap: 8,
        justifyContent: 'space-between',
    },
    cell: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
    },
    cellDone: {
        backgroundColor: '#E8F5E9',
    },
    cellPending: {
        backgroundColor: colors.surface,
    },
});
