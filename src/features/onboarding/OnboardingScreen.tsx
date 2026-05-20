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
                            십이지신 띠 팀에 합류해 미션을 수행하고, 주간 랭킹으로 함께 성장해요.
                        </Top.SubtitleParagraph>
                    }
                />
                <View style={styles.summary}>
                    <Txt typography="t6" color="grey600" style={styles.summaryText}>
                        출석·미션·팀 활동을 한곳에서 기록하고, 주간 실천 현황을 확인할 수 있어요.
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
