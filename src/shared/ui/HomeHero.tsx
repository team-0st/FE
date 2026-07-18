import { APP_DISPLAY_NAME } from '../constants/app';
import { Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';
import { SproutAvatar } from './SproutAvatar';

type HomeHeroProps = {
    nickname: string;
    totalPoints: number;
    weeklyMissionDone: number;
    weeklyMissionTotal: number;
    shopEmoji: string;
    shopName: string;
    shopDescription: string;
};

export function HomeHero({
    nickname,
    totalPoints,
    weeklyMissionDone,
    weeklyMissionTotal,
    shopEmoji,
    shopName,
    shopDescription,
}: HomeHeroProps) {
    return (
        <View style={styles.hero}>
            <SproutAvatar size="hero" animate />
            <Txt typography="t7" color="grey600" style={styles.appName}>
                {APP_DISPLAY_NAME}
            </Txt>
            <Txt typography="t2" fontWeight="bold" style={styles.title}>
                {`${nickname}님`}
            </Txt>
            <Txt typography="t6" color="grey600" style={styles.stats}>
                {`알맹 ${totalPoints}P · 이번 주 미션 ${weeklyMissionDone}/${weeklyMissionTotal}`}
            </Txt>
            <View style={styles.shopBadge}>
                <Txt typography="t1">{shopEmoji}</Txt>
                <Txt typography="t6" fontWeight="semibold" style={styles.shopLabel}>
                    {shopName}
                </Txt>
                <Txt typography="t7" color="grey500">
                    {shopDescription}
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
