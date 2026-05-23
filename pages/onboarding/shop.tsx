import { createRoute } from '@granite-js/react-native';
import { ShopSelectScreen } from '../../src/features/shop/ShopSelectScreen';
import { useUser } from '../../src/features/user/UserProvider';
import { ROUTES } from '../../src/shared/constants/routes';

export const Route = createRoute('/onboarding/shop', {
    component: Page,
});

function Page() {
    const navigation = Route.useNavigation();
    const { state, finishOnboarding } = useUser();

    return (
        <ShopSelectScreen
            initialShopId={state.shopId}
            onboarding
            onPressComplete={async (shopId) => {
                await finishOnboarding(shopId);
                navigation.replace(ROUTES.home);
            }}
        />
    );
}
