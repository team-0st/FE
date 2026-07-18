import type { ShopCategoryFilter } from '@api/mock/shopCategories';
import { SHOP_CATEGORY_FILTER_ORDER, getShopCategoryFilterLabel } from '@api/mock/shopCategories';
import { Txt } from '@toss/tds-react-native';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

type ShopCategoryChipsProps = {
    selected: ShopCategoryFilter;
    onSelect: (category: ShopCategoryFilter) => void;
};

export function ShopCategoryChips({ selected, onSelect }: ShopCategoryChipsProps) {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.row}
        >
            {SHOP_CATEGORY_FILTER_ORDER.map((category) => {
                const active = selected === category;
                return (
                    <Pressable
                        key={category}
                        onPress={() => onSelect(category)}
                        style={[styles.chip, active ? styles.chipActive : undefined]}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                    >
                        <Txt typography="t7" fontWeight={active ? 'bold' : 'regular'}>
                            {getShopCategoryFilterLabel(category)}
                        </Txt>
                    </Pressable>
                );
            })}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        gap: 8,
        paddingVertical: 2,
    },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
    },
    chipActive: {
        borderColor: colors.primary,
        backgroundColor: colors.primaryLight,
    },
});
