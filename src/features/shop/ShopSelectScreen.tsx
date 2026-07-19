import { getPointEligibleShops } from '@api/mock';
import { DEFAULT_PILOT_SHOP_ID } from '@api/mock/shops';
import { BottomCTA, ListRow, Top, Txt } from '@toss/tds-react-native';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ONBOARDING_SHOP_GUIDE } from '../../shared/constants/guideCopy';
import { PILOT_SHOP_DISPLAY_NAME } from '../../shared/constants/pilotShop';
import { TDS_ICON } from '../../shared/constants/tdsAssets';
import { colors } from '../../shared/theme/colors';
import { Screen } from '../../shared/ui/Screen';
import { useUser } from '../user/UserProvider';

type ShopSelectScreenProps = {
    initialShopId: string | null;
    onPressComplete: (shopId: string) => void;
    onboarding?: boolean;
};

/** Figma `03 온보딩 - 샵선택` (26:4118) */
export function ShopSelectScreen({ initialShopId, onPressComplete, onboarding = false }: ShopSelectScreenProps) {
    const { state } = useUser();
    const pointShops = getPointEligibleShops();
    const defaultId = initialShopId ?? state.shopId ?? pointShops[0]?.id ?? DEFAULT_PILOT_SHOP_ID;
    const [selectedId, setSelectedId] = useState(defaultId);

    return (
        <View style={styles.root}>
            <Screen>
                <Top
                    title={<Top.TitleParagraph size={22}>제로스트</Top.TitleParagraph>}
                    subtitle2={
                        onboarding ? (
                            <Top.SubtitleParagraph>
                                단골 샵은 {PILOT_SHOP_DISPLAY_NAME}이에요.
                            </Top.SubtitleParagraph>
                        ) : undefined
                    }
                />
                <View style={styles.hero}>
                    <Txt typography="t4" fontWeight="medium" style={styles.heroTitle}>
                        {ONBOARDING_SHOP_GUIDE.title}
                    </Txt>
                    <Txt typography="t7" color="grey600" style={styles.heroSub}>
                        {ONBOARDING_SHOP_GUIDE.subtitle}
                    </Txt>
                </View>
                <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
                    {pointShops.map((shop) => (
                        <ListRow
                            key={shop.id}
                            onPress={() => setSelectedId(shop.id)}
                            left={<ListRow.Icon name={TDS_ICON.shopStore} />}
                            contents={
                                <ListRow.Texts
                                    type="2RowTypeA"
                                    top={shop.name}
                                    topProps={{ fontWeight: 'bold' }}
                                    bottom={shop.description}
                                />
                            }
                            right={
                                selectedId === shop.id ? (
                                    <ListRow.RightTexts
                                        type="1RowTypeA"
                                        top="선택"
                                        topProps={{ color: 'blue500' }}
                                    />
                                ) : undefined
                            }
                        />
                    ))}
                </ScrollView>
            </Screen>
            <View style={styles.cta}>
                <BottomCTA.Single
                    size="large"
                    type="primary"
                    display="block"
                    onPress={() => onPressComplete(selectedId)}
                    accessibilityLabel="선택 완료"
                >
                    선택 완료
                </BottomCTA.Single>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.surface,
    },
    hero: {
        paddingHorizontal: 24,
        paddingTop: 8,
        paddingBottom: 16,
        gap: 8,
    },
    heroTitle: {
        textAlign: 'center',
        lineHeight: 30,
    },
    heroSub: {
        textAlign: 'center',
        lineHeight: 20,
    },
    list: {
        flex: 1,
    },
    cta: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        maxWidth: 400,
        width: '100%',
        alignSelf: 'center',
    },
});
