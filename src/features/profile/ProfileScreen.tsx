import { Top, Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import { useUser } from '../user/UserProvider';
import { resolveShopName } from '../user/selectors';
import { GuideHero } from '../../shared/ui/GuideHero';
import { Screen } from '../../shared/ui/Screen';
import { colors } from '../../shared/theme/colors';

export function ProfileScreen() {
    const { state } = useUser();
    const shopName = resolveShopName(state.shopId);
    const stampCount = Object.values(state.missionProgress).filter((p) => p.status === 'completed').length;

    return (
        <Screen scrollable contentCentered>
            <Top
                title={<Top.TitleParagraph size={22}>기록</Top.TitleParagraph>}
                subtitle2={<Top.SubtitleParagraph>내 실천 기록</Top.SubtitleParagraph>}
            />
            <GuideHero
                message={`${stampCount}개의 미션을 완료했어요. 계속 실천해 봐요.`}
                mood="happy"
                size="large"
                animate
                compact
            />
            <View style={styles.card}>
                <Txt typography="t4" fontWeight="bold">
                    {state.nickname}
                </Txt>
                <Txt typography="t6" color="grey600">
                    {shopName}
                </Txt>
                <View style={styles.stats}>
                    <Txt typography="t6">연속 {state.streakDays}일</Txt>
                    <Txt typography="t6">누적 {state.totalPoints}P</Txt>
                </View>
            </View>
            <View style={styles.stamp}>
                <Txt typography="t3">🌱</Txt>
                <Txt typography="t7" color="grey600">
                    완료 미션
                </Txt>
                <Txt typography="t5" fontWeight="bold">
                    {stampCount}개
                </Txt>
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
        width: '100%',
    },
    stats: {
        marginTop: 16,
        gap: 4,
        alignItems: 'center',
    },
    stamp: {
        backgroundColor: colors.sproutTint,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        gap: 4,
        borderWidth: 1,
        borderColor: colors.border,
        width: '100%',
    },
});
