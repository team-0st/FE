import { createRoute } from '@granite-js/react-native';
import { TeamSelectScreen } from '../../src/features/onboarding/TeamSelectScreen';
import { useUser } from '../../src/features/user/UserProvider';
import { ROUTES } from '../../src/shared/constants/routes';

export const Route = createRoute('/team/select', {
    component: Page,
});

function Page() {
    const navigation = Route.useNavigation();
    const { state, selectTeam } = useUser();

    return (
        <TeamSelectScreen
            initialTeamId={state.teamId}
            onPressComplete={async (teamId) => {
                await selectTeam(teamId);
                navigation.navigate(ROUTES.team);
            }}
        />
    );
}
