import { getRecipeById } from '@api/mock/recipes';
import type { SoupCraftResponse } from '@api/notion/types';
import { Button, Top, Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../../shared/ui/Screen';
import { colors } from '../../shared/theme/colors';

type SoupResultScreenProps = {
    recipeId: string;
    craft: SoupCraftResponse;
    onPressDone: () => void;
};

export function SoupResultScreen({ recipeId, craft, onPressDone }: SoupResultScreenProps) {
    const recipe = getRecipeById(recipeId);
    const displayName = craft.recipeName ?? recipe?.name ?? '스프';
    const isFail = craft.result === 'FAIL';
    const isReal = craft.rewardType === 'REAL_ITEM';

    return (
        <Screen scrollable contentCentered>
            <Top title={<Top.TitleParagraph size={22}>스프 완성!</Top.TitleParagraph>} />
            <View style={styles.hero}>
                <Txt typography="t1">🍲</Txt>
                <Txt typography="t3" fontWeight="bold" style={styles.name}>
                    {displayName}
                </Txt>
            </View>
            <View
                style={[
                    styles.reward,
                    isFail ? styles.rewardMiss : isReal ? styles.rewardReal : styles.rewardEco,
                ]}
            >
                <Txt typography="t7" fontWeight="semibold">
                    {isFail ? '실패 (확률)' : isReal ? '실물 리워드' : '에코잼 획득'}
                </Txt>
                <Txt typography="t4" fontWeight="bold" style={styles.rewardValue}>
                    {isFail
                        ? (craft.rewardDescription ?? '쓰레기 봉투')
                        : isReal
                          ? (craft.rewardDescription ?? '리워드 지급 예정')
                          : `+${craft.rewardAmount ?? 0} 잼`}
                </Txt>
                {isReal ? (
                    <Txt typography="t7" color="grey600" style={styles.sub}>
                        팀에서 확인 후 연락드릴게요.
                    </Txt>
                ) : isFail ? (
                    <Txt typography="t7" color="grey600" style={styles.sub}>
                        레시피는 완성됐어요. 재료는 사용되었어요.
                    </Txt>
                ) : null}
            </View>
            <Button size="large" type="primary" display="block" onPress={onPressDone}>
                확인
            </Button>
        </Screen>
    );
}

const styles = StyleSheet.create({
    hero: {
        alignItems: 'center',
        gap: 12,
        marginVertical: 24,
    },
    name: {
        textAlign: 'center',
    },
    reward: {
        width: '100%',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        gap: 8,
        marginBottom: 24,
    },
    rewardEco: {
        backgroundColor: colors.primaryLight,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    rewardReal: {
        backgroundColor: '#FFF8E7',
        borderWidth: 1,
        borderColor: '#FFB800',
    },
    rewardMiss: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
    rewardValue: {
        color: colors.primaryDark,
        textAlign: 'center',
    },
    sub: {
        textAlign: 'center',
        marginTop: 4,
    },
});
