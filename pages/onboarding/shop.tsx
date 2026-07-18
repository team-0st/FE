import { createRoute } from '@granite-js/react-native';
import { ShopSelectScreen } from '../../src/features/shop/ShopSelectScreen';
import { useUser } from '../../src/features/user/UserProvider';
import { navigateHomeClearingOnboarding, useRedirectHomeIfOnboarded } from '../../src/shared/navigation/onboardingNavigation';
import { CenterLoader } from '../../src/shared/ui/CenterLoader';
import { Screen } from '../../src/shared/ui/Screen';

export const Route = createRoute('/onboarding/shop', {
    component: Page,
});

function Page() {
    const navigation = Route.useNavigation();
    const { isReady, state, finishOnboarding } = useUser();

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
                await finishOnboarding(shopId);
                navigateHomeClearingOnboarding(navigation);
            }}
        />
    );
}
