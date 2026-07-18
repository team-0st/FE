import { BottomCTA, Button, Top, Txt } from '@toss/tds-react-native';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { BRAND_ASSET } from '../../shared/constants/brandAssets';
import {
    GACHA_PROBABILITY_LINES,
    GACHA_PROBABILITY_TITLE,
} from '../../shared/constants/probabilityInfo';
import { useAppToast } from '../../shared/feedback/useAppToast';
import { buildGachaShareMessage } from '../../shared/feedback/shareResult';
import { ProbabilityInfoRow } from '../../shared/ui/ProbabilityInfoRow';
import { ShareResultButton } from '../../shared/ui/ShareResultButton';
import { TdsHeroAsset } from '../../shared/ui/TdsHeroAsset';
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

type GachaPhase = 'idle' | 'pulling' | 'reveal' | 'result';

const PHASE_MS = {
    pulling: 500,
    reveal: 550,
} as const;

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

export function GachaScreen() {
    const { state, pullGacha, grantTestEcoJam } = useUser();
    const toast = useAppToast();
    const [lastReward, setLastReward] = useState<GachaReward | null>(null);
    const [phase, setPhase] = useState<GachaPhase>('idle');
    const isBusy = phase === 'pulling' || phase === 'reveal';
    const canPull = state.ecoJam >= GACHA_PULL_COST_ECO_JAM && !isBusy;
    const pullLabel = `에코잼 ${GACHA_PULL_COST_ECO_JAM}개로 뽑기`;
    const canShareLast = lastReward != null && lastReward.type !== 'FAIL';

    const heroSource =
        phase === 'pulling'
            ? BRAND_ASSET.gachaPulling
            : phase === 'reveal'
              ? BRAND_ASSET.gachaReveal
              : phase === 'result' && lastReward != null && lastReward.type !== 'FAIL'
                ? BRAND_ASSET.heroParty
                : phase === 'result'
                  ? BRAND_ASSET.gachaResult
                  : BRAND_ASSET.heroGacha;

    const heroLabel =
        phase === 'pulling'
            ? '가챠 뽑는 중'
            : phase === 'reveal'
              ? '결과 공개'
              : phase === 'result'
                ? '가챠 결과'
                : '가챠 상자';

    const onPressPull = useCallback(async () => {
        if (!canPull) {
            toast.showError(`에코잼이 부족해요. (필요: ${GACHA_PULL_COST_ECO_JAM}개)`);
            return;
        }
        setPhase('pulling');
        try {
            await sleep(PHASE_MS.pulling);
            setPhase('reveal');
            await sleep(PHASE_MS.reveal);
            const result = await pullGacha();
            if (!result.ok) {
                setPhase('idle');
                toast.showError(`에코잼이 부족해요. (필요: ${GACHA_PULL_COST_ECO_JAM}개)`);
                return;
            }
            setLastReward(result.reward);
            setPhase('result');
            toast.showSuccess(formatGachaRewardMessage(result.reward, state));
        } catch {
            setPhase('idle');
            toast.showError('가챠를 진행하지 못했어요. 잠시 후 다시 시도해 주세요.');
        }
    }, [canPull, pullGacha, state, toast]);

    return (
        <View style={styles.root}>
            <View style={styles.header}>
                <Top
                    title={<Top.TitleParagraph size={22}>가챠</Top.TitleParagraph>}
                    subtitle2={
                        <Top.SubtitleParagraph>
                            보유 에코잼 {state.ecoJam}개
                        </Top.SubtitleParagraph>
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
                    <TdsHeroAsset
                        source={heroSource}
                        size={phase === 'result' ? 'hero' : 'large'}
                        accessibilityLabel={heroLabel}
                    />
                    <Txt typography="t6" color="grey600" style={styles.potHint}>
                        {phase === 'pulling'
                            ? '두구두구…'
                            : phase === 'reveal'
                              ? '결과 공개!'
                              : `1회 ${GACHA_PULL_COST_ECO_JAM} 에코잼이 소모돼요.`}
                    </Txt>
                </View>
                {lastReward != null && phase === 'result' ? (
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
                {canShareLast && phase === 'result' ? (
                    <BottomCTA.Double
                        leftButton={
                            <ShareResultButton
                                message={buildGachaShareMessage(
                                    formatGachaRewardMessage(lastReward!, state),
                                )}
                            />
                        }
                        rightButton={
                            <Button
                                size="large"
                                type="primary"
                                display="block"
                                disabled={!canPull}
                                onPress={() => void onPressPull()}
                            >
                                {pullLabel}
                            </Button>
                        }
                    />
                ) : (
                    <BottomCTA.Single
                        size="large"
                        type="primary"
                        display="block"
                        disabled={!canPull}
                        onPress={() => void onPressPull()}
                    >
                        {isBusy ? '뽑는 중…' : pullLabel}
                    </BottomCTA.Single>
                )}
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
        paddingVertical: 20,
        backgroundColor: colors.heroTint,
        borderRadius: 16,
        gap: 12,
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
        paddingBottom: 16,
    },
});
