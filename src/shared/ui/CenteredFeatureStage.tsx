import type { ReactNode } from 'react';
import { useCallback, useState } from 'react';
import type { LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';
import { ScrollView, StyleSheet, View } from 'react-native';
import { FEATURE_STAGE_HEIGHT, FEATURE_STAGE_TOP_SPACING } from '../constants/brandAssets';

/**
 * centered mode에서 stage 아래 콘텐츠가 최소한으로 보여야 하는 실제 높이.
 * 중앙 배치를 우선하면서도 아래 영역이 완전히 사라지는 극단 상황만 fallback한다.
 */
export const CENTERED_STAGE_MIN_VISIBLE_BELOW_HEIGHT = 32;

type ShouldUseStackedFallbackParams = {
    /** CenteredFeatureStage의 root(header·footer 사이 flex:1 body)가 실제로 측정된 높이 */
    bodyHeight: number;
    stageHeight: number;
    belowGap: number;
    minVisibleBelowHeight?: number;
};

/**
 * centered mode의 below 실제 가용 높이는
 * `bodyHeight / 2 - stageHeight / 2 - belowGap`이다.
 * 따라서 `stageHeight + 2 * (belowGap + minVisibleBelowHeight)`보다 body가 작으면
 * 정중앙 고정 대신 스크롤 스택으로 전환한다.
 */
export function shouldUseStackedFallback({
    bodyHeight,
    stageHeight,
    belowGap,
    minVisibleBelowHeight = CENTERED_STAGE_MIN_VISIBLE_BELOW_HEIGHT,
}: ShouldUseStackedFallbackParams): boolean {
    if (!Number.isFinite(bodyHeight) || bodyHeight <= 0) {
        return false;
    }
    const minimumCenteredBodyHeight =
        stageHeight + 2 * (belowGap + minVisibleBelowHeight);
    return bodyHeight < minimumCenteredBodyHeight;
}

type CenteredFeatureStageProps = {
    /** stage viewport(고정 높이, overflow hidden) 안에 그릴 콘텐츠. 이미지 자체가 이 안에서 화면 정중앙에 온다. */
    stage: ReactNode;
    /** stage 아래, 남은 영역에서 독립적으로 세로 스크롤되는 콘텐츠 */
    below: ReactNode;
    /** stage viewport 높이. 기본 FEATURE_STAGE_HEIGHT(220) — 모든 관련 화면이 공유해야 위치가 같아진다. */
    stageHeight?: number;
    /** stage 하단과 below 시작 사이 공통 여백. 기본 FEATURE_STAGE_TOP_SPACING(16) */
    belowGap?: number;
    /** below를 자체 ScrollView로 감쌀지 여부. 기본 true */
    belowScrollable?: boolean;
    /** glow처럼 stage viewport 경계 밖 연출을 허용할지 여부. 기본 false */
    allowStageOverflow?: boolean;
    /** stacked fallback에서 overflow 연출을 ScrollView 경계 안에 두기 위한 stage 위·아래 여유. 기본 0 */
    stageOverflowInset?: number;
    belowContentContainerStyle?: StyleProp<ViewStyle>;
    testID?: string;
    stageTestID?: string;
    belowTestID?: string;
};

/**
 * header와 footer 사이 자신에게 주어진 body(`flex: 1`) 안에서 stage viewport의 중심을
 * 정확히 50%에 고정하는 공유 레이아웃.
 *
 * below 콘텐츠가 길어져도(예: 결과 상세) stage의 위치는 바뀌지 않는다 — below는 stage와 분리된
 * 영역에서 독립적으로 스크롤된다. body가 너무 작아지면(초대형 글씨 등) 정중앙 고정을 포기하고
 * 스크롤 가능한 스택 배치로 전환해 stage와 below를 모두 볼 수 있게 한다.
 */
export function CenteredFeatureStage({
    stage,
    below,
    stageHeight = FEATURE_STAGE_HEIGHT,
    belowGap = FEATURE_STAGE_TOP_SPACING,
    belowScrollable = true,
    allowStageOverflow = false,
    stageOverflowInset = 0,
    belowContentContainerStyle,
    testID,
    stageTestID,
    belowTestID,
}: CenteredFeatureStageProps) {
    const [bodyHeight, setBodyHeight] = useState<number | null>(null);
    const handleLayout = useCallback((event: LayoutChangeEvent) => {
        setBodyHeight(event.nativeEvent.layout.height);
    }, []);

    const useStackedFallback =
        bodyHeight != null &&
        shouldUseStackedFallback({
            bodyHeight,
            stageHeight,
            belowGap,
        });
    const rootVisibilityStyle = bodyHeight == null ? styles.unmeasured : styles.measured;
    const stageOverflowStyle = allowStageOverflow
        ? styles.stageOverflowVisible
        : styles.stageOverflowHidden;
    const fallbackStageOverflowInset =
        allowStageOverflow && Number.isFinite(stageOverflowInset)
            ? Math.max(0, stageOverflowInset)
            : 0;

    if (useStackedFallback) {
        return (
            <View
                style={[styles.root, rootVisibilityStyle]}
                onLayout={handleLayout}
                testID={testID}
            >
                <ScrollView
                    style={styles.fallbackScroll}
                    contentContainerStyle={styles.fallbackContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View
                        style={[
                            styles.fallbackStageSafeArea,
                            { paddingVertical: fallbackStageOverflowInset },
                        ]}
                        testID={
                            stageTestID == null
                                ? undefined
                                : `${stageTestID}-overflow-safe-area`
                        }
                    >
                        <View
                            style={[
                                styles.stageViewportStatic,
                                stageOverflowStyle,
                                { height: stageHeight },
                            ]}
                            testID={stageTestID}
                        >
                            {stage}
                        </View>
                    </View>
                    <View style={[styles.fallbackBelow, { marginTop: belowGap }]} testID={belowTestID}>
                        {below}
                    </View>
                </ScrollView>
            </View>
        );
    }

    const belowMarginTop = stageHeight / 2 + belowGap;
    const belowInner = belowScrollable ? (
        <ScrollView
            style={styles.belowScroll}
            contentContainerStyle={[styles.belowContent, belowContentContainerStyle]}
            showsVerticalScrollIndicator={false}
        >
            {below}
        </ScrollView>
    ) : (
        below
    );

    return (
        <View
            style={[styles.root, rootVisibilityStyle]}
            onLayout={handleLayout}
            testID={testID}
        >
            <View
                style={[
                    styles.stageViewportCentered,
                    stageOverflowStyle,
                    { height: stageHeight, transform: [{ translateY: -(stageHeight / 2) }] },
                ]}
                testID={stageTestID}
            >
                {stage}
            </View>
            <View style={[styles.below, { marginTop: belowMarginTop }]} testID={belowTestID}>
                {belowInner}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        position: 'relative',
        width: '100%',
    },
    unmeasured: {
        opacity: 0,
    },
    measured: {
        opacity: 1,
    },
    stageViewportCentered: {
        position: 'absolute',
        top: '50%',
        left: 0,
        width: '100%',
        alignItems: 'center',
    },
    stageViewportStatic: {
        width: '100%',
        alignItems: 'center',
    },
    stageOverflowHidden: {
        overflow: 'hidden',
    },
    stageOverflowVisible: {
        overflow: 'visible',
    },
    below: {
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
    },
    belowScroll: {
        flex: 1,
        width: '100%',
    },
    belowContent: {
        width: '100%',
        paddingBottom: 24,
    },
    fallbackScroll: {
        flex: 1,
        width: '100%',
    },
    fallbackContent: {
        width: '100%',
        paddingBottom: 24,
    },
    fallbackStageSafeArea: {
        width: '100%',
        alignItems: 'center',
    },
    fallbackBelow: {
        width: '100%',
    },
});
