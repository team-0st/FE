import { INGREDIENTS } from '@api/mock';
import {
    BREW_SLOT_MAX,
    findMatchingRecipe,
    getFilledIngredientIds,
    getRecommendedRecipes,
    hasAffordableSecretRecipes,
    isValidBrewFillCount,
    RECOMMEND_SECRET_RECIPE_NOTICE,
    recipeToSlots,
    recommendationSubtitle,
    recommendationTitle,
} from '@api/mock/recipes';
import type { SoupCraftResponse } from '@api/notion/types';
import { BottomCTA, Button, ListRow, Top, Txt } from '@toss/tds-react-native';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
    SOUP_BREW_PROBABILITY_LINES,
    SOUP_BREW_PROBABILITY_TITLE,
} from '../../shared/constants/probabilityInfo';
import { getSoupImageSource, hasSoupImage } from '../../shared/constants/soupAssets';
import { TDS_ICON } from '../../shared/constants/tdsAssets';
import { getBrewFailureMessage } from '../../shared/feedback/messages';
import { useAppToast } from '../../shared/feedback/useAppToast';
import { BrandListRowImage } from '../../shared/ui/BrandListRowImage';
import { IngredientSlotBar } from '../../shared/ui/IngredientSlotBar';
import { ProbabilityInfoRow } from '../../shared/ui/ProbabilityInfoRow';
import { ScrollPreviewSection } from '../../shared/ui/ScrollPreviewSection';
import { colors } from '../../shared/theme/colors';
import { useUser } from '../user/UserProvider';

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

    const recommendedRecipes = useMemo(
        () => getRecommendedRecipes(state.ingredientInventory, state.completedRecipeIds),
        [state.completedRecipeIds, state.ingredientInventory],
    );

    const hasSecretAffordable = useMemo(
        () => hasAffordableSecretRecipes(state.ingredientInventory, state.completedRecipeIds),
        [state.completedRecipeIds, state.ingredientInventory],
    );

    const ownedIngredients = useMemo(
        () => INGREDIENTS.filter((item) => (state.ingredientInventory[item.id] ?? 0) > 0),
        [state.ingredientInventory],
    );

    const handleApplyRecommendation = useCallback(
        (recipeId: string) => {
            const recipe = recommendedRecipes.find((item) => item.id === recipeId);
            if (recipe == null) {
                return;
            }
            setSlots(recipeToSlots(recipe));
        },
        [recommendedRecipes],
    );

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
            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator>
                <Top
                    title={<Top.TitleParagraph size={22}>제작</Top.TitleParagraph>}
                    subtitle2={
                        <Top.SubtitleParagraph>
                            {'재료를 골라 냄비에 넣어요.\n스프를 만들어 보세요.'}
                        </Top.SubtitleParagraph>
                    }
                />
                <IngredientSlotBar slots={slots} onPressSlot={handlePressSlot} />
                <View style={styles.slotActions}>
                    <Button
                        size="medium"
                        type="dark"
                        style="weak"
                        display="block"
                        disabled={filledCount === 0}
                        onPress={() => setSlots(emptySlots())}
                        accessibilityLabel="냄비 재료 전부 비우기"
                    >
                        전부 비우기
                    </Button>
                </View>
                <View style={styles.recommendSection}>
                    <Txt typography="t7" color="grey600" style={styles.secretNotice}>
                        {RECOMMEND_SECRET_RECIPE_NOTICE}
                    </Txt>
                    {hasSecretAffordable ? (
                        <Txt typography="t7" color="blue500" style={styles.secretHint}>
                            재료가 충분한 비밀 레시피가 있어요. 직접 넣어 조합해 보세요.
                        </Txt>
                    ) : null}
                    {recommendedRecipes.length === 0 ? (
                        <Txt typography="t7" color="grey600">
                            {'지금 만들 수 있는 입문·이번주 조합이 없어요.\n미션으로 재료를 모아 보세요.'}
                        </Txt>
                    ) : (
                        <ScrollPreviewSection
                            title="추천 조합"
                            itemCount={recommendedRecipes.length}
                            hint={'보유 재료로 만들 수 있는\n입문·이번주 조합이에요.'}
                        >
                            {recommendedRecipes.map((recipe) => {
                                return (
                                <ListRow
                                    key={recipe.id}
                                    onPress={() => handleApplyRecommendation(recipe.id)}
                                    left={
                                        hasSoupImage(recipe.id) ? (
                                            <BrandListRowImage source={getSoupImageSource(recipe.id)} />
                                        ) : (
                                            <ListRow.Icon name={TDS_ICON.soupBowl} />
                                        )
                                    }
                                    contents={
                                        <ListRow.Texts
                                            type="2RowTypeA"
                                            top={recommendationTitle(recipe)}
                                            topProps={{ fontWeight: 'bold' }}
                                            bottom={recommendationSubtitle(recipe)}
                                        />
                                    }
                                    right={
                                        <ListRow.RightTexts
                                            type="1RowTypeA"
                                            top="넣기"
                                            topProps={{ color: 'blue500' }}
                                        />
                                    }
                                />
                                );
                            })}
                        </ScrollPreviewSection>
                    )}
                </View>
                <View style={styles.matchHintSlot}>
                    {matchedLabel != null ? (
                        <Txt typography="t6" color="blue500" style={styles.matchHint}>
                            {matchedLabel}
                        </Txt>
                    ) : null}
                </View>
                <Txt typography="t7" color="grey600" style={styles.hint}>
                    칸을 탭하면 재료를 빼요. 전부 비우기로 한 번에 뺄 수도 있어요.
                </Txt>
                <View style={styles.probRow}>
                    <ProbabilityInfoRow
                        label="제작 보상"
                        title={SOUP_BREW_PROBABILITY_TITLE}
                        lines={SOUP_BREW_PROBABILITY_LINES}
                    />
                </View>
                {ownedIngredients.length === 0 ? (
                    <>
                        <Txt typography="t6" fontWeight="semibold" style={styles.sectionTitle}>
                            보유 재료
                        </Txt>
                        <Txt typography="t7" color="grey600">
                            보유한 재료가 없어요. 미션으로 재료를 모아 보세요.
                        </Txt>
                    </>
                ) : (
                    <ScrollPreviewSection title="보유 재료" itemCount={ownedIngredients.length}>
                        {ownedIngredients.map((item) => {
                            const owned = state.ingredientInventory[item.id] ?? 0;
                            const inSlots = slots.filter((s) => s === item.id).length;
                            const available = owned - inSlots;
                            const disabled = available <= 0;
                            return (
                                <ListRow
                                    key={item.id}
                                    onPress={disabled ? undefined : () => handlePressIngredient(item.id)}
                                    left={
                                        item.imageSource != null ? (
                                            <BrandListRowImage source={item.imageSource} />
                                        ) : undefined
                                    }
                                    contents={
                                        <ListRow.Texts
                                            type="2RowTypeA"
                                            top={
                                                item.imageSource != null
                                                    ? item.name
                                                    : item.name
                                            }
                                            topProps={{ fontWeight: 'bold' }}
                                            bottom={disabled ? '슬롯에 모두 사용 중' : `보유 ${available}개`}
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
                    </ScrollPreviewSection>
                )}
            </ScrollView>
            <View style={styles.cta}>
                <BottomCTA.Single
                    size="large"
                    type="primary"
                    display="block"
                    disabled={!canBrew}
                    loading={brewing}
                    onPress={() => void handleBrew()}
                    accessibilityLabel="스프 만들기"
                >
                    스프 만들기
                </BottomCTA.Single>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 4,
        paddingBottom: 16,
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
    },
    recommendSection: {
        width: '100%',
        marginTop: 8,
        marginBottom: 4,
    },
    slotActions: {
        width: '100%',
        marginBottom: 4,
    },
    secretNotice: {
        marginBottom: 6,
    },
    secretHint: {
        marginBottom: 8,
    },
    sectionTitle: {
        marginBottom: 8,
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
        marginBottom: 12,
    },
    cta: {
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 16,
        backgroundColor: colors.background,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
});
