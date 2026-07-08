import {
    formatRecipeIngredients,
    getBeginnerRecipes,
    getHiddenRecipes,
    getLegendaryRecipes,
    getWeeklyRecipes,
} from '@api/mock/recipes';
import type { Recipe } from '@api/mock/recipeTypes';
import { ListRow, Top, Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import {
    SOUP_HIDDEN_PROBABILITY_LINES,
    SOUP_HIDDEN_PROBABILITY_TITLE,
    SOUP_WEEKLY_PROBABILITY_LINES,
    SOUP_WEEKLY_PROBABILITY_TITLE,
} from '../../shared/constants/probabilityInfo';
import { useAppToast } from '../../shared/feedback/useAppToast';
import { ProbabilityInfoRow } from '../../shared/ui/ProbabilityInfoRow';
import { useUser } from '../user/UserProvider';
import { RecipeListRowShell } from './RecipeCompletedStamp';
import { Screen } from '../../shared/ui/Screen';
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

export function RecipesScreen() {
    const { state } = useUser();
    const { show } = useAppToast();
    const weekly = getWeeklyRecipes();
    const beginner = getBeginnerRecipes();
    const hidden = getHiddenRecipes();
    const legendary = getLegendaryRecipes();

    return (
        <Screen scrollable contentCentered>
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
            <Txt typography="t5" fontWeight="semibold" style={styles.section}>
                입문 스프
            </Txt>
            {beginner.map((recipe) => {
                const done = state.completedRecipeIds.includes(recipe.id);
                return (
                    <RecipeListRowShell key={recipe.id} done={done}>
                        <ListRow
                            contents={
                                <ListRow.Texts
                                    type="2RowTypeA"
                                    top={recipe.name}
                                    topProps={{ fontWeight: 'bold' }}
                                    bottom={publicRecipeBottom(recipe)}
                                />
                            }
                        />
                    </RecipeListRowShell>
                );
            })}
            <Txt typography="t5" fontWeight="semibold" style={styles.section}>
                이번주 레시피 ({weekly.length})
            </Txt>
            {weekly.map((recipe) => {
                const done = state.completedRecipeIds.includes(recipe.id);
                return (
                    <RecipeListRowShell key={recipe.id} done={done}>
                        <ListRow
                            contents={
                                <ListRow.Texts
                                    type="2RowTypeA"
                                    top={recipe.name}
                                    topProps={{ fontWeight: 'bold' }}
                                    bottom={publicRecipeBottom(recipe)}
                                />
                            }
                        />
                    </RecipeListRowShell>
                );
            })}
            <View style={styles.probHeader}>
                <ProbabilityInfoRow
                    label="히든·전설 확률"
                    title={SOUP_HIDDEN_PROBABILITY_TITLE}
                    lines={SOUP_HIDDEN_PROBABILITY_LINES}
                />
            </View>
            <Txt typography="t5" fontWeight="semibold" style={styles.section}>
                히든 레시피
            </Txt>
            {hidden.map((recipe) => {
                const done = state.completedRecipeIds.includes(recipe.id);
                const unlocked = done;
                return (
                    <RecipeListRowShell key={recipe.id} done={done}>
                        <ListRow
                            onPress={
                                unlocked
                                    ? undefined
                                    : () => {
                                          show(HIDDEN_LOCKED_MESSAGE);
                                      }
                            }
                            contents={
                                <ListRow.Texts
                                    type="2RowTypeA"
                                    top={unlocked ? recipe.name : '???'}
                                    topProps={{ fontWeight: 'bold' }}
                                    bottom={
                                        unlocked
                                            ? unlockedSecretBottom(recipe)
                                            : secretRecipeBottom(recipe, 'hidden')
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
            <Txt typography="t5" fontWeight="semibold" style={styles.section}>
                전설 레시피
            </Txt>
            {legendary.map((recipe) => {
                const done = state.completedRecipeIds.includes(recipe.id);
                const unlocked = done;
                return (
                    <RecipeListRowShell key={recipe.id} done={done}>
                        <ListRow
                            onPress={
                                unlocked
                                    ? undefined
                                    : () => {
                                          show(LEGENDARY_LOCKED_MESSAGE);
                                      }
                            }
                            contents={
                                <ListRow.Texts
                                    type="2RowTypeA"
                                    top={unlocked ? recipe.name : '???'}
                                    topProps={{ fontWeight: 'bold' }}
                                    bottom={
                                        unlocked
                                            ? unlockedSecretBottom(recipe)
                                            : secretRecipeBottom(recipe, 'legendary')
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
            <View style={styles.note}>
                <Txt typography="t7" color="grey600" style={styles.noteText}>
                    입문·이번주 레시피는 재료 조합이 공개돼요. 히든·전설은 완성 후에만 확인할 수 있어요. 모든
                    레시피는 한 번만 만들 수 있어요.
                </Txt>
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    probHeader: {
        width: '100%',
        marginTop: 8,
        marginBottom: 4,
        alignItems: 'flex-start',
    },
    section: {
        width: '100%',
        marginTop: 16,
        marginBottom: 8,
    },
    note: {
        marginTop: 20,
        padding: 12,
        backgroundColor: colors.primaryLight,
        borderRadius: 12,
        width: '100%',
    },
    noteText: {
        textAlign: 'center',
    },
});
