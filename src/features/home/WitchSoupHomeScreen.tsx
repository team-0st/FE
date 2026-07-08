import { getIngredientById } from '@api/mock/ingredients';
import { getTodayRecipeHint } from '@api/mock/recipes';
import { Button, Txt } from '@toss/tds-react-native';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
    CHECK_IN_ALREADY_MESSAGE,
    NETWORK_ERROR_MESSAGE,
} from '../../shared/feedback/messages';
import { useAppToast } from '../../shared/feedback/useAppToast';
import { useUser } from '../user/UserProvider';
import { isUserCheckedInToday } from '../user/selectors';
import {
    SOUP_WEEKLY_PROBABILITY_LINES,
    SOUP_WEEKLY_PROBABILITY_TITLE,
} from '../../shared/constants/probabilityInfo';
import { ProbabilityInfoButton } from '../../shared/ui/ProbabilityInfoButton';
import { HomeNudgeBanner } from '../../shared/ui/HomeNudgeBanner';
import { StatCard } from '../../shared/ui/StatCard';
import { WeeklyMissionOxRow } from '../../shared/ui/WeeklyMissionOxRow';
import { colors } from '../../shared/theme/colors';

type WitchSoupHomeScreenProps = {
    onPressMissions: () => void;
};

function checkInDisplayValue(checkedIn: boolean, loading: boolean): string {
    if (loading) {
        return '…';
    }
    return checkedIn ? 'O' : 'X';
}

export function WitchSoupHomeScreen({ onPressMissions }: WitchSoupHomeScreenProps) {
    const { state, checkInToday } = useUser();
    const { showSuccess, showError, show } = useAppToast();
    const hint = getTodayRecipeHint();
    const checkedIn = isUserCheckedInToday(state);
    const [todayRewardLabel, setTodayRewardLabel] = useState<string | null>(null);
    const [checkInLoading, setCheckInLoading] = useState(false);

    const handleCheckIn = useCallback(async () => {
        if (checkedIn || checkInLoading) {
            return;
        }
        setCheckInLoading(true);
        try {
            const result = await checkInToday();
            if (result.ok) {
                const ingredient = getIngredientById(result.data.ingredientId);
                if (ingredient != null) {
                    const label = `${ingredient.emoji} ${ingredient.name}`;
                    setTodayRewardLabel(label);
                    showSuccess(`${ingredient.name} 재료를 받았어요.`);
                } else {
                    showSuccess('오늘의 재료를 받았어요.');
                }
                return;
            }
            if (result.code === 'ALREADY_CHECKED_IN') {
                show(CHECK_IN_ALREADY_MESSAGE);
                return;
            }
            showError(NETWORK_ERROR_MESSAGE);
        } finally {
            setCheckInLoading(false);
        }
    }, [checkInLoading, checkInToday, checkedIn, show, showError, showSuccess]);

    const checkInHint = checkedIn
        ? (todayRewardLabel ?? '오늘의 재료를 받았어요')
        : '탭하면 재료 1개';

    const weeklyNudge =
        state.weeklyMissionDone < state.weeklyMissionTotal
            ? '미션을 완료하면 재료가 쌓여요.'
            : !checkedIn
              ? '출석하고 랜덤 재료를 받아 보세요.'
              : null;

    return (
        <View style={styles.root}>
            <View style={styles.header}>
                {weeklyNudge != null ? <HomeNudgeBanner message={weeklyNudge} /> : null}
                <View style={styles.statRow}>
                    <StatCard
                        label="오늘 출석"
                        value={checkInDisplayValue(checkedIn, checkInLoading)}
                        hint={checkInHint}
                        hintTone="action"
                        onPress={() => {
                            void handleCheckIn();
                        }}
                        accessibilityLabel="오늘 출석하기"
                    />
                    <StatCard label="에코잼" value={`${state.ecoJam}잼`} hintTone="info" />
                    <StatCard label="알맹 포인트" value={`${state.totalPoints}P`} hintTone="info" />
                </View>
                <WeeklyMissionOxRow state={state} />
            </View>
            <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
                <View style={styles.stage}>
                    <Txt typography="t1" style={styles.witch}>
                        🐱‍👤
                    </Txt>
                    <Txt typography="t7" color="grey600">
                        마녀의 주방
                    </Txt>
                    <View style={styles.pot}>
                        <Txt typography="t1">🍲</Txt>
                        <Txt typography="t7" color="grey500">
                            휘리릭…
                        </Txt>
                    </View>
                    <View style={styles.hintBox}>
                        <View style={styles.hintTitleRow}>
                            <Txt typography="t7" fontWeight="semibold" style={{ color: colors.primary }}>
                                오늘의 레시피 힌트
                            </Txt>
                            <ProbabilityInfoButton
                                title={SOUP_WEEKLY_PROBABILITY_TITLE}
                                lines={SOUP_WEEKLY_PROBABILITY_LINES}
                            />
                        </View>
                        <Txt typography="t6" color="grey700" style={styles.hintText}>
                            {hint}
                        </Txt>
                    </View>
                </View>
            </ScrollView>
            <View style={styles.footer}>
                <Button
                    size="large"
                    type="primary"
                    display="block"
                    onPress={onPressMissions}
                    accessibilityLabel="오늘 미션 하고 재료 받기"
                >
                    오늘 미션 하고 재료 받기
                </Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    header: {
        paddingTop: 8,
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
    },
    statRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        width: '100%',
    },
    body: {
        flex: 1,
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
    },
    hintTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    stage: {
        alignItems: 'center',
        width: '100%',
        paddingVertical: 12,
        gap: 12,
    },
    witch: {
        marginBottom: 4,
    },
    pot: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: colors.primaryLight,
        borderWidth: 2,
        borderColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    hintBox: {
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        gap: 6,
    },
    hintText: {
        textAlign: 'center',
        lineHeight: 22,
    },
    footer: {
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
        marginTop: 8,
    },
});
