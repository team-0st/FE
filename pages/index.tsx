import { createRoute } from '@granite-js/react-native';
import { HomeScreen } from '../src/features/home/HomeScreen';
import { navigateMissionDetail, ROUTES } from '../src/shared/constants/routes';

export const Route = createRoute('/', {
    component: Page,
});

function Page() {
    const navigation = Route.useNavigation();

    return (
        <HomeScreen
            onPressMissions={() => navigation.navigate(ROUTES.missions)}
            onPressMission={(id) => navigateMissionDetail(navigation, id)}
            onPressTeam={() => navigation.navigate(ROUTES.team)}
            onPressRanking={() => navigation.navigate(ROUTES.ranking)}
            onPressProfile={() => navigation.navigate(ROUTES.profile)}
            onPressOnboarding={() => navigation.navigate(ROUTES.onboarding)}
        />
    );
}
