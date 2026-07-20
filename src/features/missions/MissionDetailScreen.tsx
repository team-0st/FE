import type { Mission } from '@api/mock';
import { isCoopMission } from '@api/mock/types';
import { formatMissionIngredientReward, MISSION_FIXED_REWARDS } from '@api/mock/ingredients';
import { Asset, Button, frameShape, Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import type { MissionProgressStatus } from '../user/types';
import { GUIDE_CHARACTER } from '../../shared/constants/guideCharacter';
import {
    MISSION_REWARD_PROBABILITY_LINES,
    MISSION_REWARD_PROBABILITY_TITLE,
} from '../../shared/constants/probabilityInfo';
import { TDS_ICON } from '../../shared/constants/tdsAssets';
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
    onPressVerify: () => void;
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
    onPressVerify,
}: MissionDetailScreenProps) {
    const isCompleted = status === 'completed';
    const isCoop = isCoopMission(mission);
    const rewardLabel = formatMissionIngredientReward(mission.id);
    const isFixedReward = MISSION_FIXED_REWARDS[mission.id] != null;
    const headerLine = locked
        ? '이전 공동 미션을 완료하면 열려요.'
        : '실천하고 사진으로 인증해요.';

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
                    <Asset.Icon
                        name={TDS_ICON.missionCamera}
                        frameShape={frameShape.CircleLarge}
                        backgroundColor={colors.primaryLight}
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
                                {`보상 · ${rewardLabel}`}
                            </Txt>
                            {isFixedReward ? null : (
                                <ProbabilityInfoButton
                                    title={MISSION_REWARD_PROBABILITY_TITLE}
                                    lines={MISSION_REWARD_PROBABILITY_LINES}
                                />
                            )}
                        </View>

                        <View style={styles.notice}>
                            <Txt typography="t7" color="grey600" style={styles.noticeText}>
                                {getAuthNotice(mission)}
                            </Txt>
                        </View>
                    </>
                )}
            </View>

            <View style={styles.cta}>
                <Button
                    size="large"
                    type="primary"
                    display="block"
                    disabled={isCompleted || locked || verifyLoading}
                    loading={verifyLoading}
                    onPress={onPressVerify}
                    accessibilityLabel={
                        locked ? '아직 잠겨 있어요' : isCompleted ? '이미 완료한 미션' : '인증하기'
                    }
                >
                    {locked
                        ? '아직 잠겨 있어요'
                        : isCompleted
                          ? '이미 완료한 미션'
                          : verifyLoading
                            ? '카메라 여는 중…'
                            : '인증하기'}
                </Button>
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
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
    noticeText: {
        lineHeight: 20,
    },
    cta: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 20,
        backgroundColor: colors.background,
    },
});
