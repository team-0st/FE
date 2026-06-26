import type { Mission } from '@api/mock';
import { Button, Top, Txt } from '@toss/tds-react-native';
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

type MissionDetailScreenProps = {
    mission: Mission;
    status: MissionProgressStatus;
    onPressVerify: () => void;
};

export function MissionDetailScreen({ mission, status, onPressVerify }: MissionDetailScreenProps) {
    const isCompleted = status === 'completed';

    return (
        <Screen scrollable>
            <View style={styles.hero}>
                <Txt typography="t1">{mission.emoji}</Txt>
                <Top
                    title={<Top.TitleParagraph size={22}>{mission.title}</Top.TitleParagraph>}
                    subtitle2={<Top.SubtitleParagraph>{mission.description}</Top.SubtitleParagraph>}
                />
            </View>
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
                    사진 업로드 후 즉시 재료가 지급돼요. (노션 verify API)
                </Txt>
            </View>
            <View style={styles.cta}>
                <Button
                    size="large"
                    type="primary"
                    display="block"
                    disabled={isCompleted}
                    onPress={onPressVerify}
                >
                    {isCompleted ? '이미 완료한 미션' : '인증하기'}
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
