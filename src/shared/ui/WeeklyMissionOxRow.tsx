import { DAILY_MISSIONS } from '@api/mock/missions';
import { HOME_DECOR, progressCheerSource } from '../constants/homeDecorAssets';
import { ProgressBar, Txt } from '@toss/tds-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { missionStatusFor } from '../../features/user/selectors';
import type { AppUserState } from '../../features/user/types';
import {
    computeCheckInStreak,
    formatDateKey,
    weekDateKeys,
    weekDayLabel,
} from '../../features/user/userStateLogic';
import { colors } from '../theme/colors';
import { BrandEmojiImage } from './BrandEmojiImage';

type WeeklyMissionOxRowProps = {
    state: AppUserState;
    checkInLoading?: boolean;
    onPressTodayCheckIn?: () => void;
};

const STAMP_SIZE = 28;
const CHEER_SIZE = 22;

type CellKind = 'done' | 'today' | 'pending';

function cellKind(dateKey: string, today: string, checkedDates: Set<string>): CellKind {
    if (checkedDates.has(dateKey)) {
        return 'done';
    }
    if (dateKey === today) {
        return 'today';
    }
    return 'pending';
}

function stampSource(kind: CellKind) {
    if (kind === 'done') {
        return HOME_DECOR.stampDone;
    }
    if (kind === 'today') {
        return HOME_DECOR.stampProgress;
    }
    return HOME_DECOR.stampPending;
}

/**
 * 이번 주 출석(월~일 7칸) + 개인 미션 완료 게이지.
 */
export function WeeklyMissionOxRow({
    state,
    checkInLoading = false,
    onPressTodayCheckIn,
}: WeeklyMissionOxRowProps) {
    const today = formatDateKey(new Date());
    const weekKeys = weekDateKeys();
    const checkedDates = new Set(state.checkInDates);
    const streak = computeCheckInStreak(state.checkInDates, today);
    const doneThisWeek = weekKeys.filter((key) => checkedDates.has(key)).length;
    const checkedInToday = checkedDates.has(today) || state.lastCheckInDate === today;

    const missionTotal = DAILY_MISSIONS.length;
    const missionDone = DAILY_MISSIONS.filter(
        (mission) => missionStatusFor(state, mission.id) === 'completed',
    ).length;
    const missionPercent =
        missionTotal === 0 ? 0 : Math.min(100, Math.round((missionDone / missionTotal) * 100));
    const cheer = progressCheerSource(missionPercent);

    return (
        <View style={styles.wrap}>
            <View style={styles.header}>
                <Txt typography="t6" fontWeight="semibold">
                    이번 주 출석
                </Txt>
                <Txt typography="t7" color="grey600">
                    {streak > 0 ? `연속 ${streak}일` : '오늘 출석하고 연속일을 쌓아 보세요'}
                </Txt>
            </View>
            <View
                style={styles.row}
                accessibilityLabel={`이번 주 출석 ${doneThisWeek}일 완료${streak > 0 ? `, 연속 ${streak}일` : ''}`}
            >
                {weekKeys.map((dateKey, index) => {
                    const kind = cellKind(dateKey, today, checkedDates);
                    const isToday = dateKey === today;
                    const canCheckIn =
                        isToday && !checkedInToday && !checkInLoading && onPressTodayCheckIn != null;
                    const label = weekDayLabel(index);
                    const cellStyle = [
                        styles.cell,
                        kind === 'done'
                            ? styles.cellDone
                            : kind === 'today'
                              ? styles.cellToday
                              : styles.cellPending,
                    ];
                    const content = (
                        <>
                            <BrandEmojiImage
                                source={stampSource(kind)}
                                size={STAMP_SIZE}
                                containerStyle={styles.stamp}
                                accessibilityLabel={
                                    kind === 'done'
                                        ? `${label} 출석 완료`
                                        : kind === 'today'
                                          ? `${label} 오늘 출석`
                                          : `${label} 미출석`
                                }
                            />
                            <Txt typography="t7" color="grey600" style={styles.dayLabel}>
                                {label}
                            </Txt>
                        </>
                    );

                    if (canCheckIn) {
                        return (
                            <Pressable
                                key={dateKey}
                                style={cellStyle}
                                onPress={onPressTodayCheckIn}
                                accessibilityRole="button"
                                accessibilityLabel="오늘 출석하기"
                            >
                                {content}
                            </Pressable>
                        );
                    }

                    return (
                        <View key={dateKey} style={cellStyle}>
                            {content}
                        </View>
                    );
                })}
            </View>
            {checkInLoading ? (
                <Txt typography="t7" color="blue500" style={styles.hint}>
                    출석 중…
                </Txt>
            ) : checkedInToday ? (
                <Txt typography="t7" color={colors.success} style={styles.hint}>
                    출석 완료
                </Txt>
            ) : (
                <Txt typography="t7" color="blue500" style={styles.hint}>
                    오늘 칸을 눌러 출석하고 재료를 받으세요
                </Txt>
            )}

            <View style={styles.divider} />

            <View style={styles.missionHeader}>
                <Txt typography="t6" fontWeight="semibold">
                    내 미션 완료
                </Txt>
                <Txt typography="t7" color="grey600">
                    {missionDone}/{missionTotal} · {missionPercent}%
                </Txt>
            </View>
            <View style={styles.barRow}>
                <ProgressBar
                    progress={missionPercent}
                    size="normal"
                    color={colors.primary}
                    style={styles.bar}
                />
                <BrandEmojiImage
                    source={cheer}
                    size={CHEER_SIZE}
                    containerStyle={styles.cheer}
                    accessibilityLabel="미션 진행 응원"
                />
            </View>
            <Txt typography="t7" color="grey500" style={styles.missionMeta}>
                개인 미션 {missionDone}개 완료 · 목표 {missionTotal}개
            </Txt>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
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
        minHeight: 56,
        gap: 2,
    },
    cellDone: {
        backgroundColor: colors.statusDoneBg,
        borderColor: colors.statusDoneBorder,
    },
    cellToday: {
        backgroundColor: colors.statusProgressBg,
        borderColor: colors.statusProgressBorder,
    },
    cellPending: {
        backgroundColor: colors.surface,
        borderColor: colors.border,
    },
    stamp: {
        marginRight: 0,
    },
    dayLabel: {
        lineHeight: 16,
    },
    hint: {
        lineHeight: 18,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: 2,
    },
    missionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    barRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    bar: {
        flex: 1,
    },
    cheer: {
        marginRight: 0,
        flexShrink: 0,
    },
    missionMeta: {
        textAlign: 'right',
    },
});
