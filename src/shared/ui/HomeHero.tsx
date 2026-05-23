import { APP_DISPLAY_NAME } from '../constants/app';
import { Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';
import { SproutAvatar } from './SproutAvatar';

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
            <SproutAvatar mood="happy" size="hero" animate />
            <Txt typography="t7" color="grey600" style={styles.appName}>
                {APP_DISPLAY_NAME}
            </Txt>
            <Txt typography="t2" fontWeight="bold" style={styles.title}>
                {`${nickname}님`}
            </Txt>
            <Txt typography="t6" color="grey600" style={styles.stats}>
                {`누적 ${totalPoints}P · 연속 ${streakDays}일`}
            </Txt>
            <View style={styles.shopBadge}>
                <Txt typography="t1">{shopEmoji}</Txt>
                <Txt typography="t6" fontWeight="semibold" style={styles.shopLabel}>
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
        alignItems: 'center',
        backgroundColor: colors.sproutTint,
        borderRadius: 24,
        paddingVertical: 28,
        paddingHorizontal: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
        gap: 8,
    },
    appName: {
        marginTop: 4,
    },
    title: {
        marginTop: 2,
    },
    stats: {
        marginBottom: 4,
    },
    shopBadge: {
        alignItems: 'center',
        marginTop: 8,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        width: '100%',
        gap: 2,
    },
    shopLabel: {
        marginTop: 4,
        textAlign: 'center',
    },
});
