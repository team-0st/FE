import { createRoute } from '@granite-js/react-native';
import { ProfileScreen } from '../../src/features/profile/ProfileScreen';
import { useUser } from '../../src/features/user/UserProvider';
import { useMainTabPress } from '../../src/shared/hooks/useMainTabNavigation';
import { MainTabShell } from '../../src/shared/layout/MainTabShell';
import { ROUTES } from '../../src/shared/constants/routes';

export const Route = createRoute('/profile', {
    component: Page,
});

function Page() {
    const navigation = Route.useNavigation();
    const onPressTab = useMainTabPress(navigation);
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
