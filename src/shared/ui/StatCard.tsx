import { Txt } from '@toss/tds-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

type StatCardProps = {
    label: string;
    value: string;
    hint?: string;
    onPress?: () => void;
};

export function StatCard({ label, value, hint, onPress }: StatCardProps) {
    const content = (
        <View style={styles.card}>
            <Txt typography="t7" color="grey600">
                {label}
            </Txt>
            <Txt typography="t3" fontWeight="bold" style={styles.value}>
                {value}
            </Txt>
            {hint != null ? (
                <Txt typography="t7" color="blue500">
                    {hint}
                </Txt>
            ) : null}
        </View>
    );
    if (onPress == null) {
        return content;
    }
    return <Pressable onPress={onPress}>{content}</Pressable>;
}

const styles = StyleSheet.create({
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
    value: {
        marginVertical: 4,
    },
});
