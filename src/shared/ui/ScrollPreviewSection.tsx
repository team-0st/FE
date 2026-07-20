import { Txt } from '@toss/tds-react-native';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

export const PREVIEW_ROW_HEIGHT = 64;
export const PREVIEW_VISIBLE_ROWS = 3;

export const SCROLL_PREVIEW_HINT = '아래로 스크롤하면 더 볼 수 있어요.';

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
    children,
}: ScrollPreviewSectionProps) {
    const canScroll = itemCount > PREVIEW_VISIBLE_ROWS;
    const previewMaxHeight = rowHeight * PREVIEW_VISIBLE_ROWS;

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
