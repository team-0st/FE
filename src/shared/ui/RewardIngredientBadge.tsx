import { Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import type { Ingredient } from '@api/mock/ingredients';
import { colors } from '../theme/colors';

type RewardIngredientBadgeProps = {
    ingredient: Ingredient;
};

export function RewardIngredientBadge({ ingredient }: RewardIngredientBadgeProps) {
    return (
        <View style={styles.badge}>
            <Txt typography="t2">{ingredient.emoji}</Txt>
            <Txt typography="t6" fontWeight="bold" style={styles.label}>
                {ingredient.name}
            </Txt>
            <Txt typography="t7" color="grey600">
                재료 1개
            </Txt>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        alignItems: 'center',
        backgroundColor: colors.primaryLight,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: colors.primary,
        gap: 4,
    },
    label: {
        color: colors.primaryDark,
    },
});
