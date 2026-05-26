import { Top, Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import { useUser } from '../user/UserProvider';
import { resolveShopName } from '../user/selectors';
import { Screen } from '../../shared/ui/Screen';
import { colors } from '../../shared/theme/colors';

export function ProfileScreen() {
    const { state } = useUser();
    const shopName = resolveShopName(state.shopId);
    const completed = state.completedRecipeIds.length;

    return (
        <Screen scrollable contentCentered>
            <Top
                title={<Top.TitleParagraph size={22}>마이</Top.TitleParagraph>}
                subtitle2={<Top.SubtitleParagraph>리워드와 실천 기록</Top.SubtitleParagraph>}
            />
            <View style={styles.hero}>
                <Txt typography="t2" fontWeight="bold">
                    {state.nickname}
                </Txt>
                <Txt typography="t6" color="grey600">
                    {shopName}
                </Txt>
            </View>
            <View style={styles.row}>
                <View style={styles.card}>
                    <Txt typography="t3">🫙</Txt>
                    <Txt typography="t7" color="grey600">
                        에코잼
                    </Txt>
                    <Txt typography="t4" fontWeight="bold">
                        {state.ecoJam}
                    </Txt>
                </View>
                <View style={styles.card}>
                    <Txt typography="t3">🍲</Txt>
                    <Txt typography="t7" color="grey600">
                        완성 스프
                    </Txt>
                    <Txt typography="t4" fontWeight="bold">
                        {completed}개
                    </Txt>
                </View>
            </View>
            <View style={styles.cardWide}>
                <Txt typography="t7" color="grey600">
                    이번 주 미션
                </Txt>
                <Txt typography="t5" fontWeight="bold">
                    {state.weeklyMissionDone}/{state.weeklyMissionTotal}
                </Txt>
                <Txt typography="t7" color="grey600" style={styles.sub}>
                    연속 {state.streakDays}일 · 누적 {state.totalPoints}P
                </Txt>
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    hero: {
        alignItems: 'center',
        marginBottom: 20,
        gap: 4,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
        marginBottom: 12,
    },
    card: {
        flex: 1,
        backgroundColor: colors.primaryLight,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        gap: 4,
        borderWidth: 1,
        borderColor: colors.border,
    },
    cardWide: {
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        gap: 4,
        borderWidth: 1,
        borderColor: colors.border,
    },
    sub: {
        marginTop: 8,
    },
});
