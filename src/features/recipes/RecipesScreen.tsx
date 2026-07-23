import {
    getBeginnerRecipes,
    getHiddenRecipes,
    getLegendaryRecipes,
    getWeeklyRecipes,
} from '@api/mock/recipes';
import type { Recipe } from '@api/mock/recipeTypes';
import {
    getRecipeSections,
    type RecipeSectionsView,
} from '@api/recipes';
import { Asset, Button, ListRow, Txt, frameShape } from '@toss/tds-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    type LayoutChangeEvent,
    type NativeScrollEvent,
    type NativeSyntheticEvent,
    Pressable,
    ScrollView,
    StyleSheet,
    useWindowDimensions,
    View,
} from 'react-native';
import {
    RECIPE_LIST_GUIDE_LINES,
    RECIPE_LIST_GUIDE_TITLE,
    SOUP_HIDDEN_PROBABILITY_LINES,
    SOUP_HIDDEN_PROBABILITY_TITLE,
    SOUP_WEEKLY_PROBABILITY_LINES,
    SOUP_WEEKLY_PROBABILITY_TITLE,
} from '../../shared/constants/probabilityInfo';
import { ECO_JAM_HIDDEN_RECIPE_UNLOCK_COST } from '../../shared/constants/ecoJamPolicy';
import { getSoupImageSource, hasSoupImage } from '../../shared/constants/soupAssets';
import { useAppToast } from '../../shared/feedback/useAppToast';
import { ProbabilityInfoRow } from '../../shared/ui/ProbabilityInfoRow';
import { BrandListRowImage } from '../../shared/ui/BrandListRowImage';
import { RecipeIngredientIcons } from '../../shared/ui/RecipeIngredientIcons';
import { TDS_ICON } from '../../shared/constants/tdsAssets';
import { useUser } from '../user/UserProvider';
import { RecipeListRowShell } from './RecipeCompletedStamp';
import { colors } from '../../shared/theme/colors';

const HIDDEN_LOCKED_MESSAGE =
    '히든 레시피는 아직 밝혀지지 않았어요. 조합을 맞추거나 에코잼으로 랜덤 해금할 수 있어요.';
const LEGENDARY_LOCKED_MESSAGE = '전설 레시피는 아직 밝혀지지 않았어요. 조합을 맞추면 공개돼요.';
const SCROLL_BOTTOM_THRESHOLD = 24;
export const BODY_CONTENT_PADDING_BOTTOM = 28;

export const HIDDEN_RECIPE_ALL_UNLOCKED_TOAST = '히든 레시피를 모두 열었어요.';

export function canRecipeListScrollMore({
    contentHeight,
    viewportHeight,
    scrollY,
    contentPaddingBottom,
    threshold,
}: {
    contentHeight: number;
    viewportHeight: number;
    scrollY: number;
    contentPaddingBottom: number;
    threshold: number;
}): boolean {
    const recipeContentHeight = Math.max(0, contentHeight - contentPaddingBottom);
    return (
        recipeContentHeight > viewportHeight + threshold &&
        scrollY + viewportHeight < recipeContentHeight - threshold
    );
}

/** 히든 레시피 랜덤 해금 버튼 문구 — 완료/해금 중/기본 상태별 순수 계산 */
export function hiddenRecipeUnlockButtonLabel({
    hiddenLockedCount,
    unlockLoading,
    unlockCost,
}: {
    hiddenLockedCount: number;
    unlockLoading: boolean;
    unlockCost: number;
}): string {
    if (hiddenLockedCount === 0) {
        return '히든 레시피 모두 해금됨';
    }
    if (unlockLoading) {
        return '해금 중…';
    }
    return `히든 레시피 랜덤 해금 · 에코잼 ${unlockCost}`;
}

/** 스프는 재료보다 크게 — 기준의 1.5배 (작은 폰 ~84, 일반 ~102, 넓은 기기 ~120) */
function recipeSoupThumbSize(windowWidth: number): number {
    return Math.round(Math.min(120, Math.max(84, windowWidth * 0.27)));
}

