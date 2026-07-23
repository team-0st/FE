import { getIngredientById } from '@api/mock/ingredients';
import { getRecipeById } from '@api/mock/recipes';
import type { SoupCraftResponse } from '@api/notion/types';
import { BottomCTA, Button, Txt } from '@toss/tds-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { BRAND_EMOJI, FEATURE_STAGE_HEIGHT } from '../../shared/constants/brandAssets';
import { getSoupImageSource } from '../../shared/constants/soupAssets';
import {
    getSoupFailImageSource,
    isUndercookedFailPhrase,
} from '../../shared/constants/soupFailAssets';
import { getSoupRerollArtSource } from '../../shared/constants/soupRerollAssets';
import { buildSoupShareMessage } from '../../shared/feedback/shareResult';
import { useAppToast } from '../../shared/feedback/useAppToast';
import { BrandEmojiImage } from '../../shared/ui/BrandEmojiImage';
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
const REWARD_ICON_SIZE = 56;
/** 재료 아이콘 나열 상한 — 비정상 amount 방어 */
const MAX_INGREDIENT_ICONS = 8;

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
    const rewardIngredient =
        grade === 'INGREDIENT' && craft.rewardIngredientId != null
            ? getIngredientById(craft.rewardIngredientId)
            : undefined;
    const rewardIngredientCount =
        rewardIngredient == null
            ? 0
            : Math.min(
                  MAX_INGREDIENT_ICONS,
                  Math.max(1, Math.floor(craft.rewardAmount ?? 1)),
              );
    const pointAmount = Math.max(
        0,
        Math.floor(
            craft.rewardPoint ??
                (craft.rewardType === 'ALMANG_POINT' ? (craft.rewardAmount ?? 0) : 0),
        ),
    );
    const showPointReward = rewardIngredient == null && pointAmount > 0;
    const ecoJamAmount = Math.max(
        0,
        Math.floor(
            craft.rewardEcoJam ??
                (craft.rewardType === 'ECO_JAM' && rewardIngredient == null
                    ? (craft.rewardAmount ?? 0)
                    : 0),
        ),
    );
    const showEcoJamReward = rewardIngredient == null && !showPointReward && ecoJamAmount > 0;

    const mainTitle = isFail ? failPhrase : SOUP_GRADE_LABEL[grade];

    const oneLineSub = useMemo(() => {
        if (isFail) {
            if (isUndercookedFailPhrase(failPhrase)) {
                return '재료는 사용되었어요.';
            }
            return displayName;
        }
        if (rewardIngredient != null) {
            return `${rewardIngredient.name} ${rewardIngredientCount}개`;
        }
        if (showPointReward) {
            return `알맹P ${pointAmount}개`;
        }
        if (showEcoJamReward) {
            return `에코잼 ${ecoJamAmount}개`;
        }
        if (craft.rewardType === 'REAL_ITEM') {
            return craft.rewardDescription ?? '리워드 지급 예정';
        }
        return displayName;
    }, [
        isFail,
        failPhrase,
        displayName,
        craft,
        rewardIngredient,
        rewardIngredientCount,
        showPointReward,
        pointAmount,
        showEcoJamReward,
        ecoJamAmount,
    ]);

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
            <ScrollView
                testID="soup-result-scroll"
                style={styles.body}
                contentContainerStyle={styles.bodyContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.heroStage}>
                    {heroUri != null ? (
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
                    ) : null}
                </View>
                <View style={styles.details} testID="soup-result-details">
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

                    {rewardIngredient != null ? (
                        <View style={styles.rewardBlock} testID="soup-result-ingredient-reward">
                            <View style={styles.ingredientIcons}>
                                {Array.from({ length: rewardIngredientCount }, (_, index) => (
                                    <View
                                        key={`${rewardIngredient.id}-${index}`}
                                        style={styles.ingredientIcon}
                                    >
                                        {rewardIngredient.imageSource != null ? (
                                            <BrandEmojiImage
                                                source={rewardIngredient.imageSource}
                                                size={REWARD_ICON_SIZE}
                                                containerStyle={styles.ingredientImage}
                                                accessibilityLabel={`${rewardIngredient.name} 보상 ${index + 1}`}
                                            />
                                        ) : null}
                                    </View>
                                ))}
                            </View>
                            <Txt
                                typography="t6"
                                color="grey700"
                                fontWeight="semibold"
                                style={styles.rewardLabel}
                            >
                                {`${rewardIngredient.name} ${rewardIngredientCount}개`}
                            </Txt>
                        </View>
                    ) : showPointReward ? (
                        <View style={styles.rewardBlock} testID="soup-result-point-reward">
                            <BrandEmojiImage
                                source={BRAND_EMOJI.almangPoint}
                                size={REWARD_ICON_SIZE}
                                containerStyle={styles.ingredientImage}
                                accessibilityLabel="알맹 포인트 보상"
                            />
                            <Txt
                                typography="t6"
                                color="grey700"
                                fontWeight="semibold"
                                style={styles.rewardLabel}
                            >
                                {`알맹P ${pointAmount}개`}
                            </Txt>
                        </View>
                    ) : showEcoJamReward ? (
                        <View style={styles.rewardBlock} testID="soup-result-ecojam-reward">
                            <BrandEmojiImage
                                source={BRAND_EMOJI.ecoJam}
                                size={REWARD_ICON_SIZE}
                                containerStyle={styles.ingredientImage}
                                accessibilityLabel="에코잼 보상"
                            />
                            <Txt
                                typography="t6"
                                color="grey700"
                                fontWeight="semibold"
                                style={styles.rewardLabel}
                            >
                                {`에코잼 ${ecoJamAmount}개`}
                            </Txt>
                        </View>
                    ) : (
                        <Txt typography="t6" color="grey600" style={styles.oneLine}>
                            {oneLineSub}
                        </Txt>
                    )}
                </View>
            </ScrollView>
            <View testID="soup-result-footer" style={styles.footer}>
                {showRerollButton ? (
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
                ) : null}
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
    },
    bodyContent: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 24,
        alignItems: 'center',
    },
    heroStage: {
        width: '100%',
        height: FEATURE_STAGE_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    hero: {
        height: '100%',
        maxWidth: '100%',
    },
    details: {
        width: '100%',
        alignItems: 'center',
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
    rewardBlock: {
        width: '100%',
        alignItems: 'center',
        gap: 10,
    },
    ingredientIcons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    ingredientIcon: {
        alignItems: 'center',
    },
    ingredientImage: {
        marginRight: 0,
    },
    rewardLabel: {
        textAlign: 'center',
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
    footer: {
        width: '100%',
        maxWidth: 440,
        alignSelf: 'center',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 16,
        gap: 10,
        backgroundColor: colors.background,
    },
});
