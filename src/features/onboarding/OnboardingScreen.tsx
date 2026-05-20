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
                            짧은 미션으로 제로웨이스트를 기록하고, 팀과 함께 성장해요.
                        </Top.SubtitleParagraph>
                    }
                />
                <View style={styles.hero}>
                    <Txt typography="t1">🌱</Txt>
                    <Txt typography="t6" color="grey600" style={styles.heroText}>
                        고양이마을처럼 재미있게, 토스 안에서는 깔끔하게.
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
    hero: {
        marginTop: 32,
        backgroundColor: colors.heroTint,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
    },
    heroText: {
        marginTop: 12,
        textAlign: 'center',
    },
    cta: {
        padding: 20,
    },
});