type RecipeTabId = 'today' | 'beginner' | 'hidden' | 'legendary';

const RECIPE_TABS: { id: RecipeTabId; label: string }[] = [
    { id: 'beginner', label: '입문' },
    { id: 'today', label: '일반' },
    { id: 'hidden', label: '히든' },
    { id: 'legendary', label: '전설' },
];

function secretRecipeBottom(kind: 'hidden' | 'legendary'): string {
    if (kind === 'legendary') {
        return '레시피북에 이름도 없대요';
    }
    return '조합을 맞추거나 에코잼으로 해금하면 공개돼요';
}

type RecipeSectionProps = {
    recipes: Recipe[];
    completedRecipeIds: string[];
    unlockedRecipeIds: string[];
    kind?: 'public' | 'hidden' | 'legendary';
    onLockedPress?: () => void;
};

function RecipeList({
    recipes,
    completedRecipeIds,
    unlockedRecipeIds,
    kind = 'public',
    onLockedPress,
    soupThumbSize,
}: RecipeSectionProps & { soupThumbSize: number }) {
    return (
        <View>
            {recipes.map((recipe) => {
                const done = completedRecipeIds.includes(recipe.id);
                const unlocked =
                    recipe.recipeVisible != null
                        ? recipe.recipeVisible
                        : kind === 'public' ||
                          done ||
                          unlockedRecipeIds.includes(recipe.id);
                const showSoupArt = unlocked && hasSoupImage(recipe.id);
                return (
                    <RecipeListRowShell key={recipe.id} done={done}>
                        <ListRow
                            onPress={unlocked ? undefined : onLockedPress}
                            left={
                                showSoupArt ? (
                                    <BrandListRowImage
                                        source={getSoupImageSource(recipe.id)}
                                        size={soupThumbSize}
                                    />
                                ) : (
                                    <ListRow.Icon
                                        name={unlocked ? TDS_ICON.soupBowl : TDS_ICON.missionLock}
                                    />
                                )
                            }
                            contents={
                                <View style={styles.recipeContents}>
                                    {unlocked ? (
                                        <>
                                            <ListRow.Texts
                                                type="1RowTypeA"
                                                top={recipe.name}
                                                topProps={{ fontWeight: 'bold' }}
                                            />
                                            <RecipeIngredientIcons ingredientIds={recipe.ingredientIds} />
                                        </>
                                    ) : (
                                        <ListRow.Texts
                                            type="2RowTypeA"
                                            top="???"
                                            topProps={{ fontWeight: 'bold' }}
                                            bottom={secretRecipeBottom(
                                                kind === 'legendary' ? 'legendary' : 'hidden',
                                            )}
                                        />
                                    )}
                                </View>
                            }
                            right={
                                unlocked ? undefined : (
                                    <ListRow.RightTexts
                                        type="1RowTypeA"
                                        top="???"
                                        topProps={{ color: 'grey500' }}
                                    />
                                )
                            }
                        />
                    </RecipeListRowShell>
                );
            })}
        </View>
    );
}

