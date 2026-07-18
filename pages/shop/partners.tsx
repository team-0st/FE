import { createRoute } from '@granite-js/react-native';
import { PartnerShopsScreen } from '../../src/features/shop/PartnerShopsScreen';

export const Route = createRoute('/shop/partners', {
    component: Page,
});

function Page() {
    return <PartnerShopsScreen />;
}
