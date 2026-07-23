import { createRoute } from '@granite-js/react-native';
import { useState } from 'react';
import { LoginScreen } from '../src/features/auth/LoginScreen';
import { useUser } from '../src/features/user/UserProvider';
import { ROUTES } from '../src/shared/constants/routes';
import { LOGIN_FAILED_MESSAGE, NETWORK_ERROR_MESSAGE } from '../src/shared/feedback/messages';
import { useAppToast } from '../src/shared/feedback/useAppToast';
import {
    navigateHomeClearingOnboarding,
    useRedirectHomeIfOnboarded,
} from '../src/shared/navigation/onboardingNavigation';
import { CenterLoader } from '../src/shared/ui/CenterLoader';
import { Screen } from '../src/shared/ui/Screen';

export const Route = createRoute('/login', {
    component: Page,
});

function Page() {
    const navigation = Route.useNavigation();
    const { isReady, state, login } = useUser();
    const { showError } = useAppToast();
    const [submitting, setSubmitting] = useState(false);

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
        <LoginScreen
            submitting={submitting}
            onPressSignUp={() => navigation.replace(ROUTES.onboarding)}
            onSubmit={async ({ phoneDigits, password }) => {
                setSubmitting(true);
                try {
                    const result = await login(phoneDigits, password);
                    if (!result.ok) {
                        showError(
                            result.code === 'NETWORK_ERROR'
                                ? NETWORK_ERROR_MESSAGE
                                : LOGIN_FAILED_MESSAGE,
                        );
                        return;
                    }
                    if (result.onboardingCompleted) {
                        navigateHomeClearingOnboarding(navigation);
                        return;
                    }
                    navigation.replace(ROUTES.onboarding);
                } finally {
                    setSubmitting(false);
                }
            }}
        />
    );
}
