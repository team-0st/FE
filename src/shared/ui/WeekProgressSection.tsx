import { ProgressBar, Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

type WeekProgressSectionProps = {
    done: number;
    total: number;
};

export function WeekProgressSection({ done, total }: WeekProgressSectionProps) {
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;
    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <Txt typography="t5" fontWeight="semibold">
                    이번 주 실천률
                </Txt>
                <Txt typography="t6" fontWeight="bold" color="blue500">
                    {done}/{total}
                </Txt>
            </View>
            <ProgressBar progress={progress} size="normal" color={colors.success} style={styles.bar} />
            <Txt typography="t7" color="grey600">
                미션을 완료할수록 팀 순위에 반영돼요.
            </Txt>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.sproutTint,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    bar: {
        marginBottom: 8,
    },
});
