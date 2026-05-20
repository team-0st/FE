import { Badge, Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import { APP_DISPLAY_NAME } from '../constants/app';
import { colors } from '../theme/colors';

type GamifiedHeroProps = {
    nickname: string;
    streakDays: number;
    weeklyLabel: string;
};

export function GamifiedHero({ nickname, streakDays, weeklyLabel }: GamifiedHeroProps) {
    return (
        <View style={styles.container}>
            <View style={styles.emojiCircle}>
                <Txt typography="t1">{streakDays > 0 ? '🌱' : '🌍'}</Txt>
            </View>
            <Txt typography="t6" color="grey600">
                {APP_DISPLAY_NAME}
            </Txt>
            <Txt typography="t2" fontWeight="bold" style={styles.title}>
                {nickname}님, 오늘도 한 걸음
            </Txt>
            <View style={styles.badges}>
                <Badge size="small" badgeStyle="weak" type="blue">
                    {`🔥 ${streakDays}일 연속`}
                </Badge>
                <Badge size="small" badgeStyle="weak" type="green">
                    {weeklyLabel}
                </Badge>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.heroTint,
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        marginBottom: 20,
    },
    emojiCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    title: {
        marginTop: 4,
        textAlign: 'center',
    },
    badges: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
});
