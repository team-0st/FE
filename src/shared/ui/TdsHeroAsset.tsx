import type { ImageSourcePropType, StyleProp, ViewStyle } from 'react-native';
import { Image, StyleSheet, View } from 'react-native';
import { Asset, frameShape } from '@toss/tds-react-native';
import { colors } from '../theme/colors';
import { toBrandImageSource } from './toBrandImageSource';

type HeroSize = 'medium' | 'large' | 'hero';

const PIXEL_SIZE: Record<HeroSize, number> = {
    medium: 80,
    large: 140,
    hero: 160,
};

type TdsHeroAssetProps = {
    iconName?: string;
    source?: ImageSourcePropType;
    size?: HeroSize;
    backgroundColor?: string;
    style?: StyleProp<ViewStyle>;
    accessibilityLabel?: string;
};

export function TdsHeroAsset({
    iconName,
    source,
    size = 'large',
    backgroundColor = colors.heroTint,
    style,
    accessibilityLabel,
}: TdsHeroAssetProps) {
    if (source != null) {
        const dim = PIXEL_SIZE[size];
        const uriSource = toBrandImageSource(source);
        if (uriSource == null) {
            return null;
        }
        return (
            <View style={[styles.wrap, { width: dim, height: dim }, style]}>
                <Image
                    source={uriSource}
                    style={{ width: dim, height: dim }}
                    resizeMode="contain"
                    accessibilityLabel={accessibilityLabel}
                />
            </View>
        );
    }

    if (iconName == null) {
        return null;
    }

    const frameShapeKey = size === 'medium' ? frameShape.CircleMedium : frameShape.CircleLarge;

    return (
        <Asset.Icon
            name={iconName}
            frameShape={frameShapeKey}
            backgroundColor={backgroundColor}
            style={style}
            accessibilityLabel={accessibilityLabel}
        />
    );
}

const styles = StyleSheet.create({
    wrap: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});
