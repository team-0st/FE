import type { ImageSourcePropType, StyleProp, ViewStyle } from 'react-native';
import { Image, StyleSheet, View } from 'react-native';
import { Asset, frameShape } from '@toss/tds-react-native';
import { colors } from '../theme/colors';

type HeroSize = 'medium' | 'large' | 'hero';

const PIXEL_SIZE: Record<HeroSize, number> = {
    medium: 80,
    large: 140,
    hero: 160,
};

type TdsHeroAssetProps = {
    /** TDS CDN 아이콘 이름 — `source`가 있으면 무시 */
    iconName?: string;
    /** Figma export 로컬 PNG (`require(...)`) */
    source?: ImageSourcePropType;
    size?: HeroSize;
    backgroundColor?: string;
    style?: StyleProp<ViewStyle>;
    accessibilityLabel?: string;
};

/**
 * 히어로 슬롯.
 * - 로컬 PNG → RN Image (Apps in Toss Asset.Image는 uri만 지원)
 * - TDS 아이콘 → Asset.Icon
 */
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
        return (
            <View style={[styles.wrap, { width: dim, height: dim }, style]}>
                <Image
                    source={source}
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
