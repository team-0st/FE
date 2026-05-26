import { getIngredientById } from '@api/mock';
import { BREW_SLOT_COUNT } from '@api/mock/recipes';
import { Txt } from '@toss/tds-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

type IngredientSlotBarProps = {
    slots: (string | null)[];
    onPressSlot: (index: number) => void;
};

export function IngredientSlotBar({ slots, onPressSlot }: IngredientSlotBarProps) {
    return (
        <View style={styles.row}>
            {Array.from({ length: BREW_SLOT_COUNT }, (_, index) => {
                const id = slots[index] ?? null;
                const ingredient = id != null ? getIngredientById(id) : undefined;
                const filled = ingredient != null;
                return (
                    <Pressable
                        key={index}
                        onPress={() => onPressSlot(index)}
                        style={[styles.slot, filled ? styles.slotFilled : styles.slotEmpty]}
                        accessibilityRole="button"
                        accessibilityLabel={filled ? `${ingredient.name} 제거` : `재료 칸 ${index + 1}`}
                    >
                        {filled ? (
                            <Txt typography="t2">{ingredient.emoji}</Txt>
                        ) : (
                            <Txt typography="t4" color="grey400">
                                □
                            </Txt>
                        )}
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 20,
    },
    slot: {
        width: 64,
        height: 64,
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
});
