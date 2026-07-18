import { DAILY_MISSIONS } from '@api/mock/missions';
import { Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import { missionStatusFor } from '../../features/user/selectors';
import type { AppUserState } from '../../features/user/types';
import { colors } from '../theme/colors';

type WeeklyMissionOxRowProps = {
    state: AppUserState;
};

const WEEKDAY_LABELS = ['월', '화', '수', '목', '금'] as const;

/** Figma 04: 월~금 · 미션 O/X n/5 */
export function WeeklyMissionOxRow({ state }: WeeklyMissionOxRowProps) {
    const doneCount = DAILY_MISSIONS.filter(
        (mission) => missionStatusFor(state, mission.id) === 'completed',
    ).length;

    return (
        <View style={styles.wrap}>
            <View style={styles.header}>
                <Txt typography="t6" fontWeight="semibold">
                    이번 주 미션
                </Txt>
                <Txt typography="t7" color="grey600">
                    미션 O/X {doneCount}/{DAILY_MISSIONS.length}
                </Txt>
            </View>
            <View style={styles.row}>
                {DAILY_MISSIONS.map((mission, index) => {
                    const done = missionStatusFor(state, mission.id) === 'completed';
                    const day = WEEKDAY_LABELS[index] ?? `${index + 1}`;
                    return (
                        <View key={mission.id} style={styles.cell}>
                            <Txt typography="t7" color="grey500" style={styles.day}>
                                {day}
                            </Txt>
                            <View style={[styles.ox, done ? styles.oxDone : styles.oxPending]}>
                                <Txt
                                    typography="t6"
                                    fontWeight="bold"
                                    color={done ? 'green500' : 'grey500'}
                                >
                                    {done ? 'O' : 'X'}
                                </Txt>
                            </View>
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
        gap: 10,
        marginBottom: 4,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    row: {
        flexDirection: 'row',
        gap: 8,
        justifyContent: 'space-between',
    },
    cell: {
        flex: 1,
        alignItems: 'center',
        gap: 6,
    },
    day: {
        textAlign: 'center',
    },
    ox: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    oxDone: {
        backgroundColor: '#E8F5E9',
        borderColor: '#C8E6C9',
    },
    oxPending: {
        backgroundColor: colors.surface,
    },
});
