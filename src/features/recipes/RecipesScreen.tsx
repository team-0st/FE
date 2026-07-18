import {
    formatRecipeIngredients,
    getBeginnerRecipes,
    getHiddenRecipes,
    getLegendaryRecipes,
    getWeeklyRecipes,
} from '@api/mock/recipes';
import type { Recipe } from '@api/mock/recipeTypes';
import { ListRow, Top, Txt } from '@toss/tds-react-native';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
    SOUP_HIDDEN_PROBABILITY_LINES,
    SOUP_HIDDEN_PROBABILITY_TITLE,
    SOUP_WEEKLY_PROBABILITY_LINES,
    SOUP_WEEKLY_PROBABILITY_TITLE,
} from '../../shared/constants/probabilityInfo';
import { useAppToast } from '../../shared/feedback/useAppToast';
import { ProbabilityInfoRow } from '../../shared/ui/ProbabilityInfoRow';
import { ScrollPreviewSection } from '../../shared/ui/ScrollPreviewSection';
import { TDS_ICON } from '../../shared/constants/tdsAssets';
import { useUser } from '../user/UserProvider';
import { RecipeListRowShell } from './RecipeCompletedStamp';
import { colors } from '../../shared/theme/colors';

const HIDDEN_LOCKED_MESSAGE = '히든 레시피는 아직 밝혀지지 않았어요. 조합을 맞추면 공개돼요.';
const LEGENDARY_LOCKED_MESSAGE = '전설 레시피는 아직 밝혀지지 않았어요. 조합을 맞추면 공개돼요.';

function publicRecipeBottom(recipe: Recipe): string {
    return formatRecipeIngredients(recipe);
}

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
    title: string;
    recipes: Recipe[];
    completedRecipeIds: string[];
    kind?: 'public' | 'hidden' | 'legendary';
    onLockedPress?: () => void;
};

function RecipeSection({
    title,
    recipes,
    completedRecipeIds,
    kind = 'public',
    onLockedPress,
}: RecipeSectionProps) {
    return (
        <ScrollPreviewSection title={title} itemCount={recipes.length}>
            {recipes.map((recipe) => {
                const done = completedRecipeIds.includes(recipe.id);
                const unlocked = kind === 'public' || done;
                return (
                    <RecipeListRowShell key={recipe.id} done={done}>
                        <ListRow
                            onPress={unlocked ? undefined : onLockedPress}
                            left={
                                <ListRow.Icon
                                    name={
                                        unlocked
                                            ? TDS_ICON.soupBowl
                                            : TDS_ICON.missionLock
                                    }
                                />
                            }
                            contents={
                                <ListRow.Texts
                                    type="2RowTypeA"
                                    top={unlocked ? recipe.name : '???'}
                                    topProps={{ fontWeight: 'bold' }}
                                    bottom={
                                        kind === 'public'
                                            ? publicRecipeBottom(recipe)
                                            : unlocked
                                              ? unlockedSecretBottom(recipe)
                                              : secretRecipeBottom(recipe, kind)
                                    }
                                />
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
        </ScrollPreviewSection>
    );
}

export function RecipesScreen() {
    const { state } = useUser();
    const { show } = useAppToast();
    const weekly = getWeeklyRecipes();
    const beginner = getBeginnerRecipes();
    const hidden = getHiddenRecipes();
    const legendary = getLegendaryRecipes();

    return (
        <View style={styles.root}>
            <View style={styles.header}>
                <Top
                    title={<Top.TitleParagraph size={22}>레시피</Top.TitleParagraph>}
                    subtitle2={
                        <Top.SubtitleParagraph>
                            입문·이번주 레시피는 재료 조합이 바로 보여요.
                        </Top.SubtitleParagraph>
                    }
                />
                <View style={styles.probHeader}>
                    <ProbabilityInfoRow
                        label="스프 보상 확률"
                        title={SOUP_WEEKLY_PROBABILITY_TITLE}
                        lines={SOUP_WEEKLY_PROBABILITY_LINES}
                    />
                </View>
            </View>
            <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
                <RecipeSection
                    title="입문 레시피"
                    recipes={beginner}
                    completedRecipeIds={state.completedRecipeIds}
                />
                <RecipeSection
                    title={`이번 주 레시피 (${weekly.length})`}
                    recipes={weekly}
                    completedRecipeIds={state.completedRecipeIds}
                />
                <View style={styles.probHeader}>
                    <ProbabilityInfoRow
                        label="히든·전설 확률"
                        title={SOUP_HIDDEN_PROBABILITY_TITLE}
                        lines={SOUP_HIDDEN_PROBABILITY_LINES}
                    />
                </View>
                <RecipeSection
                    title="히든 레시피"
                    recipes={hidden}
                    completedRecipeIds={state.completedRecipeIds}
                    kind="hidden"
                    onLockedPress={() => show(HIDDEN_LOCKED_MESSAGE)}
                />
                <RecipeSection
                    title="전설 레시피"
                    recipes={legendary}
                    completedRecipeIds={state.completedRecipeIds}
                    kind="legendary"
                    onLockedPress={() => show(LEGENDARY_LOCKED_MESSAGE)}
                />
                <View style={styles.note}>
                    <Txt typography="t7" color="grey600" style={styles.noteText}>
                        입문·이번주 레시피는 재료 조합이 공개돼요. 히든·전설은 완성 후에만 확인할 수 있어요. 모든
                        레시피는 한 번만 만들 수 있어요.
                    </Txt>
                </View>
            </ScrollView>
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
});
