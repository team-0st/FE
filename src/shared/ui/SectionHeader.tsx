import { Txt } from '@toss/tds-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
type SectionHeaderProps = {
    title: string;
    actionLabel?: string;
    onPressAction?: () => void;
};

export function SectionHeader({ title, actionLabel, onPressAction }: SectionHeaderProps) {
    return (
        <View style={styles.row}>
            <Txt typography="t4" fontWeight="bold" color="grey900">
                {title}
            </Txt>
            {actionLabel != null && onPressAction != null ? (
                <Pressable onPress={onPressAction} hitSlop={8}>
                    <Txt typography="t6" fontWeight="semibold" color="blue500">
                        {actionLabel}
                    </Txt>
                </Pressable>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
});
