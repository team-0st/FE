import { Asset, frameShape, Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import type { Ingredient } from '@api/mock/ingredients';
import { BrandEmojiImage } from './BrandEmojiImage';
import { colors } from '../theme/colors';

type RewardIngredientBadgeProps = {
    ingredient: Ingredient;
};

export function RewardIngredientBadge({ ingredient }: RewardIngredientBadgeProps) {
    return (
        <View style={styles.badge}>
            {ingredient.imageSource != null ? (
                <BrandEmojiImage
                    source={ingredient.imageSource}
                    size={40}
                    accessibilityLabel={ingredient.name}
                />
            ) : (
                <Asset.Text
                    frameShape={frameShape.CircleMedium}
                    backgroundColor={colors.primaryLight}
                    size={24}
                >
                    {ingredient.emoji}
                </Asset.Text>
            )}
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
