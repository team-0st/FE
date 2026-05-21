import { Button } from '@toss/tds-react-native';
import { StyleSheet, View } from 'react-native';
import { ONBOARDING_GUIDE } from '../../shared/constants/guideCopy';
import { GuideDialogue } from '../../shared/ui/GuideDialogue';
import { Screen } from '../../shared/ui/Screen';

type OnboardingScreenProps = {
    onPressStart: () => void;
};

export function OnboardingScreen({ onPressStart }: OnboardingScreenProps) {
    return (
        <Screen>
            <View style={styles.body}>
                <GuideDialogue message={ONBOARDING_GUIDE.intro} mood="cheer" />
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
        paddingTop: 24,
        justifyContent: 'center',
    },
    cta: {
        padding: 20,
    },
});
