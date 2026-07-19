import { getIngredientById } from '@api/mock/ingredients';
import { BottomCTA, Button, Txt } from '@toss/tds-react-native';
import { useCallback, useMemo, useState } from 'react';
import { Image, Platform, StyleSheet, Vibration, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import {
    BRAND_ASSET,
    BRAND_EMOJI,
    GACHA_BANG_BY_TIER,
    GACHA_FAIL_ASSETS,
} from '../../shared/constants/brandAssets';
import {
    GACHA_PROBABILITY_LINES,
    GACHA_PROBABILITY_TITLE,
} from '../../shared/constants/probabilityInfo';
import { useAppToast } from '../../shared/feedback/useAppToast';
import { buildGachaShareMessage } from '../../shared/feedback/shareResult';
import { ProbabilityInfoRow } from '../../shared/ui/ProbabilityInfoRow';
import { ShareResultButton } from '../../shared/ui/ShareResultButton';
import { toBrandImageSource } from '../../shared/ui/toBrandImageSource';
import { colors } from '../../shared/theme/colors';
import { useUser } from '../user/UserProvider';
import {
    GACHA_PULL_COST_ECO_JAM,
    GACHA_TEST_ECO_JAM_GRANT,
} from './gachaConfig';
import { formatGachaRewardMessage } from './gachaLogic';
import type { GachaReward } from './gachaTypes';

type GachaPhase = 'idle' | 'pulling' | 'bang' | 'result';

/** 하단 CTA·헤더·공유 줄을 침범하지 않는 선에서 최대한 큰 고정 스테이지 */
const STAGE_SIZE = 220;

/** 공유 TextButton 줄 높이 — 유무와 관계없이 항상 확보해 레이아웃 점프 방지 */
const SHARE_ROW_HEIGHT = 36;

const PHASE_MS = {
    pulling: 700,
    bang: 500,
} as const;

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function vibratePulling() {
    try {
        if (Platform.OS === 'android') {
            Vibration.vibrate([0, 35, 70, 35, 70, 35, 70, 45, 70, 55]);
            return;
        }
        Vibration.vibrate();
        setTimeout(() => {
            try {
                Vibration.vibrate();
            } catch {
                // ignore
            }
        }, 160);
        setTimeout(() => {
            try {
                Vibration.vibrate();
            } catch {
                // ignore
            }
        }, 320);
        setTimeout(() => {
            try {
                Vibration.vibrate();
            } catch {
                // ignore
            }
        }, 480);
    } catch {
        // 샌드박스·시뮬레이터에서 무시
    }
}

function vibrateBang() {
    try {
        if (Platform.OS === 'android') {
            Vibration.vibrate(60);
            return;
        }
        Vibration.vibrate();
    } catch {
        // ignore
    }
}

function pickFailAsset(): ImageSourcePropType {
    const index = Math.floor(Math.random() * GACHA_FAIL_ASSETS.length);
    return GACHA_FAIL_ASSETS[index] ?? GACHA_FAIL_ASSETS[0];
}

/** 꽝은 null(빵 스킵). 당첨만 희귀도별 빵 */
function bangAssetForReward(reward: GachaReward): ImageSourcePropType | null {
    if (reward.type === 'FAIL') {
        return null;
    }
    if (reward.type === 'ALMANG_POINT') {
        return GACHA_BANG_BY_TIER.rare;
    }
    if (reward.type === 'INGREDIENT') {
        const item = getIngredientById(reward.ingredientId);
        if (item?.type === 'HIDDEN') {
            return GACHA_BANG_BY_TIER.hidden;
        }
        return GACHA_BANG_BY_TIER.common;
    }
    // ECO_JAM
    return GACHA_BANG_BY_TIER.common;
}

function gachaResultArtSource(
    reward: GachaReward,
    failArt: ImageSourcePropType,
): ImageSourcePropType {
    if (reward.type === 'FAIL') {
        return failArt;
    }
    if (reward.type === 'INGREDIENT') {
        return getIngredientById(reward.ingredientId)?.imageSource ?? BRAND_ASSET.heroParty;
    }
    if (reward.type === 'ECO_JAM') {
        return BRAND_EMOJI.ecoJamReveal;
    }
    if (reward.type === 'ALMANG_POINT') {
        return BRAND_EMOJI.almangPoint;
    }
    return BRAND_ASSET.heroGacha;
}

type BalanceChipProps = {
    source: ImageSourcePropType;
    value: string;
    accessibilityLabel: string;
};

function BalanceChip({ source, value, accessibilityLabel }: BalanceChipProps) {
    const uriSource = toBrandImageSource(source);
    return (
        <View style={styles.chip} accessibilityLabel={accessibilityLabel}>
            {uriSource != null ? (
                <Image
                    source={uriSource}
                    style={styles.chipIcon}
                    resizeMode="contain"
                    accessibilityLabel={accessibilityLabel}
                />
            ) : null}
            <Txt typography="t7" fontWeight="semibold" style={styles.chipValue}>
                {value}
            </Txt>
        </View>
    );
}

type StageArtProps = {
    source: ImageSourcePropType;
    phaseKey: string;
    accessibilityLabel: string;
};

function StageArt({ source, phaseKey, accessibilityLabel }: StageArtProps) {
    const uriSource = toBrandImageSource(source);
    if (uriSource == null) {
        return <View style={styles.stageSlot} />;
    }
    return (
        <View style={styles.stageSlot}>
            <Image
                key={phaseKey}
                source={uriSource}
                style={styles.stageImage}
                resizeMode="contain"
                accessibilityLabel={accessibilityLabel}
            />
        </View>
    );
}

export function GachaScreen() {
    const { state, pullGacha, grantTestEcoJam } = useUser();
    const toast = useAppToast();
    const [lastReward, setLastReward] = useState<GachaReward | null>(null);
    const [phase, setPhase] = useState<GachaPhase>('idle');
    const [bangSource, setBangSource] = useState<ImageSourcePropType>(GACHA_BANG_BY_TIER.common);
    const [failArt, setFailArt] = useState<ImageSourcePropType>(GACHA_FAIL_ASSETS[0]);
    const isBusy = phase === 'pulling' || phase === 'bang';
    const canPull = state.ecoJam >= GACHA_PULL_COST_ECO_JAM && !isBusy;
    const pullLabel = `에코잼 ${GACHA_PULL_COST_ECO_JAM}개로 뽑기`;
    const canShareLast = lastReward != null && lastReward.type !== 'FAIL' && phase === 'result';

    const heroSource = useMemo(() => {
        if (phase === 'pulling') {
            return BRAND_ASSET.gachaPulling;
        }
        if (phase === 'bang') {
            return bangSource;
        }
        if (phase === 'result' && lastReward != null) {
            return gachaResultArtSource(lastReward, failArt);
        }
        return BRAND_ASSET.heroGacha;
    }, [bangSource, failArt, lastReward, phase]);

    const stageKey =
        phase === 'result' && lastReward != null
            ? `result-${lastReward.type}-${'ingredientId' in lastReward ? lastReward.ingredientId : 'amount' in lastReward ? lastReward.amount : 0}`
            : phase === 'bang'
              ? 'bang'
              : phase === 'pulling'
                ? 'pulling'
                : 'idle';

    const heroLabel =
        phase === 'pulling'
            ? '가챠 뽑는 중'
            : phase === 'bang'
              ? '결과 발표'
              : phase === 'result'
                ? '가챠 결과'
                : '가챠 상자';

    const potHint =
        phase === 'pulling'
            ? '두구두구…'
            : phase === 'bang'
              ? '빵!'
              : phase === 'result' && lastReward != null
                ? formatGachaRewardMessage(lastReward, state)
                : `1회 ${GACHA_PULL_COST_ECO_JAM} 에코잼이 소모돼요.`;

    const onPressPull = useCallback(async () => {
        if (!canPull) {
            toast.showError(`에코잼이 부족해요. (필요: ${GACHA_PULL_COST_ECO_JAM}개)`);
            return;
        }
        setPhase('pulling');
        vibratePulling();
        try {
            await sleep(PHASE_MS.pulling);
            const result = await pullGacha();
            if (!result.ok) {
                setPhase('idle');
                toast.showError(`에코잼이 부족해요. (필요: ${GACHA_PULL_COST_ECO_JAM}개)`);
                return;
            }
            setLastReward(result.reward);

            const bang = bangAssetForReward(result.reward);
            if (bang == null) {
                // 꽝: 축하 빵 없이 랜덤 꽝 아트로 바로 결과
                setFailArt(pickFailAsset());
                setPhase('result');
                toast.show(formatGachaRewardMessage(result.reward, state));
                return;
            }

            setBangSource(bang);
            setPhase('bang');
            vibrateBang();
            await sleep(PHASE_MS.bang);
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
                <View style={styles.titleRow}>
                    <Txt typography="t3" fontWeight="bold" style={styles.title}>
                        가챠
                    </Txt>
                    <View style={styles.chips}>
                        <BalanceChip
                            source={BRAND_EMOJI.ecoJam}
                            value={`${state.ecoJam}`}
                            accessibilityLabel={`보유 에코잼 ${state.ecoJam}개`}
                        />
                        <BalanceChip
                            source={BRAND_EMOJI.almangPoint}
                            value={`${state.totalPoints}P`}
                            accessibilityLabel={`알맹 포인트 ${state.totalPoints}P`}
                        />
                    </View>
                </View>
                <View style={styles.probRow}>
                    <ProbabilityInfoRow
                        label="가챠·보상"
                        title={GACHA_PROBABILITY_TITLE}
                        lines={GACHA_PROBABILITY_LINES}
                    />
                </View>
            </View>

            <View style={styles.body}>
                <View style={styles.pot}>
                    <StageArt
                        source={heroSource}
                        phaseKey={stageKey}
                        accessibilityLabel={heroLabel}
                    />
                    <Txt typography="t6" color="grey600" style={styles.potHint}>
                        {potHint}
                    </Txt>
                </View>
            </View>

            <View style={styles.footer}>
                <View style={styles.shareRow}>
                    {canShareLast ? (
                        <ShareResultButton
                            presentation="text"
                            message={buildGachaShareMessage(
                                formatGachaRewardMessage(lastReward!, state),
                            )}
                        />
                    ) : null}
                </View>
                <BottomCTA.Single
                    size="large"
                    type="primary"
                    display="block"
                    disabled={!canPull}
                    onPress={() => void onPressPull()}
                >
                    {isBusy ? '뽑는 중…' : pullLabel}
                </BottomCTA.Single>
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
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        minHeight: 44,
    },
    title: {
        flexShrink: 0,
    },
    chips: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexShrink: 1,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
    chipIcon: {
        width: 18,
        height: 18,
    },
    chipValue: {
        color: colors.primaryDark,
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
        justifyContent: 'center',
    },
    pot: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        backgroundColor: colors.heroTint,
        borderRadius: 16,
        gap: 12,
        minHeight: STAGE_SIZE + 56,
    },
    stageSlot: {
        width: STAGE_SIZE,
        height: STAGE_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    stageImage: {
        width: STAGE_SIZE,
        height: STAGE_SIZE,
    },
    potHint: {
        textAlign: 'center',
        paddingHorizontal: 16,
        minHeight: 22,
    },
    footer: {
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
        gap: 10,
        paddingBottom: 16,
    },
    shareRow: {
        height: SHARE_ROW_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
