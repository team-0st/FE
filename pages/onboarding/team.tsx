import { createRoute } from '@granite-js/react-native';
import { TeamSelectScreen } from '../../src/features/onboarding/TeamSelectScreen';
import { ROUTES } from '../../src/shared/constants/routes';

export const Route = createRoute('/onboarding/team', {
    component: Page,
});

function Page() {
    const navigation = Route.useNavigation();

    return <TeamSelectScreen onPressComplete={() => navigation.navigate(ROUTES.home)} />;
}
