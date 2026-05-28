import { getHiddenRecipes, getWeeklyRecipes, recipeIngredientCount } from '@api/mock/recipes';
import { getIngredientById } from '@api/mock/ingredients';
import { ListRow, Top, Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import { useUser } from '../user/UserProvider';
import { Screen } from '../../shared/ui/Screen';
import { colors } from '../../shared/theme/colors';

export function RecipesScreen() {
    const { state } = useUser();
    const weekly = getWeeklyRecipes();
    const hidden = getHiddenRecipes();

    return (
        <Screen scrollable contentCentered>
            <Top
                title={<Top.TitleParagraph size={22}>레시피</Top.TitleParagraph>}
                subtitle2={
                    <Top.SubtitleParagraph>이번 주 레시피는 매주 바뀌어요.</Top.SubtitleParagraph>
                }
            />
            <Txt typography="t5" fontWeight="semibold" style={styles.section}>
                이번주 레시피
            </Txt>
            {weekly.map((recipe) => {
                const done = state.completedRecipeIds.includes(recipe.id);
                const ingredientLine = recipe.ingredientIds
                    .map((id) => getIngredientById(id)?.emoji ?? id)
                    .join(' ');
                return (
                    <ListRow
                        key={recipe.id}
                        contents={
                            <ListRow.Texts
                                type="2RowTypeA"
                                top={recipe.name}
                                topProps={{ fontWeight: 'bold' }}
                                bottom={
                                    done
                                        ? `완료 · 에코잼 +${recipe.ecoJamReward ?? 0}`
                                        : `재료 ${recipeIngredientCount(recipe)}개 ${ingredientLine} · 에코잼 +${recipe.ecoJamReward ?? 0}`
                                }
                            />
                        }
                        right={
                            done ? (
                                <ListRow.RightTexts type="1RowTypeA" top="완료" topProps={{ color: 'green500' }} />
                            ) : undefined
                        }
                    />
                );
            })}
            <Txt typography="t5" fontWeight="semibold" style={styles.section}>
                히든 레시피
            </Txt>
            {hidden.map((recipe) => {
                const done = state.completedRecipeIds.includes(recipe.id);
                const unlocked = done;
                return (
                    <ListRow
                        key={recipe.id}
                        contents={
                            <ListRow.Texts
                                type="2RowTypeA"
                                top={unlocked ? recipe.name : '???'}
                                topProps={{ fontWeight: 'bold' }}
                                bottom={
                                    unlocked
                                        ? `${recipe.realRewardLabel ?? '실물 리워드'} · 완료`
                                        : '재료 4개 · 조합을 맞추면 공개돼요. 한 번만 만들 수 있어요.'
                                }
                            />
                        }
                        right={
                            done ? (
                                <ListRow.RightTexts type="1RowTypeA" top="완료" topProps={{ color: 'green500' }} />
                            ) : (
                                <ListRow.RightTexts type="1RowTypeA" top="비밀" topProps={{ color: 'grey500' }} />
                            )
                        }
                    />
                );
            })}
            <View style={styles.note}>
                <Txt typography="t7" color="grey600" style={styles.noteText}>
                    모든 레시피는 한 번만 만들 수 있어요.
                </Txt>
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
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
