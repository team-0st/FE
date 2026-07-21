import { createRoute } from '@granite-js/react-native';
import { useEffect } from 'react';
import { CenterLoader } from '../src/shared/ui/CenterLoader';
import { useUser } from '../src/features/user/UserProvider';
import { useMainTabsHostBindings } from '../src/shared/hooks/useMainTabsHostBindings';
import { MainTabsHost } from '../src/shared/layout/MainTabsHost';
import { mainTabScreenOptions } from '../src/shared/navigation/tabTransition';
import { useRootBackClosesApp } from '../src/shared/navigation/useRootBackClosesApp';
import { ROUTES } from '../src/shared/constants/routes';
import { Screen } from '../src/shared/ui/Screen';

export const Route = createRoute('/', {
    component: Page,
    screenOptions: () => mainTabScreenOptions(),
});

function Page() {
    const navigation = Route.useNavigation();
    const bindings = useMainTabsHostBindings(navigation);
    const { isReady, state } = useUser();
    useRootBackClosesApp();

    useEffect(() => {
        if (isReady && !state.onboardingCompleted) {
            navigation.replace(ROUTES.onboarding);
        }
    }, [isReady, navigation, state.onboardingCompleted]);

    if (!isReady) {
        return (
            <Screen>
                <CenterLoader />
            </Screen>
        );
    }

    if (!state.onboardingCompleted) {
        return null;
    }

    return <MainTabsHost initialTab="home" {...bindings} />;
}
