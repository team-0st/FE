import { createRoute } from '@granite-js/react-native';
import { ProfileScreen } from '../../src/features/profile/ProfileScreen';
import { useMainTabPress } from '../../src/shared/hooks/useMainTabNavigation';
import { MainTabShell } from '../../src/shared/layout/MainTabShell';

export const Route = createRoute('/profile', {
    component: Page,
});

function Page() {
    const navigation = Route.useNavigation();
    const onPressTab = useMainTabPress(navigation);

    return (
        <MainTabShell activeTab="profile" onPressTab={onPressTab}>
            <ProfileScreen />
        </MainTabShell>
    );
}
