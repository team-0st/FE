import { getIngredientById } from '@api/mock/ingredients';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { BrandEmojiImage } from './BrandEmojiImage';
import { colors } from '../theme/colors';

type RecipeIngredientIconsProps = {
    ingredientIds: string[];
    /** 고정 크기. 없으면 화면 너비·개수에 맞춰 한 줄에 들어가게 계산 */
    size?: number;
};

const ROW_SIDE_RESERVE = 200;
const ICON_GAP = 6;
const ICON_MAX = 44;
const ICON_MIN = 28;
const LABEL_FONT = 12;
const LABEL_MIN_SCALE = 0.55;

function fitIconSize(windowWidth: number, count: number): number {
    if (count <= 0) {
        return ICON_MIN;
    }
    const available = Math.max(ICON_MIN, windowWidth - ROW_SIDE_RESERVE);
    const raw = floorDiv(available - ICON_GAP * (count - 1), count);
    return Math.min(ICON_MAX, Math.max(ICON_MIN, raw));
}

function floorDiv(a: number, b: number): number {
    return Math.floor(a / b);
}

/** 레시피 재료: 그림 한 줄 + 각 그림 아래 이름(잘림 없이 축소·줄바꿈) */
export function RecipeIngredientIcons({
    ingredientIds,
    size: sizeOverride,
}: RecipeIngredientIconsProps) {
    const { width } = useWindowDimensions();
    const items = ingredientIds.map((id) => {
        const known = getIngredientById(id);
        if (known != null) {
            return known;
        }
        return {
            id,
            name: id.startsWith('be-') ? '재료' : id,
            emoji: '',
            type: 'COMMON' as const,
            imageSource: null,
        };
    });
    const size = sizeOverride ?? fitIconSize(width, items.length);

    return (
        <View style={styles.row}>
            {items.map((item, index) => (
                <View key={`${item.id}-${index}`} style={styles.item}>
                    {item.imageSource != null ? (
                        <BrandEmojiImage
                            source={item.imageSource}
                            size={size}
                            containerStyle={styles.iconNoMargin}
                            accessibilityLabel={item.name}
                        />
                    ) : (
                        <View
                            style={[
                                styles.iconFallback,
                                {
                                    width: size,
                                    height: size,
                                    borderRadius: size / 4,
                                },
                            ]}
                            accessibilityLabel={item.name}
                        />
                    )}
                    <Text
                        style={styles.label}
                        adjustsFontSizeToFit
                        minimumFontScale={LABEL_MIN_SCALE}
                        numberOfLines={2}
                        allowFontScaling
                    >
                        {item.name}
                    </Text>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
        alignItems: 'flex-start',
        gap: ICON_GAP,
        marginTop: 6,
        width: '100%',
    },
    item: {
        flex: 1,
        alignItems: 'center',
        minWidth: 0,
    },
    iconNoMargin: {
        marginRight: 0,
    },
    iconFallback: {
        backgroundColor: colors.primaryLight,
    },
    label: {
        marginTop: 2,
        width: '100%',
        textAlign: 'center',
        fontSize: LABEL_FONT,
        lineHeight: LABEL_FONT + 3,
        color: colors.textSecondary,
        fontWeight: '500',
    },
});
