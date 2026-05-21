import type { Mission } from '@api/mock';
import { missionStatusLabel } from '@api/mock/missions';
import { Button, Top, Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import { getMissionVerifyMessage } from '../../shared/constants/guideCopy';
import type { MissionProgressStatus } from '../user/types';
import { GuideDialogue } from '../../shared/ui/GuideDialogue';
import { RewardPointsBadge } from '../../shared/ui/RewardPointsBadge';
import { Screen } from '../../shared/ui/Screen';

type MissionDetailScreenProps = {
    mission: Mission;
    status: MissionProgressStatus;
    onPressVerify: () => void;
};

export function MissionDetailScreen({ mission, status, onPressVerify }: MissionDetailScreenProps) {
    const isCompleted = status === 'completed';
    const isPending = status === 'pending_review';

    return (
        <Screen scrollable>
            <View style={styles.hero}>
                <Txt typography="t1">{mission.emoji}</Txt>
                <Top
                    title={<Top.TitleParagraph size={22}>{mission.title}</Top.TitleParagraph>}
                    subtitle2={<Top.SubtitleParagraph>{mission.description}</Top.SubtitleParagraph>}
                />
            </View>
            <GuideDialogue message={getMissionVerifyMessage(mission.authHint)} mood="think" compact />
            <RewardPointsBadge points={mission.points} />
            <View style={styles.note}>
                <Txt typography="t7" color="grey500">
                    사진 업로드·위치 인증은 BE 연동 후 연결할 예정이에요. 지금은 인증 화면에서 데모로 제출해요.
                </Txt>
                {isPending ? (
                    <Txt typography="t6" color="grey600" style={styles.status}>
                        {missionStatusLabel(status)}
                    </Txt>
                ) : null}
            </View>
            <View style={styles.cta}>
                <Button
                    size="large"
                    type="primary"
                    display="block"
                    disabled={isCompleted || isPending}
                    onPress={onPressVerify}
                >
                    {isCompleted ? '이미 완료한 미션' : isPending ? '검수 중' : '인증하기'}
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
    note: {
        marginTop: 16,
        gap: 8,
    },
    status: {
        marginTop: 4,
    },
    cta: {
        marginTop: 24,
    },
});
