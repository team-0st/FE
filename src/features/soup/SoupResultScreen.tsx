import { getRecipeById } from '@api/mock/recipes';
import type { SoupCraftResponse } from '@api/notion/types';
import { BottomCTA, Button, Result, Top, Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import { BRAND_ASSET } from '../../shared/constants/brandAssets';
import { buildSoupShareMessage } from '../../shared/feedback/shareResult';
import { Screen } from '../../shared/ui/Screen';
import { ShareResultButton } from '../../shared/ui/ShareResultButton';
import { TdsHeroAsset } from '../../shared/ui/TdsHeroAsset';
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
    const rewardLabel = isFail
        ? (craft.rewardDescription ?? '쓰레기 봉투')
        : isReal
          ? (craft.rewardDescription ?? '리워드 지급 예정')
          : `에코잼 +${craft.rewardAmount ?? 0}개`;

    const rewardTitle = isFail ? '실패 (확률)' : isReal ? '실물 리워드' : '에코잼 획득';
    const rewardValue = isFail
        ? (craft.rewardDescription ?? '쓰레기 봉투')
        : isReal
          ? (craft.rewardDescription ?? '리워드 지급 예정')
          : `+${craft.rewardAmount ?? 0} 잼`;

    return (
        <View style={styles.root}>
            <Screen scrollable contentCentered>
                <Top title={<Top.TitleParagraph size={22}>스프 완성!</Top.TitleParagraph>} />
                <Result
                    figure={
                        <TdsHeroAsset
                            source={BRAND_ASSET.heroSoup}
                            accessibilityLabel="완성된 스프"
                        />
                    }
                    title={
                        <Txt typography="t3" fontWeight="bold" style={styles.name}>
                            {displayName}
                        </Txt>
                    }
                    description={
                        <View
                            style={[
                                styles.reward,
                                isFail ? styles.rewardMiss : isReal ? styles.rewardReal : styles.rewardEco,
                            ]}
                        >
                            <Txt typography="t7" fontWeight="semibold">
                                {rewardTitle}
                            </Txt>
                            <Txt typography="t4" fontWeight="bold" style={styles.rewardValue}>
                                {rewardValue}
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
                    }
                />
            </Screen>
            <View style={styles.footer}>
                {!isFail ? (
                    <BottomCTA.Double
                        leftButton={
                            <ShareResultButton
                                message={buildSoupShareMessage(displayName, rewardLabel)}
                            />
                        }
                        rightButton={
                            <Button size="large" type="primary" display="block" onPress={onPressDone}>
                                확인
                            </Button>
                        }
                    />
                ) : (
                    <BottomCTA.Single
                        size="large"
                        type="primary"
                        display="block"
                        onPress={onPressDone}
                    >
                        확인
                    </BottomCTA.Single>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.background,
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
        marginTop: 8,
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
    footer: {
        paddingHorizontal: 20,
        paddingBottom: 16,
        maxWidth: 400,
        width: '100%',
        alignSelf: 'center',
    },
});
