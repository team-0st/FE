import { DAILY_MISSIONS } from '@api/mock/missions';
import { HOME_DECOR } from '../constants/homeDecorAssets';
import { Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import { missionStatusFor } from '../../features/user/selectors';
import type { AppUserState } from '../../features/user/types';
import { colors } from '../theme/colors';
import { BrandEmojiImage } from './BrandEmojiImage';

type WeeklyMissionOxRowProps = {
    state: AppUserState;
};

const STAMP_SIZE = 28;

/**
 * 이번 주 미션 스탬프 — 요일/카운트 라벨 없음.
 * 완료 개수만큼 왼쪽부터 완료 스탬프로 채운다 (미션·요일 매핑 없음).
 */
export function WeeklyMissionOxRow({ state }: WeeklyMissionOxRowProps) {
    const total = DAILY_MISSIONS.length;
    const doneCount = DAILY_MISSIONS.filter(
        (mission) => missionStatusFor(state, mission.id) === 'completed',
    ).length;

    return (
        <View style={styles.wrap}>
            <Txt typography="t6" fontWeight="semibold">
                이번 주 미션
            </Txt>
            <View style={styles.row} accessibilityLabel={`이번 주 미션 ${doneCount}개 완료`}>
                {Array.from({ length: total }, (_, index) => {
                    const done = index < doneCount;
                    return (
                        <View
                            key={`stamp-${index}`}
                            style={[styles.cell, done ? styles.cellDone : styles.cellPending]}
                        >
                            <BrandEmojiImage
                                source={done ? HOME_DECOR.stampDone : HOME_DECOR.stampPending}
                                size={STAMP_SIZE}
                                containerStyle={styles.stamp}
                                accessibilityLabel={done ? '완료' : '미완료'}
                            />
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
        gap: 12,
        marginBottom: 4,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
    },
    row: {
        flexDirection: 'row',
        gap: 6,
        justifyContent: 'space-between',
    },
    cell: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        minWidth: 0,
        minHeight: 48,
    },
    cellDone: {
        backgroundColor: colors.statusDoneBg,
        borderColor: colors.statusDoneBorder,
    },
    cellPending: {
        backgroundColor: colors.surface,
        borderColor: colors.border,
    },
    stamp: {
        marginRight: 0,
    },
});
