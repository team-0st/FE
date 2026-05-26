import { createRoute } from '@granite-js/react-native';
import { ShopSelectScreen } from '../../src/features/shop/ShopSelectScreen';
import { useUser } from '../../src/features/user/UserProvider';
import { ROUTES } from '../../src/shared/constants/routes';

export const Route = createRoute('/shop/select', {
    component: Page,
});

function Page() {
    const navigation = Route.useNavigation();
    const { state, selectShop } = useUser();

    return (
        <ShopSelectScreen
            initialShopId={state.shopId}
            onPressComplete={async (shopId) => {
                await selectShop(shopId);
                navigation.replace(ROUTES.profile);
            }}
        />
    );
}
