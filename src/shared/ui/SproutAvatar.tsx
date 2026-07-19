import type { ReactNode } from 'react';
import { Animated, StyleSheet, View, Image } from 'react-native';
import { GUIDE_CHARACTER } from '../constants/guideCharacter';
import { HOME_DECOR } from '../constants/homeDecorAssets';
import { useFloatAnimation } from '../hooks/useFloatAnimation';
import { colors } from '../theme/colors';
import { toBrandImageSource } from './toBrandImageSource';

type SproutAvatarProps = {
    size?: 'small' | 'medium' | 'large' | 'hero';
    animate?: boolean;
};

/** 듀오(가로형) — 높이 기준, width는 비율로 */
const PIXEL_HEIGHT = {
    small: 36,
    medium: 52,
    large: 88,
    hero: 148,
} as const;

const DUO_ASPECT = 1.35;

export function SproutAvatar({ size = 'medium', animate = false }: SproutAvatarProps) {
    const floatStyle = useFloatAnimation(animate, size === 'hero' ? 10 : 8);
    const height = PIXEL_HEIGHT[size];
    const width = Math.round(height * DUO_ASPECT);
    const uriSource = toBrandImageSource(HOME_DECOR.homeHero);
    const icon =
        uriSource == null ? null : (
            <Image
                source={uriSource}
                style={{ width, height }}
                resizeMode="contain"
                accessibilityLabel={GUIDE_CHARACTER.duoLabel}
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
