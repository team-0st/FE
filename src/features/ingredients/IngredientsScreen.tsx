import { INGREDIENTS } from '@api/mock';
import {
    BREW_SLOT_MAX,
    findMatchingRecipe,
    getFilledIngredientIds,
    getRecommendedRecipes,
    hasAffordableSecretRecipes,
    isValidBrewFillCount,
    recipeToSlots,
    recommendationTitle,
} from '@api/mock/recipes';
import type { SoupCraftResponse } from '@api/notion/types';
import { Button, ListRow, Top, Txt } from '@toss/tds-react-native';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
    RECIPE_RECOMMEND_INFO_LINES,
    RECIPE_RECOMMEND_INFO_TITLE,
    SOUP_BREW_PROBABILITY_LINES,
    SOUP_BREW_PROBABILITY_TITLE,
} from '../../shared/constants/probabilityInfo';
import { HOME_DECOR } from '../../shared/constants/homeDecorAssets';
import { getSoupImageSource, hasSoupImage } from '../../shared/constants/soupAssets';
import { TDS_ICON } from '../../shared/constants/tdsAssets';
import { getBrewFailureMessage } from '../../shared/feedback/messages';
import { useAppToast } from '../../shared/feedback/useAppToast';
import { BrandEmojiImage } from '../../shared/ui/BrandEmojiImage';
import { BrandListRowImage } from '../../shared/ui/BrandListRowImage';
import { IngredientSlotBar } from '../../shared/ui/IngredientSlotBar';
import { ProbabilityInfoButton } from '../../shared/ui/ProbabilityInfoButton';
import { ProbabilityInfoRow } from '../../shared/ui/ProbabilityInfoRow';
import { RecipeIngredientIcons } from '../../shared/ui/RecipeIngredientIcons';
import {
    PREVIEW_VISIBLE_ROWS,
    ScrollPreviewSection,
} from '../../shared/ui/ScrollPreviewSection';
import { colors } from '../../shared/theme/colors';
import { ProfileListModal } from '../profile/ProfileListSection';
import { useUser } from '../user/UserProvider';

/** 추천 행: 스프 썸네일 확대 + 재료 아이콘·라벨 */
const RECOMMEND_SOUP_SIZE = 80;
const RECOMMEND_INGREDIENT_SIZE = 26;
const RECOMMEND_ROW_HEIGHT = 120;

type IngredientsScreenProps = {
    onSoupMade: (recipeId: string, craft: SoupCraftResponse) => void;
};

function emptySlots(): (string | null)[] {
    return Array.from({ length: BREW_SLOT_MAX }, () => null);
}

function brewStatusMessage(filledCount: number, matchedLabel: string | null): string {
    if (matchedLabel != null) {
        return matchedLabel;
    }
    if (isValidBrewFillCount(filledCount)) {
        return '조합이 맞는지 확인해 보세요.';
    }
    if (filledCount === 1) {
        return '재료를 1개 더 넣으면 만들 수 있어요.';
    }
    return '재료를 2개 넣으면 만들 수 있어요.';
}

