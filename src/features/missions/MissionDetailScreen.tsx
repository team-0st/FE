import type { Mission } from '@api/mock';
import { missionStatusLabel } from '@api/mock/missions';
import { Button, Top, Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import type { MissionProgressStatus } from '../user/types';
import { Screen } from '../../shared/ui/Screen';
import { colors } from '../../shared/theme/colors';

type MissionDetailScreenProps = {
    mission: Mission;
    status: MissionProgressStatus;
    onPressVerify: () => void;
};

export function MissionDetailScreen({ mission, status, onPressVerify }: MissionDetailScreenProps) {
    const isCompleted = status === 'completed';
    const isPending = status === 'pending_review';

    return (
        <Screen>
            <View style={styles.body}>
                <Top
                    title={<Top.TitleParagraph size={22}>{`${mission.emoji} ${mission.title}`}</Top.TitleParagraph>}
                    subtitle2={<Top.SubtitleParagraph>{mission.description}</Top.SubtitleParagraph>}
                />
                <View style={styles.card}>
                    <Txt typography="t5" fontWeight="semibold">
                        인증 안내
                    </Txt>
                    <Txt typography="t6" color="grey600" style={styles.cardText}>
                        {mission.authHint}
                    </Txt>
                    <Txt typography="t7" color="grey500">
                        사진 업로드·위치 인증은 BE 연동 후 연결됩니다. 지금은 인증 화면에서 데모로 제출해요.
                    </Txt>
                    <Txt typography="t4" fontWeight="bold" color="blue500" style={styles.points}>
                        +{mission.points}P
                    </Txt>
                    {isPending ? (
                        <Txt typography="t6" color="grey600" style={styles.status}>
                            {missionStatusLabel(status)}
                        </Txt>
                    ) : null}
                </View>
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
    body: {
        flex: 1,
        paddingHorizontal: 20,
    },
    card: {
        marginTop: 16,
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: colors.border,
    },
    cardText: {
        marginVertical: 12,
    },
    points: {
        marginTop: 12,
    },
    status: {
        marginTop: 8,
    },
    cta: {
        padding: 20,
    },
});
