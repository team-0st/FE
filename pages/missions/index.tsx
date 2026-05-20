import { createRoute } from '@granite-js/react-native';
import { MissionsListScreen } from '../../src/features/missions/MissionsListScreen';
import { navigateMissionDetail } from '../../src/shared/constants/routes';

export const Route = createRoute('/missions', {
    component: Page,
});

function Page() {
    const navigation = Route.useNavigation();

    return (
        <MissionsListScreen onPressMission={(id) => navigateMissionDetail(navigation, id)} />
    );
}
