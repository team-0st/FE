import {
    getBeginnerRecipes,
    getHiddenRecipes,
    getLegendaryRecipes,
    getRecipeRewardSummary,
    getWeeklyRecipes,
} from '@api/mock/recipes';
import { ListRow, Top, Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import {
    SOUP_HIDDEN_PROBABILITY_LINES,
    SOUP_HIDDEN_PROBABILITY_TITLE,
    SOUP_WEEKLY_PROBABILITY_LINES,
    SOUP_WEEKLY_PROBABILITY_TITLE,
} from '../../shared/constants/probabilityInfo';
import { ProbabilityInfoRow } from '../../shared/ui/ProbabilityInfoRow';
import { useUser } from '../user/UserProvider';
import { Screen } from '../../shared/ui/Screen';
import { colors } from '../../shared/theme/colors';

export function RecipesScreen() {
    const { state } = useUser();
    const weekly = getWeeklyRecipes();
    const beginner = getBeginnerRecipes();
    const hidden = getHiddenRecipes();
    const legendary = getLegendaryRecipes();

    return (
        <Screen scrollable contentCentered>
            <Top
                title={<Top.TitleParagraph size={22}>레시피</Top.TitleParagraph>}
                subtitle2={
                    <Top.SubtitleParagraph>이번 주 레시피는 매주 바뀌어요.</Top.SubtitleParagraph>
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
                입문 스프 (재료 2개)
            </Txt>
            {beginner.map((recipe) => {
                const done = state.completedRecipeIds.includes(recipe.id);
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
                                        ? '완료'
                                        : `${recipe.hintDrip ?? recipe.hint} · ${getRecipeRewardSummary(recipe, done)}`
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
                이번주 레시피 ({weekly.length})
            </Txt>
            {weekly.map((recipe) => {
                const done = state.completedRecipeIds.includes(recipe.id);
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
                                        ? '완료 · 보상은 제작 결과에서 확인'
                                        : `${recipe.hintDrip ?? recipe.hint} · ${getRecipeRewardSummary(recipe, done)}`
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
                                        : `${recipe.hintDrip ?? '조합을 맞추면 공개'} · 1회 제작`
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
            <Txt typography="t5" fontWeight="semibold" style={styles.section}>
                전설 레시피
            </Txt>
            {legendary.map((recipe) => {
                const done = state.completedRecipeIds.includes(recipe.id);
                const unlocked = done;
                return (
                    <ListRow
                        key={recipe.id}
                        contents={
                            <ListRow.Texts
                                type="2RowTypeA"
                                top={unlocked ? recipe.name : '??? (전설)'}
                                topProps={{ fontWeight: 'bold' }}
                                bottom={
                                    unlocked
                                        ? `${recipe.realRewardLabel ?? '전설 리워드'} · 완료`
                                        : '레시피북에 이름도 없대요 · 5재료'
                                }
                            />
                        }
                        right={
                            done ? (
                                <ListRow.RightTexts type="1RowTypeA" top="완료" topProps={{ color: 'green500' }} />
                            ) : (
                                <ListRow.RightTexts type="1RowTypeA" top="전설" topProps={{ color: 'grey500' }} />
                            )
                        }
                    />
                );
            })}
            <View style={styles.note}>
                <Txt typography="t7" color="grey600" style={styles.noteText}>
                    모든 레시피는 한 번만 만들 수 있어요. 미완료 레시피는 재료 조합을 공개하지 않아요.
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
