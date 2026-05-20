import { Button, Top, Txt } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import { APP_DISPLAY_NAME } from '../../shared/constants/app';
import { Screen } from '../../shared/ui/Screen';
import { colors } from '../../shared/theme/colors';

type OnboardingScreenProps = {
    onPressStart: () => void;
};

export function OnboardingScreen({ onPressStart }: OnboardingScreenProps) {
    return (
        <Screen>
            <View style={styles.body}>
                <Top
                    title={
                        <Top.TitleParagraph size={28} color={colors.textPrimary}>
                            {`${APP_DISPLAY_NAME}에\n오신 걸 환영해요`}
                        </Top.TitleParagraph>
                    }
                    subtitle2={
                        <Top.SubtitleParagraph>
                            짧은 질문으로 맞춤 안내를 준비해요. 팀 선택과는 별도예요.
                        </Top.SubtitleParagraph>
                    }
                />
                <View style={styles.summary}>
                    <Txt typography="t6" color="grey600" style={styles.summaryText}>
                        제로웨이스트를 이미 실천 중인지, 관심은 있었는지 등 현재 상황을 알려주시면
                        이후 미션·안내에 반영할 수 있어요.
                    </Txt>
                </View>
            </View>
            <View style={styles.cta}>
                <Button size="large" type="primary" display="block" onPress={onPressStart}>
                    시작하기
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
    },
    summary: {
        marginTop: 24,
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: colors.border,
    },
    summaryText: {
        textAlign: 'center',
        lineHeight: 22,
    },
    cta: {
        padding: 20,
    },
});
