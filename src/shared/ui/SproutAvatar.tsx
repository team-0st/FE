import { Txt } from '@toss/tds-react-native';
import { Animated, StyleSheet, View } from 'react-native';
import { guideEmoji, type GuideMood } from '../constants/guideCharacter';
import { useFloatAnimation } from '../hooks/useFloatAnimation';
import { colors } from '../theme/colors';

type SproutAvatarProps = {
    mood?: GuideMood;
    size?: 'small' | 'medium' | 'large' | 'hero';
    animate?: boolean;
};

const SIZE_MAP = {
    small: { box: 40, typo: 't4' as const },
    medium: { box: 64, typo: 't2' as const },
    large: { box: 88, typo: 't1' as const },
    hero: { box: 112, typo: 't1' as const },
};

export function SproutAvatar({ mood = 'default', size = 'medium', animate = false }: SproutAvatarProps) {
    const spec = SIZE_MAP[size];
    const floatStyle = useFloatAnimation(animate, size === 'hero' ? 10 : 8);
    const circle = (
        <View style={[styles.circle, styles.glow, { width: spec.box, height: spec.box, borderRadius: spec.box / 2 }]}>
            <Txt typography={spec.typo}>{guideEmoji(mood)}</Txt>
        </View>
    );
    if (!animate) {
        return circle;
    }
    return <Animated.View style={floatStyle}>{circle}</Animated.View>;
}

const styles = StyleSheet.create({
    circle: {
        backgroundColor: colors.sproutTint,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    glow: {
        shadowColor: colors.sprout,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 2,
    },
});
