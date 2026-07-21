import type { Recipe } from '@api/mock/recipeTypes';
import type { SoupCraftResponse } from '@api/notion/types';
import { Txt } from '@toss/tds-react-native';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { BrewFailureReason } from '../../shared/feedback/messages';
import { CAULDRON_TIER_LAYERS, STIR_STICK_IMAGE } from '../../shared/constants/cauldronImages';
import { CenteredFeatureStage } from '../../shared/ui/CenteredFeatureStage';
import { colors } from '../../shared/theme/colors';
import { CauldronStage } from './CauldronStage';
import { resolveCraftAnimationTier } from './craftAnimationTier';
import { type CraftBrewPhase, runCraftBrewSequence } from './craftBrewSequence';
import { CRAFT_STAGE_ALIGNMENT } from './craftStageAlignment';

export type CraftBrewOutcome =
    | { ok: true; recipe: Recipe; craft: SoupCraftResponse }
    | { ok: false; reason: BrewFailureReason };

const PHASE_HINT: Record<CraftBrewPhase, string> = {
    stir: '스프를 젓고 있어요…',
    transform: '스프가 변하고 있어요…',
    complete: '스프가 완성됐어요!',
};

/**
 * 약 270px 내부 캔버스의 alpha 정렬 이동과 complete 단계 emphasize 1.1 배율을
 * stacked fallback ScrollView 경계 안에서 안전하게 보여주기 위한 위·아래 여유.
 */
const BREW_STAGE_OVERFLOW_INSET = 40;

type CraftBrewAnimationOverlayProps = {
    /** 브루 API 호출. 컴포넌트 마운트 시 1회만 실행한다. */
    run: () => Promise<CraftBrewOutcome>;
    onSuccess: (outcome: { ok: true; recipe: Recipe; craft: SoupCraftResponse }) => void;
    onFailure: (reason: BrewFailureReason) => void;
};

/**
 * 재료 선택 화면 위에 표시되는 제작 애니메이션.
 * 타임라인: 0~1.2s 저어주기 → 1.2~2.4s 변환 → 2.4~3.0s 완성 강조 (API가 느리면 저어주기를 응답까지 유지).
 * 별도 Skip 버튼은 여기에 넣지 않는다.
 */
export function CraftBrewAnimationOverlay({ run, onSuccess, onFailure }: CraftBrewAnimationOverlayProps) {
    const [phase, setPhase] = useState<CraftBrewPhase>('stir');
    const [tier, setTier] = useState<ReturnType<typeof resolveCraftAnimationTier>>('normal');
    const onSuccessRef = useRef(onSuccess);
    const onFailureRef = useRef(onFailure);
    onSuccessRef.current = onSuccess;
    onFailureRef.current = onFailure;

    useEffect(() => {
        let cancelled = false;

        void runCraftBrewSequence<CraftBrewOutcome>({
            run,
            isSuccess: (value) => value.ok,
            onPhaseChange: (nextPhase, value) => {
                if (cancelled) {
                    return;
                }
                if (value != null && value.ok) {
                    setTier(resolveCraftAnimationTier(value.craft));
                }
                setPhase(nextPhase);
            },
        }).then((outcome) => {
            if (cancelled) {
                return;
            }
            if (!outcome.ok) {
                const failed = outcome.error;
                const reason =
                    failed != null && typeof failed === 'object' && 'reason' in failed
                        ? (failed as { reason: BrewFailureReason }).reason
                        : 'network';
                onFailureRef.current(reason);
                return;
            }
            if (outcome.value.ok) {
                onSuccessRef.current(outcome.value);
            }
        });

        return () => {
            cancelled = true;
        };
        // 이 오버레이는 브루 1회 시도마다 새로 마운트되므로, 최초 마운트 시 캡처한 run만
        // 정확히 1회 실행해야 한다 (deps에 run을 넣으면 리렌더마다 재호출될 수 있어 의도적으로 제외).
    }, []);

    const tierLayers = CAULDRON_TIER_LAYERS[tier];
    const layers =
        phase === 'stir'
            ? { soup: CAULDRON_TIER_LAYERS.normal.soup, stirStick: STIR_STICK_IMAGE }
            : {
                  soup: tierLayers.soup,
                  glow: tierLayers.glow,
                  sparkle: tierLayers.sparkle,
                  stirStick: STIR_STICK_IMAGE,
              };

    return (
        <View style={styles.overlay}>
            <CenteredFeatureStage
                testID="craft-brew-centered-stage"
                stageTestID="craft-brew-stage-viewport"
                belowTestID="craft-brew-below"
                belowScrollable={false}
                allowStageOverflow
                stageOverflowInset={BREW_STAGE_OVERFLOW_INSET}
                stage={
                    <View style={{ transform: [{ translateY: CRAFT_STAGE_ALIGNMENT.translateY }] }}>
                        <CauldronStage
                            layers={layers}
                            width={CRAFT_STAGE_ALIGNMENT.innerCanvasWidth}
                            stirring={phase === 'stir'}
                            emphasize={phase === 'complete'}
                            accessibilityLabel="스프 만드는 중"
                        />
                    </View>
                }
                below={
                    <Txt typography="t6" color="grey600" style={styles.hint}>
                        {PHASE_HINT[phase]}
                    </Txt>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: colors.background,
    },
    hint: {
        textAlign: 'center',
    },
});
