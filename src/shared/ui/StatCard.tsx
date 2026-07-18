import { Txt } from '@toss/tds-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

type StatCardProps = {
    label: string;
    value: string;
    hint?: string;
    /** action: 탭 유도(blue), info: 안내만(grey) */
    hintTone?: 'action' | 'info';
    /** 홈 출석 등 힌트가 길 때 여유 높이 */
    spacious?: boolean;
    onPress?: () => void;
    accessibilityLabel?: string;
};

export function StatCard({
    label,
    value,
    hint,
    hintTone = 'info',
    spacious = false,
    onPress,
    accessibilityLabel,
}: StatCardProps) {
    const resolvedHintTone = onPress != null && hint != null ? hintTone : 'info';
    const hintColor = resolvedHintTone === 'action' ? 'blue500' : 'grey600';

    const content = (
        <View style={[styles.card, spacious ? styles.cardSpacious : undefined]}>
            <Txt typography="t7" color="grey600">
                {label}
            </Txt>
            <Txt typography="t3" fontWeight="bold" style={styles.value}>
                {value}
            </Txt>
            {hint != null ? (
                <Txt typography="t7" color={hintColor} style={styles.hint}>
                    {hint}
                </Txt>
            ) : null}
        </View>
    );

    if (onPress == null) {
        return content;
    }

    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel ?? `${label}, ${value}, ${hint ?? ''}`}
            style={styles.pressable}
        >
            {content}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    pressable: {
        flex: 1,
        minHeight: 44,
    },
    card: {
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
        minHeight: 96,
        justifyContent: 'space-between',
    },
    cardSpacious: {
        minHeight: 120,
        paddingVertical: 18,
    },
    value: {
        marginVertical: 6,
    },
    hint: {
        lineHeight: 18,
    },
});
