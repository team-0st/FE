import { Button } from '@toss/tds-react-native';
import { ONBOARDING_GUIDE } from '../../shared/constants/guideCopy';
import { CenterStage } from '../../shared/ui/CenterStage';
import { GuideHero } from '../../shared/ui/GuideHero';
import { Screen } from '../../shared/ui/Screen';

type OnboardingScreenProps = {
    onPressStart: () => void;
};

export function OnboardingScreen({ onPressStart }: OnboardingScreenProps) {
    return (
        <Screen>
            <CenterStage
                footer={
                    <Button size="large" type="primary" display="block" onPress={onPressStart}>
                        시작하기
                    </Button>
                }
            >
                <GuideHero message={ONBOARDING_GUIDE.intro} mood="cheer" size="hero" animate />
            </CenterStage>
        </Screen>
    );
}
