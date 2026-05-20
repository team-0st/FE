import { createRoute } from '@granite-js/react-native';
import { ProfileScreen } from '../../src/features/profile/ProfileScreen';

export const Route = createRoute('/profile', {
    component: Page,
});

function Page() {
    return <ProfileScreen />;
}
