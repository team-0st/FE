import { createRoute } from '@granite-js/react-native';
import { TeamScreen } from '../../src/features/team/TeamScreen';
import { useMainTabPress } from '../../src/shared/hooks/useMainTabNavigation';
import { MainTabShell } from '../../src/shared/layout/MainTabShell';
import { ROUTES } from '../../src/shared/constants/routes';

export const Route = createRoute('/team', {
    component: Page,
});

function Page() {
    const navigation = Route.useNavigation();
    const onPressTab = useMainTabPress(navigation);

    return (
        <MainTabShell activeTab="team" onPressTab={onPressTab}>
            <TeamScreen onPressSelectTeam={() => navigation.navigate(ROUTES.teamSelect)} />
        </MainTabShell>
    );
}
