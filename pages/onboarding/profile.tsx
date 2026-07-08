import { createRoute } from '@granite-js/react-native';
import {
    OnboardingProfileScreen,
    type OnboardingProfilePayload,
} from '../../src/features/onboarding/OnboardingProfileScreen';
import { useUser } from '../../src/features/user/UserProvider';
import { ROUTES } from '../../src/shared/constants/routes';

export const Route = createRoute('/onboarding/profile', {
    component: Page,
});

function Page() {
    const navigation = Route.useNavigation();
    const { state, saveOnboardingProfile } = useUser();

    const handleComplete = async (payload: OnboardingProfilePayload) => {
        await saveOnboardingProfile(payload);
        navigation.navigate(ROUTES.onboardingShop);
    };

    return (
        <OnboardingProfileScreen initialNickname={state.nickname} onComplete={handleComplete} />
    );
}
