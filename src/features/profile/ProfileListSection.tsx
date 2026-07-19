import { Button, ListRow, Txt } from '@toss/tds-react-native';
import type { ReactNode } from 'react';
import { useState } from 'react';
import type { ImageSourcePropType } from 'react-native';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { colors } from '../../shared/theme/colors';
import { BrandListRowImage } from '../../shared/ui/BrandListRowImage';
import { SCROLL_PREVIEW_HINT } from '../../shared/ui/ScrollPreviewSection';

const PREVIEW_ROW_HEIGHT = 64;
const PREVIEW_VISIBLE_ROWS = 3;

type ProfileListSectionProps = {
    title: string;
    hint?: string;
    emptyMessage: string;
    expandLabel: string;
    children: ReactNode;
    expandedChildren: ReactNode;
    itemCount: number;
};

export function ProfileListSection({
    title,
    hint,
    emptyMessage,
    expandLabel,
    children,
    expandedChildren,
    itemCount,
}: ProfileListSectionProps) {
    const [expanded, setExpanded] = useState(false);
    const showExpand = itemCount > PREVIEW_VISIBLE_ROWS;

    return (
        <View style={styles.section}>
            <View style={styles.titleRow}>
                <Txt typography="t5" fontWeight="semibold">
                    {title}
                </Txt>
                {showExpand ? (
                    <Txt
                        typography="t7"
                        color="blue500"
                        onPress={() => setExpanded(true)}
                        accessibilityRole="button"
                        accessibilityLabel={expandLabel}
                    >
                        {expandLabel}
                    </Txt>
                ) : null}
            </View>
            {hint != null ? (
                <Txt typography="t7" color="grey600" style={styles.hint}>
                    {hint}
                </Txt>
            ) : null}
            {itemCount === 0 ? (
                <Txt typography="t7" color="grey600">
                    {emptyMessage}
                </Txt>
            ) : (
                <View style={styles.previewBox}>
                    <ScrollView
                        style={styles.previewScroll}
                        nestedScrollEnabled
                        showsVerticalScrollIndicator={itemCount > PREVIEW_VISIBLE_ROWS}
                    >
                        {children}
                    </ScrollView>
                </View>
            )}
            {itemCount > PREVIEW_VISIBLE_ROWS ? (
                <Txt typography="t7" color="grey500" style={styles.scrollHint}>
                    {SCROLL_PREVIEW_HINT}
                </Txt>
            ) : null}
            <Modal visible={expanded} transparent animationType="fade" onRequestClose={() => setExpanded(false)}>
                <Pressable style={styles.overlay} onPress={() => setExpanded(false)}>
                    <View style={styles.sheet} onStartShouldSetResponder={() => true}>
                        <Txt typography="t4" fontWeight="bold" style={styles.sheetTitle}>
                            {title}
                        </Txt>
                        <ScrollView style={styles.expandedScroll} showsVerticalScrollIndicator>
                            {expandedChildren}
                        </ScrollView>
                        <Button size="medium" type="primary" display="block" onPress={() => setExpanded(false)}>
                            닫기
                        </Button>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
}

export function profilePreviewScrollHeight(): number {
    return PREVIEW_ROW_HEIGHT * PREVIEW_VISIBLE_ROWS;
}

type ProfileLedgerRowProps = {
    label: string;
    time: string;
    deltaLabel: string;
    deltaPositive: boolean;
    large?: boolean;
};

export function ProfileLedgerRow({
    label,
    time,
    deltaLabel,
    deltaPositive,
    large = false,
}: ProfileLedgerRowProps) {
    return (
        <ListRow
            contents={
                <ListRow.Texts
                    type="2RowTypeA"
                    top={label}
                    topProps={{ fontWeight: 'bold', typography: large ? 't5' : undefined }}
                    bottom={time}
                    bottomProps={large ? { typography: 't6' } : undefined}
                />
            }
            right={
                <ListRow.RightTexts
                    type="1RowTypeA"
                    top={deltaLabel}
                    topProps={{
                        fontWeight: 'bold',
                        color: deltaPositive ? 'blue500' : 'grey600',
                        typography: large ? 't5' : undefined,
                    }}
                />
            }
        />
    );
}

type ProfileIngredientRowProps = {
    name: string;
    countLabel: string;
    hasStock: boolean;
    large?: boolean;
    imageSource?: ImageSourcePropType | null;
};

export function ProfileIngredientRow({
    name,
    countLabel,
    hasStock,
    large = false,
    imageSource = null,
}: ProfileIngredientRowProps) {
    return (
        <ListRow
            left={
                imageSource != null ? (
                    <BrandListRowImage source={imageSource} />
                ) : undefined
            }
            contents={
                <ListRow.Texts
                    type="2RowTypeA"
                    top={name}
                    topProps={{ fontWeight: 'bold', typography: large ? 't5' : undefined }}
                    bottom={hasStock ? '제작 탭에서 사용 가능' : '보유 없음'}
                    bottomProps={large ? { typography: 't6' } : undefined}
                />
            }
            right={
                <ListRow.RightTexts
                    type="1RowTypeA"
                    top={countLabel}
                    topProps={{
                        fontWeight: 'bold',
                        color: hasStock ? 'blue500' : 'grey500',
                        typography: large ? 't5' : undefined,
                    }}
                />
            }
        />
    );
}

const styles = StyleSheet.create({
    section: {
        width: '100%',
        marginBottom: 16,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
        gap: 8,
    },
    hint: {
        marginBottom: 8,
    },
    previewBox: {
        width: '100%',
        maxHeight: PREVIEW_ROW_HEIGHT * PREVIEW_VISIBLE_ROWS,
        backgroundColor: colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
    },
    previewScroll: {
        maxHeight: PREVIEW_ROW_HEIGHT * PREVIEW_VISIBLE_ROWS,
    },
    scrollHint: {
        marginTop: 6,
        textAlign: 'center',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        padding: 20,
    },
    sheet: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 20,
        maxHeight: '80%',
        gap: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    sheetTitle: {
        marginBottom: 4,
    },
    expandedScroll: {
        flexGrow: 0,
    },
});
