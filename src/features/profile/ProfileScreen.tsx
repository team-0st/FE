import { ListRow, Top, Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import { listIngredientStock } from '../user/ingredientInventory';
import { useUser } from '../user/UserProvider';
import { resolveShopName } from '../user/selectors';
import { Screen } from '../../shared/ui/Screen';
import { colors } from '../../shared/theme/colors';

type ProfileScreenProps = {
    onPressRestartOnboarding?: () => void;
};

export function ProfileScreen({ onPressRestartOnboarding }: ProfileScreenProps) {
    const { state } = useUser();
    const shopName = resolveShopName(state.shopId);
    const completed = state.completedRecipeIds.length;
    const ingredientRows = listIngredientStock(state.ingredientInventory);
    const ownedCount = ingredientRows.filter((row) => row.count > 0).length;

    return (
        <Screen scrollable>
            <Top
                title={<Top.TitleParagraph size={22}>마이</Top.TitleParagraph>}
                subtitle2={<Top.SubtitleParagraph>에코잼 · 스프 · 재료를 한곳에서 확인해요.</Top.SubtitleParagraph>}
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
            <View style={styles.ingredientSection}>
                <Txt typography="t5" fontWeight="semibold" style={styles.sectionTitle}>
                    보유 재료
                </Txt>
                <Txt typography="t7" color="grey600" style={styles.sectionHint}>
                    {ownedCount > 0
                        ? `보유 중 ${ownedCount}종 · 제작 탭에서 스프에 사용해요`
                        : '미션·출석을 완료하면 재료를 받을 수 있어요'}
                </Txt>
                <View style={styles.ingredientList}>
                    {ingredientRows.map((item) => {
                        const hasStock = item.count > 0;
                        return (
                            <ListRow
                                key={item.id}
                                contents={
                                    <ListRow.Texts
                                        type="2RowTypeA"
                                        top={`${item.emoji} ${item.name}`}
                                        topProps={{ fontWeight: 'bold' }}
                                        bottom={hasStock ? '제작 탭에서 사용 가능' : '보유 없음'}
                                    />
                                }
                                right={
                                    <ListRow.RightTexts
                                        type="1RowTypeA"
                                        top={hasStock ? `${item.count}개` : '0개'}
                                        topProps={{
                                            fontWeight: 'bold',
                                            color: hasStock ? 'blue500' : 'grey500',
                                        }}
                                    />
                                }
                            />
                        );
                    })}
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
                    연속 출석 {state.streakDays}일
                </Txt>
            </View>
            {onPressRestartOnboarding != null ? (
                <Txt
                    typography="t7"
                    color="blue500"
                    style={styles.restartOnboarding}
                    onPress={onPressRestartOnboarding}
                    accessibilityRole="button"
                    accessibilityLabel="처음부터 다시 시작"
                >
                    처음부터 다시 시작
                </Txt>
            ) : null}
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
    ingredientSection: {
        width: '100%',
        marginTop: 8,
        marginBottom: 12,
    },
    sectionTitle: {
        marginBottom: 4,
    },
    sectionHint: {
        marginBottom: 8,
    },
    ingredientList: {
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
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
    restartOnboarding: {
        marginTop: 24,
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
});
