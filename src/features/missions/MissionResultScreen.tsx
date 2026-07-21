import type { Mission } from '@api/mock';
import {
    formatIngredientReward,
    getMissionRewardIngredient,
} from '@api/mock/ingredients';
import { BottomCTA, Button, Top, Txt } from '@toss/tds-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { buildMissionShareMessage, shareZerostResult } from '../../shared/feedback/shareResult';
import { useAppToast } from '../../shared/feedback/useAppToast';
import { BrandEmojiImage } from '../../shared/ui/BrandEmojiImage';
import { Screen } from '../../shared/ui/Screen';
import { colors } from '../../shared/theme/colors';
import { resolveShopNameWithRegion } from '../user/selectors';
import { useUser } from '../user/UserProvider';
import { computeCheckInStreak } from '../user/userStateLogic';
import { getCarbonReduction } from './carbonReduction';
import { MissionShareCard } from './MissionShareCard';
import {
    clearPendingMissionVerifyPhoto,
    peekPendingMissionVerifyPhoto,
} from './missionVerifyPhotoStore';

type MissionResultScreenProps = {
    mission: Mission;
    onPressHome: () => void;
};

function formatShareDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}.${m}.${d}`;
}

export function MissionResultScreen({ mission, onPressHome }: MissionResultScreenProps) {
    const { state } = useUser();
    const toast = useAppToast();
    const [sharing, setSharing] = useState(false);
    const progress = state.missionProgress[mission.id];
    const isPending = progress?.status === 'pending_review';
    const rewardIngredient = getMissionRewardIngredient(
        mission.id,
        progress?.rewardIngredientId,
    );
    const rewardLabel =
        rewardIngredient != null
            ? formatIngredientReward(rewardIngredient.id)
            : '랜덤 재료';
    const carbonReduction = getCarbonReduction(mission.id);

    /** 라우트에 바이너리를 넣지 않기 위해 verify 화면이 남긴 store에서 인증 사진을 1회 읽는다 */
    const capturedPhotoUri = useMemo(
        () => peekPendingMissionVerifyPhoto(mission.id)?.previewUri ?? null,
        [mission.id],
    );
    useEffect(() => {
        clearPendingMissionVerifyPhoto(mission.id);
    }, [mission.id]);

    const practiceCount = useMemo(
        () =>
            Object.values(state.missionProgress).filter((item) => item.status === 'completed')
                .length || 1,
        [state.missionProgress],
    );
    const shopName = resolveShopNameWithRegion(state.shopId);
    const checkInStreak = computeCheckInStreak(state.checkInDates);
    const dateLabel = formatShareDate(new Date());
    const shareMessage = buildMissionShareMessage(mission.title, rewardLabel);

    // 공유 성공 검증 서버 API가 없어 에코잼 보상 없이 공유만 수행한다.
    const handleShare = useCallback(async () => {
        if (sharing) {
            return;
        }
        setSharing(true);
        try {
            const shared = await shareZerostResult(shareMessage);
            if (!shared) {
                toast.show('공유를 취소했어요.');
                return;
            }
            toast.showSuccess('공유했어요!');
        } catch {
            toast.show('공유를 취소했어요.');
        } finally {
            setSharing(false);
        }
    }, [shareMessage, sharing, toast]);

    return (
        <View style={styles.root}>
            <Screen scrollable>
                <Top title={<Top.TitleParagraph size={22}>미션 완료</Top.TitleParagraph>} />
                {isPending ? (
                    <View style={styles.pendingBox}>
                        <Txt typography="t5" fontWeight="bold" style={styles.pendingTitle}>
                            {mission.title}
                        </Txt>
                        <Txt typography="t6" color="grey700" style={styles.pendingMessage}>
                            인증 사진을 제출했어요.{'\n'}검수가 끝나면 재료를 받을 수 있어요.
                        </Txt>
                        <Txt typography="t7" color="grey600" style={styles.pendingMessage}>
                            보통 몇 시간 안에 검수가 완료돼요.
                        </Txt>
                    </View>
                ) : (
                    <>
                        <View style={styles.rewardBox}>
                            {rewardIngredient?.imageSource != null ? (
                                <BrandEmojiImage
                                    source={rewardIngredient.imageSource}
                                    size={72}
                                    containerStyle={styles.rewardImage}
                                    accessibilityLabel={rewardLabel}
                                />
                            ) : null}
                            <Txt typography="t7" color="grey600">
                                획득 재료
                            </Txt>
                            <Txt typography="t4" fontWeight="bold" style={styles.rewardLabel}>
                                {rewardLabel}
                            </Txt>
                        </View>
                        {carbonReduction != null ? (
                            <Txt typography="t6" color="grey700" style={styles.carbonFeedback}>
                                {carbonReduction.feedbackCopy}
                            </Txt>
                        ) : null}
                        <MissionShareCard
                            missionTitle={mission.title}
                            practiceCount={practiceCount}
                            checkInStreak={checkInStreak}
                            shopName={shopName}
                            dateLabel={dateLabel}
                            rewardLabel={rewardLabel}
                            carbonGrams={carbonReduction?.grams ?? null}
                            photoUri={capturedPhotoUri}
                        />
                    </>
                )}
            </Screen>
            <View style={styles.footer}>
                {!isPending ? (
                    <BottomCTA.Double
                        leftButton={
                            <Button
                                size="large"
                                type="primary"
                                style="weak"
                                display="block"
                                onPress={() => {
                                    void handleShare();
                                }}
                            >
                                공유하기
                            </Button>
                        }
                        rightButton={
                            <Button size="large" type="primary" display="block" onPress={onPressHome}>
                                홈으로
                            </Button>
                        }
                    />
                ) : (
                    <BottomCTA.Single
                        size="large"
                        type="primary"
                        display="block"
                        onPress={onPressHome}
                    >
                        홈으로
                    </BottomCTA.Single>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.surface,
    },
    pendingBox: {
        marginTop: 16,
        marginHorizontal: 20,
        padding: 24,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        gap: 12,
        alignItems: 'center',
    },
    rewardBox: {
        marginHorizontal: 20,
        marginTop: 4,
        padding: 16,
        borderRadius: 16,
        backgroundColor: colors.heroTint,
        alignItems: 'center',
        gap: 4,
    },
    rewardImage: {
        marginRight: 0,
        marginBottom: 4,
    },
    rewardLabel: {
        textAlign: 'center',
    },
    carbonFeedback: {
        textAlign: 'center',
        marginTop: 10,
        marginHorizontal: 20,
    },
    pendingTitle: {
        textAlign: 'center',
    },
    pendingMessage: {
        textAlign: 'center',
        lineHeight: 22,
    },
    footer: {
        paddingHorizontal: 20,
        paddingBottom: 16,
        maxWidth: 400,
        width: '100%',
        alignSelf: 'center',
    },
});
