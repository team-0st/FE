import { MOCK_SHOPS } from '@api/mock';
import { Button, ListRow } from '@toss/tds-react-native';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useUser } from '../user/UserProvider';
import { GuideHero } from '../../shared/ui/GuideHero';
import { Screen } from '../../shared/ui/Screen';

type ShopSelectScreenProps = {
    initialShopId: string | null;
    onPressComplete: (shopId: string) => void;
    onboarding?: boolean;
};

export function ShopSelectScreen({ initialShopId, onPressComplete, onboarding = false }: ShopSelectScreenProps) {
    const { state } = useUser();
    const defaultId = initialShopId ?? state.shopId ?? MOCK_SHOPS[0]?.id ?? 'demo';
    const [selectedId, setSelectedId] = useState(defaultId);

    return (
        <Screen>
            <View style={styles.body}>
                <View style={styles.hero}>
                    <GuideHero
                        message="함께 실천할 제로웨이스트 샵을 골라주세요. 파일럿 기간에는 한 샵 단위로 모여요."
                        mood="think"
                        size="large"
                        animate={onboarding}
                        compact
                    />
                </View>
                <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
                    {MOCK_SHOPS.map((shop) => (
                        <ListRow
                            key={shop.id}
                            onPress={() => setSelectedId(shop.id)}
                            contents={
                                <ListRow.Texts
                                    type="2RowTypeA"
                                    top={`${shop.emoji} ${shop.name}`}
                                    topProps={{ fontWeight: 'bold' }}
                                    bottom={shop.philosophy}
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
            </View>
            <View style={styles.cta}>
                <Button size="large" type="primary" display="block" onPress={() => onPressComplete(selectedId)}>
                    선택 완료
                </Button>
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    body: {
        flex: 1,
        paddingTop: 12,
    },
    hero: {
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    list: {
        flex: 1,
        paddingHorizontal: 8,
    },
    cta: {
        padding: 20,
        maxWidth: 400,
        width: '100%',
        alignSelf: 'center',
    },
});