export function IngredientsScreen({ onSoupMade }: IngredientsScreenProps) {
    const { state, brewSoup } = useUser();
    const { showError } = useAppToast();
    const [slots, setSlots] = useState<(string | null)[]>(emptySlots);
    const [brewing, setBrewing] = useState(false);
    const [ownedExpanded, setOwnedExpanded] = useState(false);

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
                            {'재료를 골라 냄비에 넣어요.\n조합이 맞으면 스프가 완성돼요.'}
                        </Top.SubtitleParagraph>
                    }
                />
                <IngredientSlotBar
                    slots={slots}
                    onPressSlot={handlePressSlot}
                    filledCount={filledCount}
                    onClearAll={() => setSlots(emptySlots())}
                />
                <View style={styles.probRow}>
                    <ProbabilityInfoRow
                        label="제작 안내"
                        title={SOUP_BREW_PROBABILITY_TITLE}
                        lines={SOUP_BREW_PROBABILITY_LINES}
                    />
                </View>
                <View style={styles.recommendSection}>
                    {recommendedRecipes.length === 0 ? (
                        <Txt typography="t7" color="grey600">
                            지금 만들 수 있는 입문·이번주 조합이 없어요.
                        </Txt>
                    ) : (
                        <ScrollPreviewSection
                            title="추천 조합"
                            titleExtra={
                                <ProbabilityInfoButton
                                    title={RECIPE_RECOMMEND_INFO_TITLE}
                                    lines={RECIPE_RECOMMEND_INFO_LINES}
                                    footnote={null}
                                />
                            }
                            itemCount={recommendedRecipes.length}
                            rowHeight={RECOMMEND_ROW_HEIGHT}
                        >
                            {recommendedRecipes.map((recipe) => {
                                return (
                                <ListRow
                                    key={recipe.id}
                                    onPress={() => handleApplyRecommendation(recipe.id)}
                                    left={
                                        hasSoupImage(recipe.id) ? (
                                            <BrandListRowImage
                                                source={getSoupImageSource(recipe.id)}
                                                size={RECOMMEND_SOUP_SIZE}
                                            />
                                        ) : (
                                            <ListRow.Icon name={TDS_ICON.soupBowl} />
                                        )
                                    }
                                    contents={
                                        <View style={styles.recommendContents}>
                                            <ListRow.Texts
                                                type="1RowTypeA"
                                                top={recommendationTitle(recipe)}
                                                topProps={{ fontWeight: 'bold' }}
                                            />
                                            <RecipeIngredientIcons
                                                ingredientIds={recipe.ingredientIds}
                                                size={RECOMMEND_INGREDIENT_SIZE}
                                            />
                                        </View>
                                    }
                                />
                                );
                            })}
                        </ScrollPreviewSection>
                    )}
                    {hasSecretAffordable ? (
                        <Txt typography="t7" color="blue500" style={styles.secretHint}>
                            {'재료가 충분한 비밀 레시피가 있어요.\n직접 넣어 조합해 보세요.'}
                        </Txt>
                    ) : null}
                </View>
                {ownedIngredients.length === 0 ? (
                    <>
                        <View style={styles.ownedTitleRow}>
                            <Txt typography="t5" fontWeight="semibold" style={styles.sectionTitle}>
                                보유 재료
                            </Txt>
                            <BrandEmojiImage
                                source={HOME_DECOR.bannerVeggies}
                                size={36}
                                containerStyle={styles.ownedTitleArt}
                                accessibilityLabel=""
                            />
                        </View>
                        <Txt typography="t7" color="grey600">
                            보유한 재료가 없어요.
                        </Txt>
                    </>
                ) : (
                    <>
                        <ScrollPreviewSection
                            title="보유 재료"
                            titleExtra={
                                <BrandEmojiImage
                                    source={HOME_DECOR.bannerVeggies}
                                    size={36}
                                    containerStyle={styles.ownedTitleArt}
                                    accessibilityLabel=""
                                />
                            }
                            titleAction={
                                ownedIngredients.length > PREVIEW_VISIBLE_ROWS ? (
                                    <Txt
                                        typography="t7"
                                        color="blue500"
                                        onPress={() => setOwnedExpanded(true)}
                                        accessibilityRole="button"
                                        accessibilityLabel="보유 재료 모두 보기"
                                    >
                                        모두 보기
                                    </Txt>
                                ) : null
                            }
                            itemCount={ownedIngredients.length}
                        >
                            {ownedIngredients.map((item) => {
                                const owned = state.ingredientInventory[item.id] ?? 0;
                                const inSlots = slots.filter((s) => s === item.id).length;
                                const available = owned - inSlots;
                                const disabled = available <= 0;
                                return (
                                    <ListRow
                                        key={item.id}
                                        onPress={
                                            disabled
                                                ? undefined
                                                : () => handlePressIngredient(item.id)
                                        }
                                        left={
                                            item.imageSource != null ? (
                                                <BrandListRowImage source={item.imageSource} />
                                            ) : undefined
                                        }
                                        contents={
                                            <ListRow.Texts
                                                type="2RowTypeA"
                                                top={item.name}
                                                topProps={{ fontWeight: 'bold' }}
                                                bottom={
                                                    disabled
                                                        ? '슬롯에 모두 사용 중'
                                                        : `보유 ${available}개`
                                                }
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
                        <ProfileListModal
                            visible={ownedExpanded}
                            title="보유 재료"
                            emptyMessage="보유한 재료가 없어요."
                            itemCount={ownedIngredients.length}
                            onClose={() => setOwnedExpanded(false)}
                        >
                            {ownedIngredients.map((item) => {
                                const owned = state.ingredientInventory[item.id] ?? 0;
                                const inSlots = slots.filter((s) => s === item.id).length;
                                const available = owned - inSlots;
                                const disabled = available <= 0;
                                return (
                                    <ListRow
                                        key={`modal-${item.id}`}
                                        onPress={
                                            disabled
                                                ? undefined
                                                : () => handlePressIngredient(item.id)
                                        }
                                        left={
                                            item.imageSource != null ? (
                                                <BrandListRowImage source={item.imageSource} />
                                            ) : undefined
                                        }
                                        contents={
                                            <ListRow.Texts
                                                type="2RowTypeA"
                                                top={item.name}
                                                topProps={{ fontWeight: 'bold' }}
                                                bottom={
                                                    disabled
                                                        ? '슬롯에 모두 사용 중'
                                                        : `보유 ${available}개`
                                                }
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
                        </ProfileListModal>
                    </>
                )}
            </ScrollView>
            <View style={styles.cta}>
                <Txt typography="t7" color="grey600" style={styles.brewStatus}>
                    {brewStatusMessage(filledCount, matchedLabel)}
                </Txt>
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
    recommendContents: {
        flex: 1,
        justifyContent: 'center',
    },
    secretHint: {
        marginTop: 8,
        textAlign: 'center',
    },
    ownedTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    sectionTitle: {
        marginBottom: 0,
    },
    ownedTitleArt: {
        marginRight: 0,
        opacity: 0.9,
    },
    probRow: {
        alignSelf: 'flex-start',
        marginBottom: 12,
    },
    brewStatus: {
        textAlign: 'center',
        marginBottom: 8,
    },
    cta: {
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 8,
        backgroundColor: colors.background,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.border,
    },
});
