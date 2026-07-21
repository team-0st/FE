import { Txt } from '@toss/tds-react-native';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

export const PREVIEW_ROW_HEIGHT = 64;
export const PREVIEW_VISIBLE_ROWS = 3;
export const ADAPTIVE_VISIBLE_ROWS_MIN = 3;
export const ADAPTIVE_VISIBLE_ROWS_MAX = 5;
export const ROW_HEIGHT_CHANGE_TOLERANCE = 1;

export const SCROLL_PREVIEW_HINT = '아래로 스크롤하면 더 볼 수 있어요.';

export type MeasuredRowHeights = Readonly<Record<string, number>>;

type UpdateMeasuredRowHeightByIdParams = {
    measuredHeights: MeasuredRowHeights;
    itemId: string;
    measuredHeight: number;
    tolerance?: number;
};

/** 같은 항목의 최신 유효 높이를 저장하되, 1px 이내 재측정은 무시한다. */
export function updateMeasuredRowHeightById({
    measuredHeights,
    itemId,
    measuredHeight,
    tolerance = ROW_HEIGHT_CHANGE_TOLERANCE,
}: UpdateMeasuredRowHeightByIdParams): MeasuredRowHeights {
    if (!Number.isFinite(measuredHeight) || measuredHeight <= 0) {
        return measuredHeights;
    }
    const currentHeight = measuredHeights[itemId];
    if (
        currentHeight != null &&
        Math.abs(measuredHeight - currentHeight) <= tolerance
    ) {
        return measuredHeights;
    }
    return { ...measuredHeights, [itemId]: measuredHeight };
}

type GetMaxMeasuredRowHeightParams = {
    itemIds: readonly string[];
    measuredHeights: MeasuredRowHeights;
    fallbackHeight?: number;
};

/** 현재 목록에 남아 있는 항목의 최신 실측값만 대상으로 최대 높이를 계산한다. */
export function getMaxMeasuredRowHeight({
    itemIds,
    measuredHeights,
    fallbackHeight = PREVIEW_ROW_HEIGHT,
}: GetMaxMeasuredRowHeightParams): number {
    let maxHeight: number | undefined;
    for (const itemId of itemIds) {
        const measuredHeight = measuredHeights[itemId];
        if (
            typeof measuredHeight === 'number' &&
            Number.isFinite(measuredHeight) &&
            measuredHeight > 0
        ) {
            maxHeight =
                maxHeight == null ? measuredHeight : Math.max(maxHeight, measuredHeight);
        }
    }
    return maxHeight ?? fallbackHeight;
}

type ComputeAdaptiveVisibleRowsParams = {
    /** 목록을 담는 스크롤 뷰포트의 실제 높이 */
    viewportHeight: number;
    /** 뷰포트 안에서 목록이 아닌 콘텐츠가 차지하는 높이 (제목, 안내문, CTA 등) */
    otherContentHeight: number;
    rowHeight: number;
    min?: number;
    max?: number;
};

/**
 * 화면에 남은 실제 높이를 기준으로 미리보기 노출 행 수를 계산한다 (순수 함수).
 * otherContentHeight는 "목록이 현재 차지 중인 높이"를 제외한 값으로 호출부에서 미리 계산해 전달해야
 * 노출 행 수가 바뀌어도 다음 계산 결과가 진동하지 않는다.
 */
export function computeAdaptiveVisibleRows({
    viewportHeight,
    otherContentHeight,
    rowHeight,
    min = ADAPTIVE_VISIBLE_ROWS_MIN,
    max = ADAPTIVE_VISIBLE_ROWS_MAX,
}: ComputeAdaptiveVisibleRowsParams): number {
    if (rowHeight <= 0) {
        return min;
    }
    const availableForList = viewportHeight - otherContentHeight;
    const rowsThatFit = Math.floor(availableForList / rowHeight);
    return Math.min(max, Math.max(min, rowsThatFit));
}

type ScrollPreviewSectionProps = {
    title?: string;
    titleExtra?: ReactNode;
    /** 제목 행 오른쪽 (예: 모두 보기) */
    titleAction?: ReactNode;
    hint?: string;
    itemCount: number;
    emptyMessage?: string;
    showScrollHint?: boolean;
    /** 미리보기 한 줄 높이. 기본 PREVIEW_ROW_HEIGHT */
    rowHeight?: number;
    /** 미리보기 노출 행 수. 기본 PREVIEW_VISIBLE_ROWS(3) */
    visibleRows?: number;
    children: ReactNode;
};

export function ScrollPreviewSection({
    title,
    titleExtra,
    titleAction,
    hint,
    itemCount,
    emptyMessage,
    showScrollHint = true,
    rowHeight = PREVIEW_ROW_HEIGHT,
    visibleRows = PREVIEW_VISIBLE_ROWS,
    children,
}: ScrollPreviewSectionProps) {
    const canScroll = itemCount > visibleRows;
    const previewMaxHeight = rowHeight * visibleRows;

    return (
        <View style={styles.section}>
            {title != null ? (
                <View style={styles.titleRow}>
                    <View style={styles.titleLeft}>
                        <Txt typography="t5" fontWeight="semibold">
                            {title}
                        </Txt>
                        {titleExtra != null ? titleExtra : null}
                    </View>
                    {titleAction != null ? titleAction : null}
                </View>
            ) : null}
            {hint != null ? (
                <Txt typography="t7" color="grey600" style={styles.hint}>
                    {hint}
                </Txt>
            ) : null}
            {itemCount === 0 && emptyMessage != null ? (
                <Txt typography="t7" color="grey600">
                    {emptyMessage}
                </Txt>
            ) : null}
            {itemCount > 0 ? (
                <>
                    <View style={[styles.previewBox, { maxHeight: previewMaxHeight }]}>
                        <ScrollView
                            style={{ maxHeight: previewMaxHeight }}
                            nestedScrollEnabled
                            showsVerticalScrollIndicator={canScroll}
                        >
                            {children}
                        </ScrollView>
                    </View>
                    {showScrollHint && canScroll ? (
                        <Txt typography="t7" color="grey500" style={styles.scrollHint}>
                            {SCROLL_PREVIEW_HINT}
                        </Txt>
                    ) : null}
                </>
            ) : null}
        </View>
    );
}

export function previewScrollMaxHeight(): number {
    return PREVIEW_ROW_HEIGHT * PREVIEW_VISIBLE_ROWS;
}

const styles = StyleSheet.create({
    section: {
        width: '100%',
        marginBottom: 12,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
        gap: 8,
    },
    titleLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexShrink: 1,
    },
    hint: {
        marginBottom: 8,
    },
    previewBox: {
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
    },
    scrollHint: {
        marginTop: 6,
        textAlign: 'center',
    },
});
