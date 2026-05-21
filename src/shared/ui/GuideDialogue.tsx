import { Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import { GUIDE_CHARACTER, type GuideMood } from '../constants/guideCharacter';
import { colors } from '../theme/colors';
import { SproutAvatar } from './SproutAvatar';

type GuideDialogueProps = {
    message: string;
    mood?: GuideMood;
    compact?: boolean;
};

export function GuideDialogue({ message, mood = 'default', compact = false }: GuideDialogueProps) {
    return (
        <View style={[styles.wrap, compact && styles.wrapCompact]}>
            <View style={styles.header}>
                <SproutAvatar mood={mood} size={compact ? 'small' : 'medium'} />
                <View style={styles.nameTag}>
                    <Txt typography="t7" fontWeight="semibold" color="grey600">
                        {GUIDE_CHARACTER.name}
                    </Txt>
                </View>
            </View>
            <View style={styles.bubble}>
                <Txt typography={compact ? 't6' : 't5'} color="grey700" style={styles.message}>
                    {message}
                </Txt>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        marginBottom: 16,
    },
    wrapCompact: {
        marginBottom: 12,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    nameTag: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        paddingHorizontal: 10,
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
    message: {
        lineHeight: 22,
    },
});
