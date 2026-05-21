import { createRoute } from '@granite-js/react-native';
import { MissionsListScreen } from '../../src/features/missions/MissionsListScreen';
import { useMainTabPress } from '../../src/shared/hooks/useMainTabNavigation';
import { MainTabShell } from '../../src/shared/layout/MainTabShell';
import { navigateMissionDetail } from '../../src/shared/constants/routes';

export const Route = createRoute('/missions', {
    component: Page,
});

function Page() {
    const navigation = Route.useNavigation();
    const onPressTab = useMainTabPress(navigation);

    return (
        <MainTabShell activeTab="missions" onPressTab={onPressTab}>
            <MissionsListScreen onPressMission={(id) => navigateMissionDetail(navigation, id)} />
        </MainTabShell>
    );
}
