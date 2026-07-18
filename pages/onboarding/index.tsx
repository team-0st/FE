import { createRoute } from '@granite-js/react-native';
import { OnboardingScreen } from '../../src/features/onboarding/OnboardingScreen';
import { useUser } from '../../src/features/user/UserProvider';
import { ROUTES } from '../../src/shared/constants/routes';
import { useRedirectHomeIfOnboarded } from '../../src/shared/navigation/onboardingNavigation';
import { CenterLoader } from '../../src/shared/ui/CenterLoader';
import { Screen } from '../../src/shared/ui/Screen';

export const Route = createRoute('/onboarding', {
    component: Page,
});

function Page() {
    const navigation = Route.useNavigation();
    const { isReady, state } = useUser();

    useRedirectHomeIfOnboarded(navigation, isReady, state.onboardingCompleted);

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
        <OnboardingScreen onPressStart={() => navigation.replace(ROUTES.onboardingProfile)} />
    );
}