export function RecipesScreen() {
    const { state, unlockRandomHiddenRecipe } = useUser();
    const { show, showSuccess, showError } = useAppToast();
    const { width: windowWidth } = useWindowDimensions();
    const soupThumbSize = recipeSoupThumbSize(windowWidth);
    const [tab, setTab] = useState<RecipeTabId>('beginner');
    const [unlockLoading, setUnlockLoading] = useState(false);
    const [viewportHeight, setViewportHeight] = useState(0);
    const [contentHeight, setContentHeight] = useState(0);
    const [scrollY, setScrollY] = useState(0);
    const [beSections, setBeSections] = useState<RecipeSectionsView | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const sections = await getRecipeSections();
                if (!cancelled && sections != null) {
                    setBeSections(sections);
                }
            } catch {
                // mock getters 유지
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const weekly = beSections?.weekly ?? getWeeklyRecipes();
    const beginner = beSections?.beginner ?? getBeginnerRecipes();
    const hidden = beSections?.hidden ?? getHiddenRecipes();
    const legendary = beSections?.legendary ?? getLegendaryRecipes();
    const hiddenLockedCount = hidden.filter((recipe) => {
        if (recipe.recipeVisible != null) {
            return !recipe.recipeVisible;
        }
        return (
            !state.completedRecipeIds.includes(recipe.id) &&
            !state.unlockedRecipeIds.includes(recipe.id)
        );
    }).length;

    const listRecipes = useMemo(() => {
        switch (tab) {
            case 'today':
                return weekly;
            case 'beginner':
                return beginner;
            case 'hidden':
                return hidden;
            case 'legendary':
                return legendary;
        }
    }, [beginner, hidden, legendary, tab, weekly]);

    const listKind: 'public' | 'hidden' | 'legendary' =
        tab === 'hidden' ? 'hidden' : tab === 'legendary' ? 'legendary' : 'public';

    const showWeeklyProb = tab === 'today' || tab === 'beginner';
    const showSecretProb = tab === 'hidden' || tab === 'legendary';

    const canScrollMore = canRecipeListScrollMore({
        contentHeight,
        viewportHeight,
        scrollY,
        contentPaddingBottom: BODY_CONTENT_PADDING_BOTTOM,
        threshold: SCROLL_BOTTOM_THRESHOLD,
    });

    const onBodyLayout = useCallback((event: LayoutChangeEvent) => {
        setViewportHeight(event.nativeEvent.layout.height);
    }, []);

    const onContentSizeChange = useCallback((_w: number, height: number) => {
        setContentHeight(height);
    }, []);

    const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        setScrollY(event.nativeEvent.contentOffset.y);
    }, []);

    const onPressTab = useCallback((next: RecipeTabId) => {
        setTab(next);
        setScrollY(0);
    }, []);

    return (
        <View style={styles.root}>
            <View style={styles.header}>
                <Txt typography="t6" color="grey600">
                    카테고리를 골라 레시피를 확인해요.
                </Txt>
                <View style={styles.guideRow}>
                    <ProbabilityInfoRow
                        label="레시피 안내"
                        title={RECIPE_LIST_GUIDE_TITLE}
                        lines={RECIPE_LIST_GUIDE_LINES}
                    />
                </View>
                <View style={styles.tabs} accessibilityRole="tablist">
                    {RECIPE_TABS.map((item) => {
                        const selected = tab === item.id;
                        return (
                            <Pressable
                                key={item.id}
                                testID={`recipe-tab-${item.id}`}
                                onPress={() => onPressTab(item.id)}
                                style={[styles.tab, selected ? styles.tabSelected : undefined]}
                                accessibilityRole="tab"
                                accessibilityState={{ selected }}
                            >
                                <Txt
                                    typography="t7"
                                    fontWeight={selected ? 'bold' : 'semibold'}
                                    style={selected ? styles.tabLabelSelected : styles.tabLabel}
                                >
                                    {item.label}
                                </Txt>
                            </Pressable>
                        );
                    })}
                </View>
                {showWeeklyProb ? (
                    <View style={styles.probHeader}>
                        <ProbabilityInfoRow
                            label="스프 보상 확률"
                            title={SOUP_WEEKLY_PROBABILITY_TITLE}
                            lines={SOUP_WEEKLY_PROBABILITY_LINES}
                        />
                    </View>
                ) : null}
                {showSecretProb ? (
                    <View style={styles.probHeader}>
                        <ProbabilityInfoRow
                            label="히든·전설 확률"
                            title={SOUP_HIDDEN_PROBABILITY_TITLE}
                            lines={SOUP_HIDDEN_PROBABILITY_LINES}
                        />
                    </View>
                ) : null}
            </View>
            <View style={styles.bodyWrap} onLayout={onBodyLayout}>
                <ScrollView
                    style={styles.body}
                    contentContainerStyle={styles.bodyContent}
                    showsVerticalScrollIndicator={false}
                    onScroll={onScroll}
                    scrollEventThrottle={16}
                    onContentSizeChange={onContentSizeChange}
                >
                    <RecipeList
                        recipes={listRecipes}
                        completedRecipeIds={state.completedRecipeIds}
                        unlockedRecipeIds={state.unlockedRecipeIds}
                        kind={listKind}
                        soupThumbSize={soupThumbSize}
                        onLockedPress={() =>
                            show(
                                tab === 'legendary'
                                    ? LEGENDARY_LOCKED_MESSAGE
                                    : HIDDEN_LOCKED_MESSAGE,
                            )
                        }
                    />
                    {tab === 'hidden' && hiddenLockedCount > 0 ? (
                        <View style={styles.unlockWrap} testID="recipe-hidden-unlock-wrap">
                            <Button
                                size="large"
                                type="primary"
                                display="block"
                                disabled={unlockLoading || hiddenLockedCount === 0}
                                onPress={() => {
                                    void (async () => {
                                        setUnlockLoading(true);
                                        try {
                                            const result = await unlockRandomHiddenRecipe();
                                            if (!result.ok) {
                                                if (result.reason === 'insufficient_eco_jam') {
                                                    showError(
                                                        `에코잼이 부족해요. (필요: ${ECO_JAM_HIDDEN_RECIPE_UNLOCK_COST}개)`,
                                                    );
                                                    return;
                                                }
                                                if (result.reason === 'all_unlocked') {
                                                    show(HIDDEN_RECIPE_ALL_UNLOCKED_TOAST);
                                                    return;
                                                }
                                                showError('지금은 해금할 수 없어요.');
                                                return;
                                            }
                                            showSuccess(
                                                `「${result.recipeName}」 레시피를 열었어요!`,
                                            );
                                        } finally {
                                            setUnlockLoading(false);
                                        }
                                    })();
                                }}
                            >
                                {hiddenRecipeUnlockButtonLabel({
                                    hiddenLockedCount,
                                    unlockLoading,
                                    unlockCost: ECO_JAM_HIDDEN_RECIPE_UNLOCK_COST,
                                })}
                            </Button>
                        </View>
                    ) : null}
                </ScrollView>
                {canScrollMore ? (
                    <View
                        style={styles.scrollCue}
                        pointerEvents="none"
                        accessibilityElementsHidden
                        importantForAccessibility="no-hide-descendants"
                    >
                        <View style={styles.scrollFade} />
                        <View style={styles.scrollArrow}>
                            <Asset.Icon
                                name="icon-arrow-down-mono"
                                frameShape={frameShape.CleanW24}
                                color={colors.primary}
                                accessibilityLabel="아래로 스크롤"
                            />
                        </View>
                    </View>
                ) : null}
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
    guideRow: {
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    tabs: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 8,
        marginBottom: 4,
    },
    tab: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
    tabSelected: {
        backgroundColor: colors.primaryLight,
        borderColor: colors.primary,
    },
    tabLabel: {
        color: colors.textSecondary,
    },
    tabLabelSelected: {
        color: colors.primaryDark,
    },
    probHeader: {
        width: '100%',
        marginTop: 4,
        marginBottom: 4,
        alignItems: 'flex-start',
    },
    body: {
        flex: 1,
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
    },
    bodyContent: {
        paddingBottom: BODY_CONTENT_PADDING_BOTTOM,
    },
    bodyWrap: {
        flex: 1,
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
        position: 'relative',
    },
    scrollCue: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: 28,
    },
    scrollFade: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.background,
        opacity: 0.72,
    },
    scrollArrow: {
        marginBottom: 2,
        zIndex: 1,
        transform: [{ scale: 0.75 }],
    },
    unlockWrap: {
        marginTop: 12,
        marginBottom: 16,
    },
    recipeContents: {
        flex: 1,
        justifyContent: 'center',
    },
});
