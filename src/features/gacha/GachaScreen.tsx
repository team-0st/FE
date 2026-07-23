import { getIngredientById } from '@api/mock/ingredients';
import { Button, Txt } from '@toss/tds-react-native';
import { useCallback, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState } from 'react';
import { Image, Platform, StyleSheet, Vibration, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import {
    BRAND_ASSET,
    BRAND_EMOJI,
    FEATURE_HEADER_SLOT_HEIGHT,
    GACHA_FAIL_ASSETS,
} from '../../shared/constants/brandAssets';
import {
    GACHA_PROBABILITY_LINES,
    GACHA_PROBABILITY_TITLE,
} from '../../shared/constants/probabilityInfo';
import { buildGachaShareMessage } from '../../shared/feedback/shareResult';
import { ProfileLedgerRow, ProfileListModal } from '../profile/ProfileListSection';
import { CenteredFeatureStage } from '../../shared/ui/CenteredFeatureStage';
import { ProbabilityInfoRow } from '../../shared/ui/ProbabilityInfoRow';
import { FixedHeightHeaderSlot } from '../../shared/ui/Screen';
import { ShareResultButton } from '../../shared/ui/ShareResultButton';
import { toBrandImageSource } from '../../shared/ui/toBrandImageSource';
import { colors } from '../../shared/theme/colors';
import { useUser } from '../user/UserProvider';
import { GACHA_PULL_COST_ECO_JAM } from './gachaConfig';
import {
    createInitialGachaTabState,
    formatGachaRewardMessage,
    isGachaPullOutcomeCurrent,
    reduceGachaTabState,
} from './gachaLogic';
import type { GachaReward } from './gachaTypes';

type GachaScreenProps = {
    /** 이 화면이 현재 보이는 탭인지 여부. true→false로 바뀌는 즉시 idle 화면으로 초기화한다. */
    active: boolean;
};

/** 공유 버튼 자리 — 유무와 관계없이 확보해 뽑기 버튼 위치 고정 */
const SHARE_SLOT_HEIGHT = 48;
/** TDS bottom toast와 동일한 회색 칩 */
const INLINE_TOAST_BG = '#8B95A1';
const INLINE_TOAST_MS = 2600;

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
 * CenteredFeatureStage의 stage viewport(고정 높이, overflow hidden)를 그대로 채우고,
 * 가로는 원본 비율을 유지한다.
 * (정사각 contain이면 여백 많은 에셋이 더 작게 보여 보상마다 높이가 들쭉날쭉해짐)
 */
function StageArt({ source, phaseKey, accessibilityLabel }: StageArtProps) {
    const uriSource = toBrandImageSource(source);

    if (uriSource == null) {
        return <View style={styles.stageSlot} />;
    }
    return (
        <View style={styles.stageSlot}>
            <Image
                key={phaseKey}
                testID="gacha-stage-image"
                source={uriSource}
                style={styles.stageImage}
                resizeMode="contain"
                accessibilityLabel={accessibilityLabel}
            />
        </View>
    );
}

function formatGachaHistoryTime(iso: string): string {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function GachaScreen({ active }: GachaScreenProps) {
    const { state, pullGacha } = useUser();
    const [historyVisible, setHistoryVisible] = useState(false);
    const [banner, setBanner] = useState<string | null>(null);
    const bannerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const showBanner = useCallback((message: string, duration = INLINE_TOAST_MS) => {
        if (bannerTimerRef.current != null) {
            clearTimeout(bannerTimerRef.current);
        }
        setBanner(message);
        bannerTimerRef.current = setTimeout(() => {
            setBanner(null);
            bannerTimerRef.current = null;
        }, duration);
    }, []);

    useEffect(() => {
        return () => {
            if (bannerTimerRef.current != null) {
                clearTimeout(bannerTimerRef.current);
            }
        };
    }, []);

    const [tabState, dispatch] = useReducer(
        reduceGachaTabState,
        undefined,
        () => createInitialGachaTabState(active, GACHA_FAIL_ASSETS[0]),
    );
    // active prop 변화를 페인트 전에 즉시 반영 — 탭 이탈 순간 다음 페인트부터 idle 화면을 보여준다.
    const renderState =
        tabState.active === active
            ? tabState
            : reduceGachaTabState(tabState, { type: 'TAB_ACTIVE_CHANGED', active });
    const { phase, lastReward, failArt, isPullPending } = renderState;

    const generationRef = useRef(renderState.generation);
    useLayoutEffect(() => {
        generationRef.current = renderState.generation;
    }, [renderState.generation]);

    useLayoutEffect(() => {
        if (tabState.active !== active) {
            dispatch({ type: 'TAB_ACTIVE_CHANGED', active });
        }
    }, [active, tabState.active]);

    const isBusy = phase === 'pulling';
    const canPull = state.ecoJam >= GACHA_PULL_COST_ECO_JAM && !isPullPending;
    const pullLabel = `에코잼 ${GACHA_PULL_COST_ECO_JAM}개로 뽑기`;
    const canShareLast = lastReward != null && lastReward.type !== 'FAIL' && phase === 'result';
    const shareMessage =
        canShareLast && lastReward != null
            ? buildGachaShareMessage(formatGachaRewardMessage(lastReward, state))
            : '';

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
            showBanner(`에코잼이 부족해요. (필요: ${GACHA_PULL_COST_ECO_JAM}개)`, 3200);
            return;
        }
        const startGeneration = generationRef.current;
        dispatch({ type: 'PULL_STARTED' });
        vibratePulling();
        try {
            await sleep(PHASE_MS.pulling);
            const result = await pullGacha();

            // 이탈 중(다른 generation) 시작된 pull은 서버 반영은 그대로 두고 화면·토스트만 막는다.
            if (!isGachaPullOutcomeCurrent(startGeneration, generationRef.current)) {
                dispatch({ type: 'PULL_ABANDONED_SETTLED' });
                return;
            }

            if (!result.ok) {
                dispatch({ type: 'PULL_SETTLED', outcome: 'idle' });
                if (result.reason === 'network_error') {
                    showBanner('가챠를 진행하지 못했어요. 잠시 후 다시 시도해 주세요.', 3200);
                } else {
                    showBanner(`에코잼이 부족해요. (필요: ${GACHA_PULL_COST_ECO_JAM}개)`, 3200);
                }
                return;
            }

            // 빵(펑) 이펙트는 격자 이슈로 스킵 — 뽑기 연출 후 바로 결과
            if (result.reward.type === 'FAIL') {
                dispatch({
                    type: 'PULL_SETTLED',
                    outcome: 'result',
                    reward: result.reward,
                    failArt: pickFailAsset(),
                });
                showBanner(formatGachaRewardMessage(result.reward, state));
                return;
            }

            dispatch({ type: 'PULL_SETTLED', outcome: 'result', reward: result.reward });
            showBanner(formatGachaRewardMessage(result.reward, state));
        } catch {
            if (!isGachaPullOutcomeCurrent(startGeneration, generationRef.current)) {
                dispatch({ type: 'PULL_ABANDONED_SETTLED' });
                return;
            }
            dispatch({ type: 'PULL_SETTLED', outcome: 'idle' });
            showBanner('가챠를 진행하지 못했어요. 잠시 후 다시 시도해 주세요.', 3200);
        }
    }, [canPull, pullGacha, showBanner, state]);

    return (
        <View style={styles.root} testID="gacha-root">
            <View style={styles.body} testID="gacha-body">
                <FixedHeightHeaderSlot
                    height={FEATURE_HEADER_SLOT_HEIGHT}
                    testID="gacha-header-slot"
                >
                    <View style={styles.headerContent}>
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
                            <Txt
                                typography="t7"
                                color="blue500"
                                onPress={() => setHistoryVisible(true)}
                                accessibilityRole="button"
                                accessibilityLabel="가챠 기록 보기"
                            >
                                가챠 기록
                            </Txt>
                        </View>
                    </View>
                </FixedHeightHeaderSlot>
                {banner != null ? (
                    <View style={styles.inlineToast} testID="gacha-inline-toast">
                        <Txt typography="t6" fontWeight="semibold" color="white">
                            {banner}
                        </Txt>
                    </View>
                ) : null}
                <CenteredFeatureStage
                    testID="gacha-centered-stage"
                    stageTestID="gacha-stage-viewport"
                    belowTestID="gacha-below"
                    belowScrollable={false}
                    belowGap={8}
                    stage={
                        <StageArt source={heroSource} phaseKey={stageKey} accessibilityLabel={heroLabel} />
                    }
                    below={
                        <Txt typography="t6" color="grey600" style={styles.potHint}>
                            {potHint}
                        </Txt>
                    }
                />
            </View>

            <View style={styles.footer}>
                <View
                    style={[
                        styles.shareSlot,
                        canShareLast ? styles.shareSlotVisible : styles.shareSlotHidden,
                    ]}
                    pointerEvents={canShareLast ? 'auto' : 'none'}
                    accessibilityElementsHidden={!canShareLast}
                    importantForAccessibility={canShareLast ? 'auto' : 'no-hide-descendants'}
                    testID="gacha-share-slot"
                >
                    <ShareResultButton message={shareMessage} />
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
            </View>
            <ProfileListModal
                visible={historyVisible}
                title="가챠 기록"
                emptyMessage="아직 가챠 기록이 없어요."
                itemCount={state.gachaHistory.length}
                onClose={() => setHistoryVisible(false)}
            >
                {state.gachaHistory.map((entry) => (
                    <ProfileLedgerRow
                        key={entry.id}
                        label={entry.label}
                        time={formatGachaHistoryTime(entry.at)}
                        deltaLabel={entry.positive ? '당첨' : '꽝'}
                        deltaPositive={entry.positive}
                    />
                ))}
            </ProfileListModal>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.background,
    },
    body: {
        flex: 1,
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    headerContent: {
        width: '100%',
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
        marginBottom: 4,
    },
    inlineToast: {
        alignSelf: 'center',
        maxWidth: '100%',
        marginTop: 4,
        marginBottom: 4,
        paddingVertical: 12,
        paddingHorizontal: 16,
        // TDS ToastBottom/Top: single=100, multi=20 — 알약형 대신 multi 라운드
        borderRadius: 20,
        backgroundColor: INLINE_TOAST_BG,
    },
    stageSlot: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    stageImage: {
        width: '100%',
        height: '100%',
    },
    potHint: {
        textAlign: 'center',
        paddingHorizontal: 16,
        minHeight: 22,
    },
    footer: {
        width: '100%',
        maxWidth: 440,
        alignSelf: 'center',
        gap: 10,
        paddingHorizontal: 20,
        paddingBottom: 8,
        paddingTop: 8,
        backgroundColor: colors.background,
    },
    shareSlot: {
        minHeight: SHARE_SLOT_HEIGHT,
        justifyContent: 'center',
    },
    shareSlotVisible: {
        opacity: 1,
    },
    shareSlotHidden: {
        opacity: 0,
    },
});
