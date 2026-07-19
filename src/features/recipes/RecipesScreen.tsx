import {
    formatRecipeIngredients,
    getBeginnerRecipes,
    getHiddenRecipes,
    getLegendaryRecipes,
    getWeeklyRecipes,
} from '@api/mock/recipes';
import type { Recipe } from '@api/mock/recipeTypes';
import { Asset, ListRow, Top, Txt, frameShape } from '@toss/tds-react-native';
import { useCallback, useMemo, useState } from 'react';
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
    SOUP_HIDDEN_PROBABILITY_LINES,
    SOUP_HIDDEN_PROBABILITY_TITLE,
    SOUP_WEEKLY_PROBABILITY_LINES,
    SOUP_WEEKLY_PROBABILITY_TITLE,
} from '../../shared/constants/probabilityInfo';
import { getSoupImageSource, hasSoupImage } from '../../shared/constants/soupAssets';
import { useAppToast } from '../../shared/feedback/useAppToast';
import { ProbabilityInfoRow } from '../../shared/ui/ProbabilityInfoRow';
import { BrandListRowImage } from '../../shared/ui/BrandListRowImage';
import { RecipeIngredientIcons } from '../../shared/ui/RecipeIngredientIcons';
import { TDS_ICON } from '../../shared/constants/tdsAssets';
import { useUser } from '../user/UserProvider';
import { RecipeListRowShell } from './RecipeCompletedStamp';
import { colors } from '../../shared/theme/colors';

const HIDDEN_LOCKED_MESSAGE = '히든 레시피는 아직 밝혀지지 않았어요. 조합을 맞추면 공개돼요.';
const LEGENDARY_LOCKED_MESSAGE = '전설 레시피는 아직 밝혀지지 않았어요. 조합을 맞추면 공개돼요.';
const SCROLL_BOTTOM_THRESHOLD = 24;

/** 스프는 재료보다 크게 — 기준의 1.5배 (작은 폰 ~84, 일반 ~102, 넓은 기기 ~120) */
function recipeSoupThumbSize(windowWidth: number): number {
    return Math.round(Math.min(120, Math.max(84, windowWidth * 0.27)));
}

type RecipeTabId = 'today' | 'beginner' | 'hidden' | 'legendary';

const RECIPE_TABS: { id: RecipeTabId; label: string }[] = [
    { id: 'today', label: '이번주 레시피' },
    { id: 'beginner', label: '입문' },
    { id: 'hidden', label: '히든' },
    { id: 'legendary', label: '전설' },
];

function secretRecipeBottom(recipe: Recipe, kind: 'hidden' | 'legendary'): string {
    if (kind === 'legendary') {
        return '레시피북에 이름도 없대요';
    }
    return recipe.hintDrip ?? '조합을 맞추면 공개';
}

function unlockedSecretBottom(recipe: Recipe): string {
    const ingredients = formatRecipeIngredients(recipe);
    const reward = recipe.realRewardLabel;
    return reward != null ? `${ingredients} · ${reward}` : ingredients;
}

type RecipeSectionProps = {
    recipes: Recipe[];
    completedRecipeIds: string[];
    kind?: 'public' | 'hidden' | 'legendary';
    onLockedPress?: () => void;
};

function RecipeList({
    recipes,
    completedRecipeIds,
    kind = 'public',
    onLockedPress,
    soupThumbSize,
}: RecipeSectionProps & { soupThumbSize: number }) {
    return (
        <View>
            {recipes.map((recipe) => {
                const done = completedRecipeIds.includes(recipe.id);
                const unlocked = kind === 'public' || done;
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
                                    {kind === 'public' && unlocked ? (
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
                                            top={unlocked ? recipe.name : '???'}
                                            topProps={{ fontWeight: 'bold' }}
                                            bottom={
                                                unlocked
                                                    ? unlockedSecretBottom(recipe)
                                                    : secretRecipeBottom(recipe, kind === 'legendary' ? 'legendary' : 'hidden')
                                            }
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
    const { state } = useUser();
    const { show } = useAppToast();
    const { width: windowWidth } = useWindowDimensions();
    const soupThumbSize = recipeSoupThumbSize(windowWidth);
    const [tab, setTab] = useState<RecipeTabId>('today');
    const [viewportHeight, setViewportHeight] = useState(0);
    const [contentHeight, setContentHeight] = useState(0);
    const [scrollY, setScrollY] = useState(0);
    const weekly = getWeeklyRecipes();
    const beginner = getBeginnerRecipes();
    const hidden = getHiddenRecipes();
    const legendary = getLegendaryRecipes();

    const activeRecipes = useMemo(() => {
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

    const canScrollMore =
        contentHeight > viewportHeight + SCROLL_BOTTOM_THRESHOLD &&
        scrollY + viewportHeight < contentHeight - SCROLL_BOTTOM_THRESHOLD;

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
                <Top
                    title={<Top.TitleParagraph size={22}>레시피</Top.TitleParagraph>}
                    subtitle2={
                        <Top.SubtitleParagraph>
                            카테고리를 골라 레시피를 확인해요.
                        </Top.SubtitleParagraph>
                    }
                />
                <View style={styles.tabs}>
                    {RECIPE_TABS.map((item) => {
                        const selected = tab === item.id;
                        return (
                            <Pressable
                                key={item.id}
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
                    showsVerticalScrollIndicator={false}
                    onScroll={onScroll}
                    scrollEventThrottle={16}
                    onContentSizeChange={onContentSizeChange}
                >
                    <RecipeList
                        recipes={activeRecipes}
                        completedRecipeIds={state.completedRecipeIds}
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
                    <View style={styles.note}>
                        <Txt typography="t7" color="grey600" style={styles.noteText}>
                            {
                                '입문·이번주 레시피는 재료 조합이 공개돼요.\n히든·전설은 완성 후에만 확인할 수 있어요.\n모든 레시피는 한 번만 만들 수 있어요.'
                            }
                        </Txt>
                    </View>
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
    note: {
        marginTop: 8,
        marginBottom: 8,
        padding: 12,
        backgroundColor: colors.primaryLight,
        borderRadius: 12,
        width: '100%',
    },
    noteText: {
        textAlign: 'center',
    },
    recipeContents: {
        flex: 1,
        justifyContent: 'center',
    },
});
