import { getIngredientById } from '@api/mock/ingredients';
import { getRecipeById } from '@api/mock/recipes';
import type { SoupCraftResponse } from '@api/notion/types';
import { BottomCTA, Button, Txt } from '@toss/tds-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { getSoupImageSource } from '../../shared/constants/soupAssets';
import {
    getSoupFailImageSource,
    isUndercookedFailPhrase,
} from '../../shared/constants/soupFailAssets';
import { getSoupRerollArtSource } from '../../shared/constants/soupRerollAssets';
import { buildSoupShareMessage } from '../../shared/feedback/shareResult';
import { useAppToast } from '../../shared/feedback/useAppToast';
import { CenteredFeatureStage } from '../../shared/ui/CenteredFeatureStage';
import { ShareResultButton } from '../../shared/ui/ShareResultButton';
import { toBrandImageSource } from '../../shared/ui/toBrandImageSource';
import { colors } from '../../shared/theme/colors';
import { useUser } from '../user/UserProvider';
import {
    gradeFromCraft,
    SOUP_GRADE_LABEL,
    soupRerollActionName,
    soupRerollCost,
    soupRerollKindFor,
} from './soupRewardGrades';

type SoupResultScreenProps = {
    recipeId: string;
    craft: SoupCraftResponse;
    onPressDone: () => void;
    onCraftUpdated?: (craft: SoupCraftResponse) => void;
};

const THUMB_SIZE = 56;
const REROLL_ART_SIZE = 72;

