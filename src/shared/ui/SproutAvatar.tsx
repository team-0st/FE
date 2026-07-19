import type { ReactNode } from 'react';
import { Animated, StyleSheet, View, Image } from 'react-native';
import { BRAND_ASSET } from '../constants/brandAssets';
import { useFloatAnimation } from '../hooks/useFloatAnimation';
import { colors } from '../theme/colors';
import { toBrandImageSource } from './toBrandImageSource';

type SproutAvatarProps = {
    size?: 'small' | 'medium' | 'large' | 'hero';
    animate?: boolean;
};

const PIXEL_SIZE = {
    small: 32,
    medium: 48,
    large: 80,
    hero: 140,
} as const;

export function SproutAvatar({ size = 'medium', animate = false }: SproutAvatarProps) {
    const floatStyle = useFloatAnimation(animate, size === 'hero' ? 10 : 8);
    const dim = PIXEL_SIZE[size];
    const uriSource = toBrandImageSource(BRAND_ASSET.mascotCarrot);
    const icon =
        uriSource == null ? null : (
            <Image
                source={uriSource}
                style={{ width: dim, height: dim }}
                resizeMode="contain"
                accessibilityLabel="제로스트 당근"
            />
        );
    if (!animate) {
        return icon;
    }
    return <Animated.View style={floatStyle}>{icon}</Animated.View>;
}

export function SproutAvatarWrap({ children }: { children: ReactNode }) {
    return <View style={styles.glow}>{children}</View>;
}

const styles = StyleSheet.create({
    glow: {
        shadowColor: colors.sprout,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 2,
    },
});
