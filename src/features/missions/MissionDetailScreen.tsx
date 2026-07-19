import type { Mission } from '@api/mock';
import { isCoopMission } from '@api/mock/types';
import { Asset, Button, frameShape, Top, Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import { getMissionVerifyMessage } from '../../shared/constants/guideCopy';
import type { MissionProgressStatus } from '../user/types';
import { GuideHero } from '../../shared/ui/GuideHero';
import {
    MISSION_REWARD_PROBABILITY_LINES,
    MISSION_REWARD_PROBABILITY_TITLE,
} from '../../shared/constants/probabilityInfo';
import { formatMissionPoolHint } from '@api/mock/ingredients';
import { ProbabilityInfoRow } from '../../shared/ui/ProbabilityInfoRow';
import { RandomMissionRewardBadge } from '../../shared/ui/RandomMissionRewardBadge';
import { Screen } from '../../shared/ui/Screen';
import { TDS_ICON } from '../../shared/constants/tdsAssets';
import { colors } from '../../shared/theme/colors';
import { coopDifficultyLabel } from './coopMissionLogic';

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

    return (
        <Screen scrollable>
            <View style={styles.hero}>
                <Asset.Icon
                    name={TDS_ICON.missionCamera}
                    frameShape={frameShape.CircleLarge}
                    backgroundColor={colors.primaryLight}
                    accessibilityLabel={mission.title}
                />
                <Top
                    title={<Top.TitleParagraph size={22}>{mission.title}</Top.TitleParagraph>}
                    subtitle2={<Top.SubtitleParagraph>{mission.description}</Top.SubtitleParagraph>}
                />
            </View>
            {isCoop ? (
                <Txt typography="t7" color="grey600" style={styles.coopBadge}>
                    공동 미션 · {coopDifficultyLabel(mission.difficulty)}
                </Txt>
            ) : null}
            {locked ? (
                <GuideHero
                    message="이전 공동 미션을 완료하면 열려요."
                    mood="think"
                    align="start"
                    compact
                />
            ) : (
                <>
                    <GuideHero
                        message={getMissionVerifyMessage(mission.authHint)}
                        mood="think"
                        align="start"
                        compact
                    />
                    <RandomMissionRewardBadge />
                    <View style={styles.poolHint}>
                        <Txt typography="t7" color="grey600">
                            풀 후보: {formatMissionPoolHint(mission.id)}
                        </Txt>
                        <ProbabilityInfoRow
                            label="지급 확률"
                            title={MISSION_REWARD_PROBABILITY_TITLE}
                            lines={MISSION_REWARD_PROBABILITY_LINES}
                        />
                    </View>
                    <View style={styles.note}>
                        <Txt typography="t7" color="grey500">
                            {mission.authType === 'receipt'
                                ? '영수증 사진으로 인증해요.'
                                : mission.authType === 'attendance_7d'
                                  ? '7일 출석 후 1·4·7일차에 사진을 올려요. (파일럿 UI)'
                                  : '사진 업로드 후 검수가 끝나면 재료를 받아요.'}
                        </Txt>
                    </View>
                </>
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
    },
    coopBadge: {
        width: '100%',
        marginBottom: 8,
    },
    poolHint: {
        marginTop: 12,
        gap: 8,
        alignItems: 'flex-start',
    },
    note: {
        marginTop: 16,
        gap: 8,
    },
    cta: {
        marginTop: 24,
    },
});
