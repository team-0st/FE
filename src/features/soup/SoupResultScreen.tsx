import { getRecipeById } from '@api/mock/recipes';
import { Button, Top, Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../../shared/ui/Screen';
import { colors } from '../../shared/theme/colors';

type SoupResultScreenProps = {
    recipeId: string;
    onPressDone: () => void;
};

export function SoupResultScreen({ recipeId, onPressDone }: SoupResultScreenProps) {
    const recipe = getRecipeById(recipeId);
    if (recipe == null) {
        return null;
    }

    const isHidden = recipe.kind === 'hidden';

    return (
        <Screen scrollable contentCentered>
            <Top title={<Top.TitleParagraph size={22}>스프 완성!</Top.TitleParagraph>} />
            <View style={styles.hero}>
                <Txt typography="t1">🍲</Txt>
                <Txt typography="t3" fontWeight="bold" style={styles.name}>
                    {recipe.name}
                </Txt>
            </View>
            <View style={[styles.reward, isHidden ? styles.rewardReal : styles.rewardEco]}>
                <Txt typography="t7" fontWeight="semibold">
                    {isHidden ? '실물 리워드' : '에코잼 획득'}
                </Txt>
                <Txt typography="t4" fontWeight="bold" style={styles.rewardValue}>
                    {isHidden
                        ? (recipe.realRewardLabel ?? '리워드 지급 예정')
                        : `+${recipe.ecoJamReward ?? 0} 잼`}
                </Txt>
                {isHidden ? (
                    <Txt typography="t7" color="grey600" style={styles.sub}>
                        팀에서 확인 후 연락드릴게요. (MVP mock)
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
    rewardValue: {
        color: colors.primaryDark,
        textAlign: 'center',
    },
    sub: {
        textAlign: 'center',
        marginTop: 4,
    },
});
