import type { Mission } from '@api/mock';
import { isCoopMission } from '@api/mock/types';
import { formatMissionIngredientReward, MISSION_FIXED_REWARDS } from '@api/mock/ingredients';
import { Asset, Button, frameShape, Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import { getMissionVerifyMessage } from '../../shared/constants/guideCopy';
import type { MissionProgressStatus } from '../user/types';
import { GuideHero } from '../../shared/ui/GuideHero';
import {
    MISSION_REWARD_PROBABILITY_LINES,
    MISSION_REWARD_PROBABILITY_TITLE,
} from '../../shared/constants/probabilityInfo';
import { ProbabilityInfoRow } from '../../shared/ui/ProbabilityInfoRow';
import { RandomMissionRewardBadge } from '../../shared/ui/RandomMissionRewardBadge';
import { Screen } from '../../shared/ui/Screen';
import { TDS_ICON } from '../../shared/constants/tdsAssets';
import { colors } from '../../shared/theme/colors';
import { coopDifficultyStars } from './coopMissionLogic';

/** 아이콘 카드 위/아래 여백 — 리뷰 반영: 55 → 36 (작은 기기 스크롤 부담 완화) */
const ICON_CARD_VERTICAL_PADDING = 36;

type MissionDetailScreenProps = {
    mission: Mission;
    status: MissionProgressStatus;
    locked?: boolean;
    onPressVerify: () => void;
};

export function MissionDetailScreen({
    mission,
    status,
    locked = false,
    onPressVerify,
}: MissionDetailScreenProps) {
    const isCompleted = status === 'completed';
    const isCoop = isCoopMission(mission);
    const rewardLabel = formatMissionIngredientReward(mission.id);
    // 특별 미션은 재료가 고정돼 있어요 (자연의 새싹, 에코 스타 등) — 랜덤 풀 안내는 그때만 보여줘요.
    // 리뷰 반영: 카피 문자열 비교 대신 고정 보상 맵 존재 여부로 판별해요.
    const isFixedReward = MISSION_FIXED_REWARDS[mission.id] != null;

    return (
        <Screen scrollable>
            <View style={styles.hero}>
                <View style={styles.heroGuide}>
                    {locked ? (
                        <GuideHero
                            message="이전 공동 미션을 완료하면 열려요."
                            mood="think"
                            align="start"
                            compact
                        />
                    ) : (
                        <GuideHero
                            message={getMissionVerifyMessage(mission.authHint)}
                            mood="think"
                            align="start"
                            compact
                        />
                    )}
                </View>
                <View style={styles.iconCard}>
                    <Asset.Icon
                        name={TDS_ICON.missionCamera}
                        frameShape={frameShape.CircleLarge}
                        backgroundColor={colors.primaryLight}
                        accessibilityLabel={mission.title}
                    />
                    {isCoop ? (
                        <Txt typography="t7" color="grey600">
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
            </View>

            {locked ? null : (
                <View style={styles.body}>
                    {isFixedReward ? (
                        <RandomMissionRewardBadge label={rewardLabel} subtitle="완료하면 확정으로 받아요" />
                    ) : (
                        <>
                            <RandomMissionRewardBadge />
                            <View style={styles.poolHint}>
                                <Txt typography="t7" color="grey600">
                                    완료하면 재료 풀에서 1종을 받아요.
                                </Txt>
                                <ProbabilityInfoRow
                                    label="지급 안내"
                                    title={MISSION_REWARD_PROBABILITY_TITLE}
                                    lines={MISSION_REWARD_PROBABILITY_LINES}
                                />
                            </View>
                        </>
                    )}
                    <View style={styles.note}>
                        <Txt typography="t7" color="grey600">
                            {mission.authType === 'receipt'
                                ? '영수증 사진으로 인증해요.'
                                : mission.authType === 'attendance_7d'
                                  ? '7일 출석 후 1·4·7일차에 사진을 올려요.'
                                  : '사진 업로드 후 검수가 끝나면 재료를 받아요.'}
                        </Txt>
                    </View>
                </View>
            )}

            <View style={styles.cta}>
                <Button
                    size="large"
                    type="primary"
                    display="block"
                    disabled={isCompleted || locked}
                    onPress={onPressVerify}
                >
                    {locked ? '아직 잠겨 있어요' : isCompleted ? '이미 완료한 미션' : '인증하기'}
                </Button>
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    hero: {
        alignItems: 'center',
        paddingTop: 8,
        gap: 16,
    },
    heroGuide: {
        width: '100%',
    },
    iconCard: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: ICON_CARD_VERTICAL_PADDING,
        paddingHorizontal: 24,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        gap: 8,
    },
    missionTitle: {
        textAlign: 'center',
    },
    missionDesc: {
        textAlign: 'center',
    },
    body: {
        marginTop: 16,
        gap: 16,
    },
    poolHint: {
        gap: 8,
        alignItems: 'flex-start',
    },
    note: {
        padding: 12,
        borderRadius: 12,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
    cta: {
        marginTop: 24,
    },
});
