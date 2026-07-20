import { isApiEnabled } from '@api/client';
import { getIngredientById } from '@api/mock/ingredients';
import { Button, Txt } from '@toss/tds-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, Platform, StyleSheet, Vibration, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import {
    BRAND_ASSET,
    BRAND_EMOJI,
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
import { DEV_TEST_TOOLS_ENABLED } from '../../shared/dev/devTestFlags';
import { colors } from '../../shared/theme/colors';
import { useUser } from '../user/UserProvider';
import {
    GACHA_PULL_COST_ECO_JAM,
    GACHA_TEST_ECO_JAM_GRANT,
} from './gachaConfig';
import { formatGachaRewardMessage } from './gachaLogic';
import type { GachaReward } from './gachaTypes';

type GachaPhase = 'idle' | 'pulling' | 'result';

/** 하단 CTA·헤더를 침범하지 않는 선에서 최대한 큰 고정 스테이지 */
const STAGE_SIZE = 220;

/** 공유 버튼 자리 — 유무와 관계없이 확보해 뽑기 버튼 위치 고정 */
const SHARE_SLOT_HEIGHT = 48;

const PHASE_MS = {
    pulling: 700,
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

function pickFailAsset(): ImageSourcePropType {
    const index = Math.floor(Math.random() * GACHA_FAIL_ASSETS.length);
    return GACHA_FAIL_ASSETS[index] ?? GACHA_FAIL_ASSETS[0];
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

/**
 * 스테이지 높이는 STAGE_SIZE로 고정, 가로는 원본 비율 유지.
 * (정사각 contain이면 여백 많은 에셋이 더 작게 보여 보상마다 높이가 들쭉날쭉해짐)
 */
function StageArt({ source, phaseKey, accessibilityLabel }: StageArtProps) {
    const uriSource = toBrandImageSource(source);
    const [aspectRatio, setAspectRatio] = useState(1);

    useEffect(() => {
        setAspectRatio(1);
    }, [phaseKey]);

    if (uriSource == null) {
        return <View style={styles.stageSlot} />;
    }
    return (
        <View style={styles.stageSlot}>
            <Image
                key={phaseKey}
                source={uriSource}
                style={[styles.stageImage, { aspectRatio }]}
                resizeMode="contain"
                onLoad={(event) => {
                    const { width, height } = event.nativeEvent.source;
                    if (width > 0 && height > 0) {
                        setAspectRatio(width / height);
                    }
                }}
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
    const [failArt, setFailArt] = useState<ImageSourcePropType>(GACHA_FAIL_ASSETS[0]);
    const isBusy = phase === 'pulling';
    const canPull = state.ecoJam >= GACHA_PULL_COST_ECO_JAM && !isBusy;
    const pullLabel = `에코잼 ${GACHA_PULL_COST_ECO_JAM}개로 뽑기`;
    const canShareLast = lastReward != null && lastReward.type !== 'FAIL' && phase === 'result';

    const heroSource = useMemo(() => {
        if (phase === 'pulling') {
            return BRAND_ASSET.gachaPulling;
        }
        if (phase === 'result' && lastReward != null) {
            return gachaResultArtSource(lastReward, failArt);
        }
        return BRAND_ASSET.heroGacha;
    }, [failArt, lastReward, phase]);

    const stageKey =
        phase === 'result' && lastReward != null
            ? `result-${lastReward.type}-${'ingredientId' in lastReward ? lastReward.ingredientId : 'amount' in lastReward ? lastReward.amount : 0}`
            : phase === 'pulling'
              ? 'pulling'
              : 'idle';

    const heroLabel =
        phase === 'pulling' ? '가챠 뽑는 중' : phase === 'result' ? '가챠 결과' : '가챠 머신';

    const potHint =
        phase === 'pulling'
            ? '두구두구…'
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
                if (result.reason === 'network_error') {
                    toast.showError('가챠를 진행하지 못했어요. 잠시 후 다시 시도해 주세요.');
                } else {
                    toast.showError(`에코잼이 부족해요. (필요: ${GACHA_PULL_COST_ECO_JAM}개)`);
                }
                return;
            }
            setLastReward(result.reward);

            // 빵(펑) 이펙트는 격자 이슈로 스킵 — 뽑기 연출 후 바로 결과
            if (result.reward.type === 'FAIL') {
                setFailArt(pickFailAsset());
                setPhase('result');
                toast.show(formatGachaRewardMessage(result.reward, state));
                return;
            }

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
                <View style={styles.shareSlot}>
                    {canShareLast ? (
                        <ShareResultButton
                            message={buildGachaShareMessage(
                                formatGachaRewardMessage(lastReward!, state),
                            )}
                        />
                    ) : null}
                </View>
                <Button
                    size="large"
                    type="primary"
                    display="block"
                    disabled={!canPull}
                    onPress={() => void onPressPull()}
                >
                    {isBusy ? '뽑는 중…' : pullLabel}
                </Button>
                {DEV_TEST_TOOLS_ENABLED && !isApiEnabled() ? (
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
                        [테스트] 에코잼 +{GACHA_TEST_ECO_JAM_GRANT}
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
        paddingTop: 0,
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 12,
        minHeight: 44,
    },
    chips: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexShrink: 0,
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
        gap: 12,
        minHeight: STAGE_SIZE + 56,
    },
    stageSlot: {
        width: '100%',
        height: STAGE_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    stageImage: {
        height: STAGE_SIZE,
        maxWidth: '100%',
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
        paddingBottom: 8,
    },
    shareSlot: {
        minHeight: SHARE_SLOT_HEIGHT,
        justifyContent: 'center',
    },
});
