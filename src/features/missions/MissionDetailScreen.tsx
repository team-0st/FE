import type { Mission } from '@api/mock';
import { Button, Top, Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../../shared/ui/Screen';
import { colors } from '../../shared/theme/colors';

type MissionDetailScreenProps = {
    mission: Mission;
    onPressComplete: () => void;
};

export function MissionDetailScreen({ mission, onPressComplete }: MissionDetailScreenProps) {
    return (
        <Screen>
            <View style={styles.body}>
                <Top
                    title={<Top.TitleParagraph size={22}>{`${mission.emoji} ${mission.title}`}</Top.TitleParagraph>}
                    subtitle2={<Top.SubtitleParagraph>{mission.description}</Top.SubtitleParagraph>}
                />
                <View style={styles.card}>
                    <Txt typography="t5" fontWeight="semibold">
                        인증 방법 (MVP)
                    </Txt>
                    <Txt typography="t6" color="grey600" style={styles.cardText}>
                        사진 업로드·위치 인증은 BE 연동 후 연결됩니다. 지금은 완료 버튼으로 플로우만 확인해요.
                    </Txt>
                    <Txt typography="t4" fontWeight="bold" color="blue500">
                        +{mission.points}P
                    </Txt>
                </View>
            </View>
            <View style={styles.cta}>
                <Button
                    size="large"
                    type="primary"
                    display="block"
                    disabled={mission.completed}
                    onPress={onPressComplete}
                >
                    {mission.completed ? '이미 완료한 미션' : '미션 완료하기'}
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
    cta: {
        padding: 20,
    },
});
