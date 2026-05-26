import { INGREDIENTS } from '@api/mock';
import { BREW_SLOT_COUNT } from '@api/mock/recipes';
import { Button, ListRow, Top, Txt } from '@toss/tds-react-native';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useUser } from '../user/UserProvider';
import { IngredientSlotBar } from '../../shared/ui/IngredientSlotBar';
import { Screen } from '../../shared/ui/Screen';

type IngredientsScreenProps = {
    onSoupMade: (recipeId: string) => void;
};

function emptySlots(): (string | null)[] {
    return Array.from({ length: BREW_SLOT_COUNT }, () => null);
}

export function IngredientsScreen({ onSoupMade }: IngredientsScreenProps) {
    const { state, brewSoup } = useUser();
    const [slots, setSlots] = useState<(string | null)[]>(emptySlots);

    const allFilled = slots.every((s) => s != null);

    const handlePressIngredient = useCallback(
        (ingredientId: string) => {
            const count = state.ingredientInventory[ingredientId] ?? 0;
            const usedInSlots = slots.filter((s) => s === ingredientId).length;
            if (count <= usedInSlots) {
                return;
            }
            setSlots((prev) => {
                const next = [...prev];
                const emptyIndex = next.findIndex((s) => s == null);
                if (emptyIndex < 0) {
                    return prev;
                }
                next[emptyIndex] = ingredientId;
                return next;
            });
        },
        [slots, state.ingredientInventory],
    );

    const handlePressSlot = useCallback((index: number) => {
        setSlots((prev) => {
            const next = [...prev];
            next[index] = null;
            return next;
        });
    }, []);

    const handleBrew = async () => {
        const result = await brewSoup(slots);
        if (!result.ok) {
            const message =
                result.reason === 'incomplete'
                    ? '네 칸을 모두 채워 주세요.'
                    : result.reason === 'no_match'
                      ? '아직 알려지지 않은 조합이에요. 레시피 힌트를 확인해 보세요.'
                      : result.reason === 'already_done'
                        ? '이미 만들어 본 스프예요. 각 레시피는 한 번만 가능해요.'
                        : '재료가 부족해요. 미션으로 재료를 모아 주세요.';
            Alert.alert('스프 만들기', message);
            return;
        }
        setSlots(emptySlots());
        onSoupMade(result.recipe.id);
    };

    return (
        <Screen scrollable contentCentered>
            <Top
                title={<Top.TitleParagraph size={22}>재료</Top.TitleParagraph>}
                subtitle2={
                    <Top.SubtitleParagraph>재료를 골라 냄비에 넣어 보세요.</Top.SubtitleParagraph>
                }
            />
            <IngredientSlotBar slots={slots} onPressSlot={handlePressSlot} />
            <Txt typography="t7" color="grey600" style={styles.hint}>
                칸을 탭하면 재료를 빼요. 네 칸이 차면 스프를 끓일 수 있어요.
            </Txt>
            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
                {INGREDIENTS.map((item) => {
                    const owned = state.ingredientInventory[item.id] ?? 0;
                    const inSlots = slots.filter((s) => s === item.id).length;
                    const available = owned - inSlots;
                    const disabled = available <= 0;
                    return (
                        <ListRow
                            key={item.id}
                            onPress={disabled ? undefined : () => handlePressIngredient(item.id)}
                            contents={
                                <ListRow.Texts
                                    type="2RowTypeA"
                                    top={`${item.emoji} ${item.name}`}
                                    topProps={{ fontWeight: 'bold' }}
                                    bottom={disabled ? '보유 없음' : `보유 ${available}개`}
                                />
                            }
                            right={
                                !disabled ? (
                                    <ListRow.RightTexts type="1RowTypeA" top="넣기" topProps={{ color: 'blue500' }} />
                                ) : undefined
                            }
                        />
                    );
                })}
            </ScrollView>
            <View style={styles.cta}>
                <Button
                    size="large"
                    type="primary"
                    display="block"
                    disabled={!allFilled}
                    onPress={() => void handleBrew()}
                >
                    스프 만들기
                </Button>
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    hint: {
        textAlign: 'center',
        marginBottom: 12,
    },
    list: {
        width: '100%',
        maxHeight: 320,
    },
    cta: {
        width: '100%',
        marginTop: 16,
    },
});
