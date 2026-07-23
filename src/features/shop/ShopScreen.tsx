import { getPointEligibleShops, getShopById } from '@api/mock';
import { Button, ListRow, Top, Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import { useUser } from '../user/UserProvider';
import { GuideHero } from '../../shared/ui/GuideHero';
import { Screen } from '../../shared/ui/Screen';
import { TDS_ICON } from '../../shared/constants/tdsAssets';
import { colors } from '../../shared/theme/colors';

type ShopScreenProps = {
    onPressSelectShop: () => void;
};

export function ShopScreen({ onPressSelectShop }: ShopScreenProps) {
    const { state } = useUser();
    const pointShops = getPointEligibleShops();
    const shop = state.shopId != null ? getShopById(state.shopId) : undefined;

    return (
        <Screen scrollable accessibilityLabel="내 샵">
            <Top
                title={<Top.TitleParagraph size={22}>내 샵</Top.TitleParagraph>}
                subtitle2={
                    <Top.SubtitleParagraph>함께 실천하는 제로웨이스트 샵이에요.</Top.SubtitleParagraph>
                }
            />
            {shop != null ? (
                <>
                    <GuideHero
                        message={`${shop.name}과 함께 일상 실천을 이어가요.`}
                        align="start"
                        compact
                    />
                    <View style={styles.card}>
                        <Txt typography="t4" fontWeight="bold" style={styles.name}>
                            {shop.name}
                        </Txt>
                        <Txt typography="t6" color="grey700" style={styles.description}>
                            {shop.description}
                        </Txt>
                    </View>
                </>
            ) : (
                <GuideHero
                    message={'아직 선택한 샵이 없어요.\n단골 샵을 선택해 주세요.'}
                    mood="think"
                    align="start"
                    compact
                />
            )}
            <Button size="medium" type="dark" style="weak" onPress={onPressSelectShop}>
                {shop != null ? '샵 바꾸기' : '샵 선택하기'}
            </Button>
            <Txt typography="t5" fontWeight="semibold" style={styles.section}>
                포인트 연동 샵
            </Txt>
            {pointShops.map((item) => (
                <ListRow
                    key={item.id}
                    left={<ListRow.Icon name={TDS_ICON.shopStore} />}
                    contents={
                        <ListRow.Texts
                            type="2RowTypeA"
                            top={item.name}
                            topProps={{ fontWeight: 'bold' }}
                            bottom={item.description}
                        />
                    }
                    right={
                        state.shopId === item.id ? (
                            <ListRow.RightTexts type="1RowTypeA" top="내 샵" topProps={{ color: 'blue500' }} />
                        ) : undefined
                    }
                />
            ))}
        </Screen>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    name: {
        marginTop: 12,
        marginBottom: 4,
    },
    description: {
        marginTop: 12,
        textAlign: 'center',
        lineHeight: 22,
    },
    section: {
        marginTop: 24,
        marginBottom: 8,
    },
});
