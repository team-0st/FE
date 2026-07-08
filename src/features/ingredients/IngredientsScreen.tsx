import { INGREDIENTS } from '@api/mock';
import {
    BREW_SLOT_MAX,
    findMatchingRecipe,
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
import type { SoupCraftResponse } from '@api/notion/types';
import {
    SOUP_BREW_PROBABILITY_LINES,
    SOUP_BREW_PROBABILITY_TITLE,
} from '../../shared/constants/probabilityInfo';
import { ProbabilityInfoRow } from '../../shared/ui/ProbabilityInfoRow';
import { colors } from '../../shared/theme/colors';

type IngredientsScreenProps = {
    onSoupMade: (recipeId: string, craft: SoupCraftResponse) => void;
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
    const matchedRecipe = isValidBrewFillCount(filledCount)
        ? findMatchingRecipe(slots, state.completedRecipeIds)
        : undefined;
    const matchedLabel =
        matchedRecipe == null
            ? null
            : matchedRecipe.kind === 'hidden' || matchedRecipe.kind === 'legendary'
              ? '비밀 레시피 조합이에요'
              : `${matchedRecipe.name} 조합이에요`;

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
            onSoupMade(result.recipe.id, result.craft);
        } finally {
            setBrewing(false);
        }
    };

    return (
        <View style={styles.root}>
            <View style={styles.header}>
                <Top
                    title={<Top.TitleParagraph size={22}>제작</Top.TitleParagraph>}
                    subtitle2={
                        <Top.SubtitleParagraph>재료를 골라 냄비에 넣어 스프를 만들어요.</Top.SubtitleParagraph>
                    }
                />
                <IngredientSlotBar slots={slots} onPressSlot={handlePressSlot} />
                <View style={styles.matchHintSlot}>
                    {matchedLabel != null ? (
                        <Txt typography="t6" color="blue500" style={styles.matchHint}>
                            {matchedLabel}
                        </Txt>
                    ) : null}
                </View>
                <Txt typography="t7" color="grey600" style={styles.hint}>
                    칸을 탭하면 재료를 빼요.
                </Txt>
                <View style={styles.probRow}>
                    <ProbabilityInfoRow
                        label="제작 보상"
                        title={SOUP_BREW_PROBABILITY_TITLE}
                        lines={SOUP_BREW_PROBABILITY_LINES}
                    />
                </View>
            </View>
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
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    header: {
        paddingTop: 8,
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
    },
    matchHintSlot: {
        minHeight: 28,
        justifyContent: 'center',
        marginBottom: 4,
    },
    matchHint: {
        textAlign: 'center',
        fontWeight: '600',
    },
    hint: {
        textAlign: 'center',
        marginBottom: 8,
    },
    probRow: {
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    list: {
        flex: 1,
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
    },
    cta: {
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
        marginTop: 8,
    },
});
