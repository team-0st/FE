import { getIngredientById } from '@api/mock/ingredients';
import { StyleSheet, View } from 'react-native';
import { BrandEmojiImage } from './BrandEmojiImage';

type RecipeIngredientIconsProps = {
    ingredientIds: string[];
    size?: number;
};

/** 레시피 재료 PNG 가로 나열 */
export function RecipeIngredientIcons({ ingredientIds, size = 28 }: RecipeIngredientIconsProps) {
    return (
        <View style={styles.row}>
            {ingredientIds.map((id, index) => {
                const item = getIngredientById(id);
                if (item?.imageSource == null) {
                    return null;
                }
                return (
                    <BrandEmojiImage
                        key={`${id}-${index}`}
                        source={item.imageSource}
                        size={size}
                        accessibilityLabel={item.name}
                    />
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
});
