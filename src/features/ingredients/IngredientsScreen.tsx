import { INGREDIENTS } from '@api/mock';
import {
    BREW_SLOT_MAX,
    getFilledIngredientIds,
    isValidBrewFillCount,
} from '@api/mock/recipes';
import { Button, ListRow, Top, Txt } from '@toss/tds-react-native';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { getBrewFailureMessage } from '../../shared/feedback/messages';
import { useAppToast } from '../../shared/feedback/useAppToast';
import { useUser } from '../user/UserProvider';
import { IngredientSlotBar } from '../../shared/ui/IngredientSlotBar';
import { Screen } from '../../shared/ui/Screen';
import type { SoupBrewOutcome } from '../soup/soupRewardLogic';

type IngredientsScreenProps = {
    onSoupMade: (recipeId: string, outcome: SoupBrewOutcome) => void;
};

function emptySlots(): (string | null)[] {
    return Array.from({ length: BREW_SLOT_MAX }, () => null);
}

export function IngredientsScreen({ onSoupMade }: IngredientsScreenProps) {
    const { state, brewSoup } = useUser();
    const { showError } = useAppToast();
    const [slots, setSlots] = useState<(string | null)[]>(emptySlots);
    const [brewing, setBrewing] = useState(false);

    const filledCount = getFilledIngredientIds(slots).length;
    const canBrew = isValidBrewFillCount(filledCount) && !brewing;

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
        if (!canBrew) {
            return;
        }
        setBrewing(true);
        try {
            const result = await brewSoup(slots);
            if (!result.ok) {
                showError(getBrewFailureMessage(result.reason));
                return;
            }
            setSlots(emptySlots());
            onSoupMade(result.recipe.id, result.outcome);
        } finally {
            setBrewing(false);
        }
    };

    return (
        <Screen scrollable contentCentered>
            <Top
                title={<Top.TitleParagraph size={22}>제작</Top.TitleParagraph>}
                subtitle2={
                    <Top.SubtitleParagraph>재료를 골라 냄비에 넣어 스프를 만들어요.</Top.SubtitleParagraph>
                }
            />
            <IngredientSlotBar slots={slots} onPressSlot={handlePressSlot} />
            <Txt typography="t7" color="grey600" style={styles.hint}>
                일반은 앞 3칸만, 히든은 네 칸을 채워요. 칸을 탭하면 재료를 빼요.
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
                                    <ListRow.RightTexts
                                        type="1RowTypeA"
                                        top="넣기"
                                        topProps={{ color: 'blue500' }}
                                    />
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
                    disabled={!canBrew}
                    loading={brewing}
                    onPress={() => void handleBrew()}
                    accessibilityLabel="스프 만들기"
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
