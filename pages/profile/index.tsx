import { createRoute } from '@granite-js/react-native';
import { ProfileScreen } from '../../src/features/profile/ProfileScreen';
import { ROUTES } from '../../src/shared/constants/routes';

export const Route = createRoute('/profile', {
    component: Page,
});

function Page() {
    const navigation = Route.useNavigation();

    return <ProfileScreen onPressLogin={() => navigation.navigate(ROUTES.login)} />;
}
