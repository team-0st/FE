import { createRoute } from '@granite-js/react-native';
import { ShopSelectScreen } from '../../src/features/shop/ShopSelectScreen';
import { useUser } from '../../src/features/user/UserProvider';
import {
    navigateHomeClearingOnboarding,
    useRedirectHomeIfOnboarded,
} from '../../src/shared/navigation/onboardingNavigation';
import {
    ONBOARDING_SYNC_FAILED_MESSAGE,
    REGISTER_FAILED_MESSAGE,
} from '../../src/shared/feedback/messages';
import { useAppToast } from '../../src/shared/feedback/useAppToast';
import { CenterLoader } from '../../src/shared/ui/CenterLoader';
import { Screen } from '../../src/shared/ui/Screen';

export const Route = createRoute('/onboarding/shop', {
    component: Page,
});

function Page() {
    const navigation = Route.useNavigation();
    const { isReady, state, finishOnboarding } = useUser();
    const { showError } = useAppToast();

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
        <ShopSelectScreen
            initialShopId={state.shopId}
            onboarding
            onPressComplete={async (shopId) => {
                const result = await finishOnboarding(shopId);
                if (!result.ok) {
                    showError(
                        result.code === 'NOT_READY'
                            ? REGISTER_FAILED_MESSAGE
                            : ONBOARDING_SYNC_FAILED_MESSAGE,
                    );
                    return;
                }
                navigateHomeClearingOnboarding(navigation);
            }}
        />
    );
}
