import { Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import { GUIDE_CHARACTER, type GuideMood } from '../constants/guideCharacter';
import { colors } from '../theme/colors';
import { SproutAvatar, SproutAvatarWrap } from './SproutAvatar';

type GuideHeroProps = {
    message: string;
    mood?: GuideMood;
    size?: 'medium' | 'large' | 'hero';
    animate?: boolean;
    compact?: boolean;
    align?: 'center' | 'start';
};

export function GuideHero({
    message,
    mood: _mood = 'default',
    size = 'hero',
    animate = true,
    compact = false,
    align = 'center',
}: GuideHeroProps) {
    const avatarSize = compact ? 'medium' : size;
    const isCentered = align === 'center';

    return (
        <View style={[styles.wrap, compact && styles.wrapCompact, !isCentered && styles.wrapStart]}>
            {isCentered ? (
                <>
                    <SproutAvatarWrap>
                        <SproutAvatar size={avatarSize} animate={animate} />
                    </SproutAvatarWrap>
                    <View style={styles.nameTag}>
                        <Txt typography="t7" fontWeight="semibold" color="grey600">
                            {GUIDE_CHARACTER.name}
                        </Txt>
                    </View>
                </>
            ) : (
                <View style={styles.header}>
                    <SproutAvatarWrap>
                        <SproutAvatar size={compact ? 'small' : 'medium'} animate={false} />
                    </SproutAvatarWrap>
                    <View style={styles.nameTag}>
                        <Txt typography="t7" fontWeight="semibold" color="grey600">
                            {GUIDE_CHARACTER.name}
                        </Txt>
                    </View>
                </View>
            )}
            <View style={[styles.bubble, isCentered && styles.bubbleCentered]}>
                <Txt
                    typography={compact ? 't6' : 't5'}
                    color="grey700"
                    style={[styles.message, isCentered && styles.messageCentered]}
                >
                    {message}
                </Txt>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        alignItems: 'center',
        marginBottom: 24,
        gap: 12,
    },
    wrapCompact: {
        marginBottom: 16,
        gap: 10,
    },
    wrapStart: {
        alignItems: 'stretch',
        gap: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    nameTag: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: colors.border,
    },
    bubble: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    bubbleCentered: {
        width: '100%',
        maxWidth: 320,
        borderRadius: 20,
        padding: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 1,
    },
    message: {
        lineHeight: 22,
    },
    messageCentered: {
        lineHeight: 24,
        textAlign: 'center',
    },
});
