import { getRecipeById } from '@api/mock/recipes';
import { Button, Top, Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../../shared/ui/Screen';
import { colors } from '../../shared/theme/colors';
import type { SoupBrewOutcome } from '@api/mock/soupRewardMock';

type SoupResultScreenProps = {
    recipeId: string;
    outcome: SoupBrewOutcome;
    onPressDone: () => void;
};

export function SoupResultScreen({ recipeId, outcome, onPressDone }: SoupResultScreenProps) {
    const recipe = getRecipeById(recipeId);
    if (recipe == null) {
        return null;
    }

    return (
        <Screen scrollable contentCentered>
            <Top title={<Top.TitleParagraph size={22}>스프 완성!</Top.TitleParagraph>} />
            <View style={styles.hero}>
                <Txt typography="t1">🍲</Txt>
                <Txt typography="t3" fontWeight="bold" style={styles.name}>
                    {recipe.name}
                </Txt>
            </View>
            <View
                style={[
                    styles.reward,
                    outcome.kind === 'miss'
                        ? styles.rewardMiss
                        : outcome.kind === 'real'
                          ? styles.rewardReal
                          : styles.rewardEco,
                ]}
            >
                <Txt typography="t7" fontWeight="semibold">
                    {outcome.kind === 'miss'
                        ? '꽝…'
                        : outcome.kind === 'real'
                          ? '실물 리워드'
                          : '에코잼 획득'}
                </Txt>
                <Txt typography="t4" fontWeight="bold" style={styles.rewardValue}>
                    {outcome.kind === 'miss'
                        ? (outcome.missMessage ?? '아쉽게도 보상이 없어요')
                        : outcome.kind === 'real'
                          ? (outcome.realRewardLabel ?? '리워드 지급 예정')
                          : `+${outcome.ecoJamAmount ?? 0} 잼`}
                </Txt>
                {outcome.kind === 'real' ? (
                    <Txt typography="t7" color="grey600" style={styles.sub}>
                        팀에서 확인 후 연락드릴게요.
                    </Txt>
                ) : outcome.kind === 'miss' ? (
                    <Txt typography="t7" color="grey600" style={styles.sub}>
                        레시피는 완성됐어요. 다음엔 운이 따라줄 거예요!
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
