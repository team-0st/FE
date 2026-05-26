import { createRoute } from '@granite-js/react-native';
import { MissionsListScreen } from '../../src/features/missions/MissionsListScreen';
import { navigateMissionDetail, ROUTES } from '../../src/shared/constants/routes';

export const Route = createRoute('/missions', {
    component: Page,
});

function Page() {
    const navigation = Route.useNavigation();

    return (
        <MissionsListScreen
            onPressBack={() => navigation.replace(ROUTES.home)}
            onPressMission={(id) => navigateMissionDetail(navigation, id)}
        />
    );
}
