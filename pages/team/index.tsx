import { createRoute } from '@granite-js/react-native';
import { TeamScreen } from '../../src/features/team/TeamScreen';
import { ROUTES } from '../../src/shared/constants/routes';

export const Route = createRoute('/team', {
    component: Page,
});

function Page() {
    const navigation = Route.useNavigation();

    return (
        <TeamScreen onPressSelectTeam={() => navigation.navigate(ROUTES.teamSelect)} />
    );
}
