import type { ImageSourcePropType, StyleProp, ImageStyle } from 'react-native';
import { Image, StyleSheet } from 'react-native';

type BrandEmojiImageProps = {
    source: ImageSourcePropType;
    size?: number;
    style?: StyleProp<ImageStyle>;
    accessibilityLabel?: string;
};

/** Figma 이모지 export — ListRow left / 슬롯용 */
export function BrandEmojiImage({
    source,
    size = 30,
    style,
    accessibilityLabel,
}: BrandEmojiImageProps) {
    return (
        <Image
            source={source}
            style={[styles.base, { width: size, height: size }, style]}
            resizeMode="contain"
            accessibilityLabel={accessibilityLabel}
        />
    );
}

const styles = StyleSheet.create({
    base: {
        marginRight: 4,
    },
});
