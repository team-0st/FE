import { createRoute } from '@granite-js/react-native';
import { ShopScreen } from '../../src/features/shop/ShopScreen';
import { useMainTabPress } from '../../src/shared/hooks/useMainTabNavigation';
import { MainTabShell } from '../../src/shared/layout/MainTabShell';
import { ROUTES } from '../../src/shared/constants/routes';

export const Route = createRoute('/shop', {
    component: Page,
});

function Page() {
    const navigation = Route.useNavigation();
    const onPressTab = useMainTabPress(navigation);

    return (
        <MainTabShell activeTab="shop" onPressTab={onPressTab}>
            <ShopScreen onPressSelectShop={() => navigation.navigate(ROUTES.shopSelect)} />
        </MainTabShell>
    );
}
