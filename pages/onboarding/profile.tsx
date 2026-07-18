import { createRoute } from '@granite-js/react-native';
import {
    OnboardingProfileScreen,
    type OnboardingProfilePayload,
} from '../../src/features/onboarding/OnboardingProfileScreen';
import { useUser } from '../../src/features/user/UserProvider';
import { ROUTES } from '../../src/shared/constants/routes';
import { useRedirectHomeIfOnboarded } from '../../src/shared/navigation/onboardingNavigation';
import { CenterLoader } from '../../src/shared/ui/CenterLoader';
import { Screen } from '../../src/shared/ui/Screen';

export const Route = createRoute('/onboarding/profile', {
    component: Page,
});

function Page() {
    const navigation = Route.useNavigation();
    const { isReady, state, saveOnboardingProfile } = useUser();

    useRedirectHomeIfOnboarded(navigation, isReady, state.onboardingCompleted);

    const handleComplete = async (payload: OnboardingProfilePayload) => {
        await saveOnboardingProfile(payload);
        navigation.replace(ROUTES.onboardingShop);
    };

    if (!isReady) {
        return (
            <Screen>
                <CenterLoader />
            </Screen>
        );
    }

    if (state.onboardingCompleted) {
        return null;
    }

    return (
        <OnboardingProfileScreen initialNickname={state.nickname} onComplete={handleComplete} />
    );
}
