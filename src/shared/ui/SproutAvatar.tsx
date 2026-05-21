import { Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import { guideEmoji, type GuideMood } from '../constants/guideCharacter';
import { colors } from '../theme/colors';

type SproutAvatarProps = {
    mood?: GuideMood;
    size?: 'small' | 'medium' | 'large';
};

const SIZE_MAP = {
    small: { box: 40, typo: 't4' as const },
    medium: { box: 56, typo: 't2' as const },
    large: { box: 72, typo: 't1' as const },
};

export function SproutAvatar({ mood = 'default', size = 'medium' }: SproutAvatarProps) {
    const spec = SIZE_MAP[size];
    return (
        <View style={[styles.circle, { width: spec.box, height: spec.box, borderRadius: spec.box / 2 }]}>
            <Txt typography={spec.typo}>{guideEmoji(mood)}</Txt>
        </View>
    );
}

const styles = StyleSheet.create({
    circle: {
        backgroundColor: colors.sproutTint,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
