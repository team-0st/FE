import type { ImageSourcePropType, StyleProp, ImageStyle } from 'react-native';
import { Image, StyleSheet, View } from 'react-native';
import { toBrandImageSource } from './toBrandImageSource';

type BrandEmojiImageProps = {
    source: ImageSourcePropType;
    size?: number;
    style?: StyleProp<ImageStyle>;
    accessibilityLabel?: string;
};

/**
 * 재료 PNG.
 * - Granite FastImage / ListRow.Image 는 data·로컬 require 이슈가 있어 RN Image + `{ uri }` 사용
 * - brandAssets 는 data:image/png;base64 URI
 */
export function BrandEmojiImage({
    source,
    size = 30,
    style,
    accessibilityLabel,
}: BrandEmojiImageProps) {
    const uriSource = toBrandImageSource(source);
    if (uriSource == null) {
        return null;
    }
    return (
        <View style={[styles.wrap, { width: size, height: size }]}>
            <Image
                source={uriSource}
                style={[{ width: size, height: size }, style]}
                resizeMode="contain"
                accessibilityLabel={accessibilityLabel}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
