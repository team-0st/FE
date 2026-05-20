import { Image, StyleSheet, View } from 'react-native';
import { Txt } from '@toss/tds-react-native';
import type { ZodiacId } from '../constants/zodiac';
import { getTeamCharacterImage } from '../constants/teamCharacters';
import { colors } from '../theme/colors';

type TeamAvatarProps = {
    zodiacId: ZodiacId;
    emoji: string;
    size?: 'small' | 'medium';
};

const SIZES = { small: 40, medium: 56 } as const;

export function TeamAvatar({ zodiacId, emoji, size = 'medium' }: TeamAvatarProps) {
    const dimension = SIZES[size];
    const characterImage = getTeamCharacterImage(zodiacId);

    return (
        <View style={[styles.circle, { width: dimension, height: dimension, borderRadius: dimension / 2 }]}>
            {characterImage != null ? (
                <Image source={characterImage} style={{ width: dimension, height: dimension }} resizeMode="cover" />
            ) : (
                <Txt typography={size === 'small' ? 't4' : 't2'}>{emoji}</Txt>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    circle: {
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
    },
});
