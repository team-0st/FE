import { getIngredientById } from '@api/mock';
import { BREW_SLOT_MAX, LEGENDARY_SLOT_COUNT, WEEKLY_SLOT_COUNT } from '@api/mock/recipes';
import { Txt } from '@toss/tds-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

type IngredientSlotBarProps = {
    slots: (string | null)[];
    onPressSlot: (index: number) => void;
};

export function IngredientSlotBar({ slots, onPressSlot }: IngredientSlotBarProps) {
    return (
        <View style={styles.wrap}>
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
                                {filled ? (
                                    <Txt typography="t2">{ingredient.emoji}</Txt>
                                ) : (
                                    <Txt typography="t4" color="grey400">
                                        □
                                    </Txt>
                                )}
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
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
    },
    slotCol: {
        alignItems: 'center',
        gap: 4,
    },
    slot: {
        width: 60,
        height: 60,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
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
        fontSize: 11,
    },
    slotLabelSpacer: {
        height: 14,
    },
});
