import { Button, Top, Txt } from '@toss/tds-react-native';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
    GACHA_PROBABILITY_LINES,
    GACHA_PROBABILITY_TITLE,
} from '../../shared/constants/probabilityInfo';
import { useAppToast } from '../../shared/feedback/useAppToast';
import { ProbabilityInfoRow } from '../../shared/ui/ProbabilityInfoRow';
import { colors } from '../../shared/theme/colors';
import { StatCard } from '../../shared/ui/StatCard';
import { useUser } from '../user/UserProvider';
import {
    GACHA_PULL_COST_ECO_JAM,
    GACHA_REWARD_LABEL,
    GACHA_TEST_ECO_JAM_GRANT,
} from './gachaConfig';
import { formatGachaRewardMessage } from './gachaLogic';
import type { GachaReward } from './gachaTypes';

export function GachaScreen() {
    const { state, pullGacha, grantTestEcoJam } = useUser();
    const toast = useAppToast();
    const [lastReward, setLastReward] = useState<GachaReward | null>(null);
    const [isPulling, setIsPulling] = useState(false);
    const canPull = state.ecoJam >= GACHA_PULL_COST_ECO_JAM && !isPulling;
    const pullLabel = `에코잼 ${GACHA_PULL_COST_ECO_JAM}개로 뽑기`;

    const onPressPull = useCallback(async () => {
        if (!canPull) {
            toast.showError(`에코잼이 부족해요. (필요: ${GACHA_PULL_COST_ECO_JAM}개)`);
            return;
        }
        setIsPulling(true);
        try {
            const result = await pullGacha();
            if (!result.ok) {
                toast.showError(`에코잼이 부족해요. (필요: ${GACHA_PULL_COST_ECO_JAM}개)`);
                return;
            }
            setLastReward(result.reward);
            toast.showSuccess(formatGachaRewardMessage(result.reward, state));
        } finally {
            setIsPulling(false);
        }
    }, [canPull, pullGacha, state, toast]);

    return (
        <View style={styles.root}>
            <View style={styles.header}>
                <Top
                    title={<Top.TitleParagraph size={22}>가챠</Top.TitleParagraph>}
                    subtitle2={
                        <Top.SubtitleParagraph>에코잼으로 뽑아 보세요.</Top.SubtitleParagraph>
                    }
                />
                <View style={styles.stats}>
                    <StatCard label="보유 에코잼" value={`${state.ecoJam}개`} />
                    <StatCard label="알맹 포인트" value={`${state.totalPoints}P`} />
                </View>
                <View style={styles.probRow}>
                    <ProbabilityInfoRow
                        label="가챠·보상"
                        title={GACHA_PROBABILITY_TITLE}
                        lines={GACHA_PROBABILITY_LINES}
                    />
                </View>
            </View>
            <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
                <View style={styles.pot}>
                    <Txt typography="t1" style={styles.potEmoji}>
                        🎁
                    </Txt>
                    <Txt typography="t6" color="grey600" style={styles.potHint}>
                        1회 {GACHA_PULL_COST_ECO_JAM} 에코잼이 소모돼요.
                    </Txt>
                </View>
                {lastReward != null ? (
                    <View style={styles.resultCard}>
                        <Txt typography="t7" color="grey600">
                            직전 결과
                        </Txt>
                        <Txt typography="t4" fontWeight="bold" style={styles.resultTitle}>
                            {GACHA_REWARD_LABEL[lastReward.type]}
                        </Txt>
                        <Txt typography="t6" color="grey700">
                            {formatGachaRewardMessage(lastReward, state)}
                        </Txt>
                    </View>
                ) : null}
            </ScrollView>
            <View style={styles.footer}>
                <Button
                    size="large"
                    type="primary"
                    display="block"
                    disabled={!canPull}
                    onPress={() => void onPressPull()}
                >
                    {pullLabel}
                </Button>
                {__DEV__ ? (
                    <Button
                        size="medium"
                        type="dark"
                        style="weak"
                        display="block"
                        onPress={() => {
                            void (async () => {
                                await grantTestEcoJam(GACHA_TEST_ECO_JAM_GRANT);
                                toast.showSuccess(
                                    `테스트용 에코잼 ${GACHA_TEST_ECO_JAM_GRANT}개를 받았어요.`,
                                );
                            })();
                        }}
                    >
                        테스트용 에코잼 +{GACHA_TEST_ECO_JAM_GRANT}
                    </Button>
                ) : null}
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
    stats: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 4,
    },
    probRow: {
        marginTop: 8,
        marginBottom: 4,
    },
    body: {
        flex: 1,
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
    },
    pot: {
        alignItems: 'center',
        marginVertical: 16,
        paddingVertical: 16,
        backgroundColor: colors.heroTint,
        borderRadius: 16,
    },
    potEmoji: {
        marginBottom: 8,
    },
    potHint: {
        textAlign: 'center',
        paddingHorizontal: 16,
    },
    resultCard: {
        marginBottom: 8,
        padding: 16,
        borderRadius: 12,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
    resultTitle: {
        marginTop: 4,
        marginBottom: 4,
    },
    footer: {
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
        gap: 10,
        marginTop: 8,
    },
});
