import { Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import { APP_DISPLAY_NAME } from '../constants/app';
import { colors } from '../theme/colors';

type HomeHeaderProps = {
    nickname: string;
    streakDays: number;
    weeklyLabel: string;
};

export function HomeHeader({ nickname, streakDays, weeklyLabel }: HomeHeaderProps) {
    return (
        <View style={styles.container}>
            <Txt typography="t6" color="grey600">
                {APP_DISPLAY_NAME}
            </Txt>
            <Txt typography="t3" fontWeight="bold" style={styles.title}>
                {nickname}님
            </Txt>
            <Txt typography="t6" color="grey600" style={styles.meta}>
                {`연속 ${streakDays}일 실천 · ${weeklyLabel}`}
            </Txt>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: colors.border,
    },
    title: {
        marginTop: 4,
    },
    meta: {
        marginTop: 8,
    },
});
