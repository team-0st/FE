import { createRoute } from '@granite-js/react-native';
import { OnboardingScreen } from '../../src/features/onboarding/OnboardingScreen';
import { ROUTES } from '../../src/shared/constants/routes';

export const Route = createRoute('/onboarding', {
    component: Page,
});

function Page() {
    const navigation = Route.useNavigation();

    return (
        <OnboardingScreen onPressStart={() => navigation.navigate(ROUTES.onboardingPractitioner)} />
    );
}
