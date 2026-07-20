import { getIngredientById } from '@api/mock';
import { BREW_SLOT_MAX, LEGENDARY_SLOT_COUNT, WEEKLY_SLOT_COUNT } from '@api/mock/recipes';
import { Txt } from '@toss/tds-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { BrandEmojiImage } from './BrandEmojiImage';
import { colors } from '../theme/colors';

type IngredientSlotBarProps = {
    slots: (string | null)[];
    onPressSlot: (index: number) => void;
    filledCount: number;
    onClearAll: () => void;
};

export function IngredientSlotBar({
    slots,
    onPressSlot,
    filledCount,
    onClearAll,
}: IngredientSlotBarProps) {
    return (
        <View style={styles.wrap}>
            <View style={styles.header}>
                <Txt typography="t6" fontWeight="semibold" color="grey700">
                    {`넣은 재료 ${filledCount}/${BREW_SLOT_MAX}`}
                </Txt>
                <Pressable
                    onPress={onClearAll}
                    disabled={filledCount === 0}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityRole="button"
                    accessibilityLabel="냄비 재료 전부 비우기"
                    accessibilityState={{ disabled: filledCount === 0 }}
                >
                    <Txt
                        typography="t7"
                        color={filledCount === 0 ? 'grey500' : 'blue500'}
                        fontWeight="semibold"
                    >
                        전부 비우기
                    </Txt>
                </Pressable>
            </View>
            <View style={styles.row}>
                {Array.from({ length: BREW_SLOT_MAX }, (_, index) => {
                    const id = slots[index] ?? null;
                    const ingredient = id != null ? getIngredientById(id) : undefined;
                    const filled = ingredient != null;
                    const isHiddenSlot = index === WEEKLY_SLOT_COUNT;
                    const isLegendarySlot = index === LEGENDARY_SLOT_COUNT - 1;
                    return (
                        <View key={index} style={styles.slotCol}>
                            <Pressable
                                onPress={() => onPressSlot(index)}
                                style={[
                                    styles.slot,
                                    filled ? styles.slotFilled : styles.slotEmpty,
                                    isLegendarySlot ? styles.slotLegendaryLane : undefined,
                                    isHiddenSlot ? styles.slotHiddenLane : undefined,
                                ]}
                                accessibilityRole="button"
                                accessibilityLabel={
                                    filled
                                        ? `${ingredient.name} 제거`
                                        : isLegendarySlot
                                          ? '전설 레시피 재료 칸'
                                          : isHiddenSlot
                                            ? '히든 레시피 재료 칸'
                                            : `일반 레시피 재료 칸 ${index + 1}`
                                }
                            >
                                <View style={styles.slotInner}>
                                    {filled ? (
                                        ingredient.imageSource != null ? (
                                            <BrandEmojiImage
                                                source={ingredient.imageSource}
                                                size={36}
                                                accessibilityLabel={ingredient.name}
                                            />
                                        ) : (
                                            <Txt typography="t7" color="grey600" style={styles.slotText}>
                                                {ingredient.name}
                                            </Txt>
                                        )
                                    ) : null}
                                </View>
                            </Pressable>
                            {index === 0 || isHiddenSlot || isLegendarySlot ? (
                                <Txt typography="t7" color="grey500" style={styles.slotLabel}>
                                    {isLegendarySlot ? '전설' : isHiddenSlot ? '히든' : '일반·3'}
                                </Txt>
                            ) : (
                                <View style={styles.slotLabelSpacer} />
                            )}
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        width: '100%',
        marginBottom: 8,
        gap: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
    },
    slotCol: {
        alignItems: 'center',
        gap: 2,
    },
    slot: {
        width: 60,
        height: 60,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderWidth: 2,
    },
    slotInner: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    slotText: {
        textAlign: 'center',
    },
    slotEmpty: {
        backgroundColor: colors.slotEmpty,
        borderColor: colors.border,
        borderStyle: 'dashed',
    },
    slotFilled: {
        backgroundColor: colors.slotFilled,
        borderColor: colors.primary,
    },
    slotHiddenLane: {
        marginLeft: 4,
    },
    slotLegendaryLane: {
        marginLeft: 4,
    },
    slotLabel: {
        fontSize: 9,
        lineHeight: 12,
    },
    slotLabelSpacer: {
        height: 12,
    },
});
