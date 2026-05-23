import { APP_DISPLAY_NAME } from '../constants/app';
import { Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

type HomeHeroProps = {
    nickname: string;
    totalPoints: number;
    streakDays: number;
    shopEmoji: string;
    shopName: string;
    shopArea: string;
};

export function HomeHero({ nickname, totalPoints, streakDays, shopEmoji, shopName, shopArea }: HomeHeroProps) {
    return (
        <View style={styles.hero}>
            <View style={styles.textBlock}>
                <Txt typography="t7" color="grey600">
                    {APP_DISPLAY_NAME}
                </Txt>
                <Txt typography="t3" fontWeight="bold" style={styles.title}>
                    {`${nickname}님`}
                </Txt>
                <Txt typography="t6" color="grey600">
                    {`누적 ${totalPoints}P · 연속 ${streakDays}일`}
                </Txt>
            </View>
            <View style={styles.shopBadge}>
                <Txt typography="t1">{shopEmoji}</Txt>
                <Txt typography="t7" fontWeight="semibold" style={styles.shopLabel}>
                    {shopName}
                </Txt>
                <Txt typography="t7" color="grey500">
                    {shopArea}
                </Txt>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    hero: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.sproutTint,
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    textBlock: {
        flex: 1,
    },
    title: {
        marginTop: 4,
        marginBottom: 4,
    },
    shopBadge: {
        alignItems: 'center',
        gap: 2,
        maxWidth: 120,
    },
    shopLabel: {
        marginTop: 4,
        textAlign: 'center',
    },
});