export function SoupResultScreen({
    recipeId: recipeIdProp,
    craft: craftProp,
    onPressDone,
    onCraftUpdated,
}: SoupResultScreenProps) {
    const { state, rerollSoupReward } = useUser();
    const { showSuccess, showError, show } = useAppToast();
    const session = state.lastSoupSession;
    const recipeId =
        recipeIdProp.length > 0 ? recipeIdProp : (session?.recipeId ?? '');
    const [craft, setCraft] = useState(craftProp);
    const [rerollLoading, setRerollLoading] = useState(false);
    const [heroAspectRatio, setHeroAspectRatio] = useState(1);

    useEffect(() => {
        if (session == null) {
            return;
        }
        if (session.recipeId !== recipeId && recipeIdProp.length > 0) {
            return;
        }
        setCraft(session.craft);
    }, [session, recipeId, recipeIdProp.length]);

    const recipe = getRecipeById(recipeId);
    const displayName = craft.recipeName ?? recipe?.name ?? '스프';
    const grade = gradeFromCraft(craft);
    const isFail = grade === 'FAIL';
    const failPhrase = craft.rewardDescription ?? '아쉬운 한 그릇';
    const kind = recipe != null ? soupRerollKindFor(recipe) : 'common';
    const actionName = soupRerollActionName(kind);
    const rerollCost = soupRerollCost(kind, grade);
    const sessionMatches =
        session != null && (session.recipeId === recipeId || recipeId.length === 0);
    const alreadyUsed = sessionMatches && session.rerollUsed === true;
    const showRerollButton = !alreadyUsed && rerollCost != null && recipeId.length > 0;
    const canReroll = showRerollButton && state.ecoJam >= rerollCost;

    const heroSource = useMemo(() => {
        if (isFail) {
            return getSoupFailImageSource(failPhrase, craft.soupId);
        }
        return getSoupImageSource(recipeId);
    }, [isFail, failPhrase, craft.soupId, recipeId]);

    useEffect(() => {
        setHeroAspectRatio(1);
    }, [heroSource]);

    const heroUri = toBrandImageSource(heroSource);
    const soupThumbUri = toBrandImageSource(getSoupImageSource(recipeId));
    const rerollArtUri = toBrandImageSource(getSoupRerollArtSource(kind));
    const showUndercookedSoupChip =
        isFail && isUndercookedFailPhrase(failPhrase) && soupThumbUri != null;

    const mainTitle = isFail ? failPhrase : SOUP_GRADE_LABEL[grade];

    const oneLineSub = useMemo(() => {
        if (isFail) {
            if (isUndercookedFailPhrase(failPhrase)) {
                return '재료는 사용되었어요.';
            }
            return displayName;
        }
        if (grade === 'INGREDIENT' && craft.rewardIngredientId != null) {
            const item = getIngredientById(craft.rewardIngredientId);
            return item != null ? `${item.name} 1개` : '재료 1개';
        }
        if (craft.rewardType === 'REAL_ITEM') {
            return craft.rewardDescription ?? '리워드 지급 예정';
        }
        if (craft.rewardType === 'ALMANG_POINT') {
            return `알맹P +${craft.rewardAmount ?? 0}`;
        }
        if ((craft.rewardAmount ?? 0) > 0) {
            return `에코잼 +${craft.rewardAmount ?? 0}개`;
        }
        return displayName;
    }, [isFail, failPhrase, displayName, grade, craft]);

    const shareRewardLabel = isFail ? failPhrase : oneLineSub;

    const handleReroll = async () => {
        if (!showRerollButton || rerollLoading || rerollCost == null) {
            return;
        }
        setRerollLoading(true);
        try {
            const result = await rerollSoupReward({ recipeId, craft });
            if (!result.ok) {
                if (result.reason === 'insufficient_eco_jam') {
                    showError(`에코잼이 부족해요. (필요: ${rerollCost}개)`);
                    return;
                }
                if (result.reason === 'already_used') {
                    show('이미 리롤을 사용했어요.');
                    return;
                }
                if (result.reason === 'network') {
                    showError('네트워크 오류예요.\n잠시 후 다시 시도해 주세요.');
                    return;
                }
                showError('지금은 리롤할 수 없어요.');
                return;
            }
            setCraft(result.craft);
            onCraftUpdated?.(result.craft);
            if (result.upgraded) {
                showSuccess(`${result.actionName}! 보상이 올랐어요.`);
            } else {
                show(`${result.actionName} · 등급이 유지됐어요.`);
            }
        } finally {
            setRerollLoading(false);
        }
    };

    return (
        <View style={styles.root}>
            <View style={styles.body} testID="soup-result-body">
                <CenteredFeatureStage
                    testID="soup-result-centered-stage"
                    stageTestID="soup-result-stage-viewport"
                    belowTestID="soup-result-below"
                    stage={
                        heroUri != null ? (
                            <Image
                                testID="soup-result-hero-image"
                                source={heroUri}
                                style={[styles.hero, { aspectRatio: heroAspectRatio }]}
                                resizeMode="contain"
                                onLoad={(event) => {
                                    const { width, height } = event.nativeEvent.source;
                                    if (width > 0 && height > 0) {
                                        setHeroAspectRatio(width / height);
                                    }
                                }}
                                accessibilityLabel={isFail ? failPhrase : displayName}
                            />
                        ) : null
                    }
                    below={
                        <View style={styles.details}>
                            {showUndercookedSoupChip ? (
                                <View style={styles.soupChip}>
                                    <Image
                                        source={soupThumbUri}
                                        style={styles.soupThumb}
                                        resizeMode="contain"
                                        accessibilityLabel={displayName}
                                    />
                                    <Txt typography="t7" color="grey600" numberOfLines={1}>
                                        {displayName}
                                    </Txt>
                                </View>
                            ) : null}

                            <Txt typography="t2" fontWeight="bold" style={styles.mainTitle}>
                                {mainTitle}
                            </Txt>

                            <Txt typography="t6" color="grey600" style={styles.oneLine}>
                                {oneLineSub}
                            </Txt>

                            {showRerollButton ? (
                                <View style={styles.rerollBlock}>
                                    <View style={styles.rerollRow}>
                                        {rerollArtUri != null ? (
                                            <Image
                                                source={rerollArtUri}
                                                style={styles.rerollArt}
                                                resizeMode="contain"
                                                accessibilityLabel={actionName}
                                            />
                                        ) : null}
                                        <View style={styles.rerollButtonWrap}>
                                            <Button
                                                size="large"
                                                type="dark"
                                                style="weak"
                                                display="block"
                                                disabled={rerollLoading || !canReroll}
                                                onPress={() => {
                                                    void handleReroll();
                                                }}
                                            >
                                                {rerollLoading
                                                    ? '리롤 중…'
                                                    : canReroll
                                                      ? `${actionName} · ${rerollCost}잼`
                                                      : `에코잼 부족 · ${rerollCost}잼`}
                                            </Button>
                                        </View>
                                    </View>
                                </View>
                            ) : alreadyUsed ? (
                                <Txt typography="t7" color="grey500" style={styles.rerollUsed}>
                                    {`${actionName}은 이미 사용했어요.`}
                                </Txt>
                            ) : null}
                        </View>
                    }
                />
            </View>
            <View testID="soup-result-footer" style={styles.footer}>
                <BottomCTA.Double
                    leftButton={
                        <ShareResultButton
                            message={buildSoupShareMessage(displayName, shareRewardLabel)}
                        />
                    }
                    rightButton={
                        <Button size="large" type="primary" display="block" onPress={onPressDone}>
                            확인
                        </Button>
                    }
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.background,
    },
    body: {
        flex: 1,
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
        paddingHorizontal: 24,
    },
    hero: {
        height: '100%',
        maxWidth: '100%',
    },
    details: {
        width: '100%',
        alignItems: 'center',
        paddingBottom: 24,
        gap: 12,
    },
    soupChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 16,
        backgroundColor: colors.slotEmpty,
        maxWidth: '100%',
    },
    soupThumb: {
        width: THUMB_SIZE,
        height: THUMB_SIZE,
    },
    mainTitle: {
        textAlign: 'center',
        marginTop: 4,
    },
    oneLine: {
        textAlign: 'center',
    },
    rerollBlock: {
        width: '100%',
        marginTop: 20,
    },
    rerollRow: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    rerollArt: {
        width: REROLL_ART_SIZE,
        height: REROLL_ART_SIZE,
    },
    rerollButtonWrap: {
        flex: 1,
        minWidth: 0,
    },
    rerollUsed: {
        textAlign: 'center',
        marginTop: 16,
    },
    footer: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 16,
        gap: 10,
    },
});
