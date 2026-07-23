import type { Mission } from '@api/mock';
import { isCoopMission } from '@api/mock/types';
import {
    formatIngredientReward,
    formatMissionIngredientReward,
    getIngredientById,
    MISSION_FIXED_REWARDS,
} from '@api/mock/ingredients';
import { Asset, Button, frameShape, Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import type { MissionProgressStatus } from '../user/types';
import { getMissionImageSource } from '../../shared/constants/missionAssets';
import { GUIDE_CHARACTER } from '../../shared/constants/guideCharacter';
import {
    MISSION_REWARD_PROBABILITY_LINES,
    MISSION_REWARD_PROBABILITY_TITLE,
} from '../../shared/constants/probabilityInfo';
import { TDS_ICON } from '../../shared/constants/tdsAssets';
import { BrandEmojiImage } from '../../shared/ui/BrandEmojiImage';
import { ProbabilityInfoButton } from '../../shared/ui/ProbabilityInfoButton';
import { Screen } from '../../shared/ui/Screen';
import { SproutAvatar, SproutAvatarWrap } from '../../shared/ui/SproutAvatar';
import { colors } from '../../shared/theme/colors';
import { coopDifficultyStars } from './coopMissionLogic';

type MissionDetailScreenProps = {
    mission: Mission;
    status: MissionProgressStatus;
    locked?: boolean;
    verifyLoading?: boolean;
    claimLoading?: boolean;
    /** 보상 수령 후 저장된 재료 id */
    claimedRewardIngredientId?: string | null;
    /** BE가 준 실제 재료명 */
    claimedRewardIngredientName?: string | null;
    claimedRewardIngredientImageUrl?: string | null;
    onPressVerify: () => void;
    onPressClaim?: () => void;
};

function getAuthNotice(mission: Mission): string {
    if (mission.authType === 'receipt') {
        return '영수증을 카메라로 찍어 인증해요.';
    }
    if (mission.authType === 'attendance_7d') {
        return '7일 출석 후 1·4·7일차에 카메라로 찍어 인증해요.';
    }
    return '카메라로 바로 찍어 인증해요.\n사진첩 사진은 쓸 수 없어요.';
}

export function MissionDetailScreen({
    mission,
    status,
    locked = false,
    verifyLoading = false,
    claimLoading = false,
    claimedRewardIngredientId = null,
    claimedRewardIngredientName = null,
    claimedRewardIngredientImageUrl = null,
    onPressVerify,
    onPressClaim,
}: MissionDetailScreenProps) {
    const isCompleted = status === 'completed';
    const isClaimable = status === 'claimable';
    const isCoop = isCoopMission(mission);
    const rewardLabel = formatMissionIngredientReward(mission.id);
    const isFixedReward = MISSION_FIXED_REWARDS[mission.id] != null;
    const claimedIngredient =
        claimedRewardIngredientId != null
            ? getIngredientById(claimedRewardIngredientId)
            : undefined;
    const claimedLabel =
        claimedRewardIngredientName?.trim() ||
        claimedIngredient?.name ||
        (claimedRewardIngredientId != null
            ? formatIngredientReward(claimedRewardIngredientId)
            : null);
    const claimedImageSource =
        claimedIngredient?.imageSource ??
        (claimedRewardIngredientImageUrl != null &&
        claimedRewardIngredientImageUrl.length > 0
            ? { uri: claimedRewardIngredientImageUrl }
            : null);
    /** 검수 이후(claimable·completed): 인증 안내 → 보상 확인 칸 */
    const showClaimedRewardBox = !locked && (isClaimable || isCompleted);
    const headerLine = locked
        ? '이전 공동 미션을 완료하면 열려요.'
        : isCompleted
          ? '보상을 받았어요.'
          : isClaimable
            ? '검수가 끝났어요. 보상을 받아 주세요.'
            : status === 'pending_review'
              ? '제출한 사진을 검수하고 있어요.'
              : '실천하고 사진으로 인증해요.';

    const displayClaimedName =
        isCompleted && claimedLabel != null && claimedLabel !== '재료'
            ? claimedLabel
            : isCompleted
              ? claimedLabel ?? '보상 정보 없음'
              : isClaimable
                ? '보상 받기 후 재료가 확정돼요'
                : rewardLabel;

    return (
        <Screen>
            <View style={styles.body}>
                <View style={styles.header}>
                    <View style={styles.headerRow}>
                        <SproutAvatarWrap>
                            <SproutAvatar size="small" animate={false} />
                        </SproutAvatarWrap>
                        <View style={styles.nameTag}>
                            <Txt typography="t7" fontWeight="semibold" color="grey600">
                                {GUIDE_CHARACTER.name}
                            </Txt>
                        </View>
                    </View>
                    <Txt typography="t7" color="grey600" style={styles.headerLine}>
                        {headerLine}
                    </Txt>
                </View>

                <View style={styles.photoCard}>
                    <BrandEmojiImage
                        source={getMissionImageSource(mission.id, mission.title)}
                        size={72}
                        accessibilityLabel={mission.title}
                    />
                    {isCoop ? (
                        <Txt typography="t7" color="grey500" style={styles.coopTag}>
                            {`공동 미션 · ${coopDifficultyStars(mission.difficulty)}`}
                        </Txt>
                    ) : null}
                    <Txt typography="t5" fontWeight="bold" style={styles.missionTitle}>
                        {mission.title}
                    </Txt>
                    <Txt typography="t7" color="grey600" style={styles.missionDesc}>
                        {mission.description}
                    </Txt>
                </View>

                {locked ? null : (
                    <>
                        <View style={styles.rewardRow}>
                            <Asset.Icon
                                name={TDS_ICON.gachaGift}
                                frameShape={frameShape.CircleSmall}
                                backgroundColor={colors.primaryLight}
                                accessibilityLabel="재료 보상"
                            />
                            <Txt typography="t7" color="grey700" style={styles.rewardText}>
                                {isCompleted
                                    ? `받은 보상 · ${displayClaimedName}`
                                    : `보상 · ${rewardLabel}`}
                            </Txt>
                            {isFixedReward || isCompleted ? null : (
                                <ProbabilityInfoButton
                                    title={MISSION_REWARD_PROBABILITY_TITLE}
                                    lines={MISSION_REWARD_PROBABILITY_LINES}
                                />
                            )}
                        </View>

                        {showClaimedRewardBox ? (
                            <View style={styles.notice} accessibilityRole="text">
                                {claimedImageSource != null ? (
                                    <BrandEmojiImage
                                        source={claimedImageSource}
                                        size={40}
                                        accessibilityLabel={displayClaimedName}
                                    />
                                ) : (
                                    <Asset.Icon
                                        name={TDS_ICON.gachaGift}
                                        frameShape={frameShape.CircleSmall}
                                        backgroundColor={colors.primaryLight}
                                        accessibilityLabel="받은 보상"
                                    />
                                )}
                                <Txt typography="t7" color="grey700" style={styles.claimedTitle}>
                                    {isCompleted ? '받은 보상' : '지급 예정 보상'}
                                </Txt>
                                <Txt typography="t6" fontWeight="bold" style={styles.claimedName}>
                                    {displayClaimedName}
                                </Txt>
                                {isClaimable && !isCompleted ? (
                                    <Txt typography="t7" color="grey500" style={styles.claimedHint}>
                                        아래 버튼으로 보상을 받아 주세요.
                                    </Txt>
                                ) : null}
                            </View>
                        ) : (
                            <View style={styles.notice}>
                                <Txt typography="t7" color="grey600" style={styles.noticeText}>
                                    {getAuthNotice(mission)}
                                </Txt>
                            </View>
                        )}
                    </>
                )}
            </View>

            <View style={styles.cta}>
                {isClaimable && onPressClaim != null ? (
                    <Button
                        size="large"
                        type="primary"
                        display="block"
                        disabled={claimLoading}
                        loading={claimLoading}
                        onPress={onPressClaim}
                        accessibilityLabel="보상 받기"
                    >
                        {claimLoading ? '받는 중…' : '보상 받기'}
                    </Button>
                ) : (
                    <Button
                        size="large"
                        type="primary"
                        display="block"
                        disabled={
                            isCompleted ||
                            locked ||
                            verifyLoading ||
                            status === 'pending_review'
                        }
                        loading={verifyLoading}
                        onPress={onPressVerify}
                        accessibilityLabel={
                            locked
                                ? '아직 잠겨 있어요'
                                : isCompleted
                                  ? '이미 완료한 미션'
                                  : status === 'pending_review'
                                    ? '검수 중'
                                    : '인증하기'
                        }
                    >
                        {locked
                            ? '아직 잠겨 있어요'
                            : isCompleted
                              ? '이미 완료한 미션'
                              : status === 'pending_review'
                                ? '검수 중이에요'
                                : verifyLoading
                                  ? '카메라 여는 중…'
                                  : '인증하기'}
                    </Button>
                )}
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    body: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 12,
        gap: 12,
    },
    header: {
        gap: 6,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    nameTag: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderWidth: 1,
        borderColor: colors.border,
    },
    headerLine: {
        lineHeight: 20,
    },
    photoCard: {
        flexGrow: 1,
        flexShrink: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 28,
        paddingHorizontal: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        gap: 8,
        minHeight: 220,
    },
    coopTag: {
        textAlign: 'center',
        marginTop: 4,
    },
    missionTitle: {
        textAlign: 'center',
        marginTop: 4,
    },
    missionDesc: {
        textAlign: 'center',
        lineHeight: 20,
        maxWidth: 280,
    },
    rewardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 14,
        backgroundColor: colors.primaryLight,
        borderWidth: 1,
        borderColor: colors.border,
    },
    rewardText: {
        flex: 1,
        flexShrink: 1,
    },
    notice: {
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        gap: 6,
    },
    noticeText: {
        lineHeight: 20,
        textAlign: 'center',
    },
    claimedTitle: {
        textAlign: 'center',
        marginTop: 2,
    },
    claimedName: {
        textAlign: 'center',
    },
    claimedHint: {
        textAlign: 'center',
        lineHeight: 18,
        marginTop: 2,
    },
    cta: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 20,
        backgroundColor: colors.background,
    },
});
