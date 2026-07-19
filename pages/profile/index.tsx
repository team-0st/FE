import { createRoute } from '@granite-js/react-native';
import { ProfileScreen } from '../../src/features/profile/ProfileScreen';
import { useUser } from '../../src/features/user/UserProvider';
import { useMainTabPress } from '../../src/shared/hooks/useMainTabNavigation';
import { MainTabShell } from '../../src/shared/layout/MainTabShell';
import { mainTabScreenOptions } from '../../src/shared/navigation/tabTransition';
import { ROUTES } from '../../src/shared/constants/routes';

export const Route = createRoute('/profile', {
    component: Page,
    screenOptions: () => mainTabScreenOptions(),
});

function Page() {
    const navigation = Route.useNavigation();
    const onPressTab = useMainTabPress(navigation, 'profile');
    const { resetOnboarding } = useUser();

    return (
        <MainTabShell activeTab="profile" onPressTab={onPressTab}>
            <ProfileScreen
                onPressChangeShop={() => navigation.navigate(ROUTES.shopSelect)}
                onPressRestartOnboarding={
                    __DEV__
                        ? () => {
                              void (async () => {
                                  await resetOnboarding();
                                  navigation.replace(ROUTES.onboarding);
                              })();
                          }
                        : undefined
                }
            />
        </MainTabShell>
    );
}
