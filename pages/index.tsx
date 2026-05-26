import { createRoute } from '@granite-js/react-native';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { WitchSoupHomeScreen } from '../src/features/home/WitchSoupHomeScreen';
import { useUser } from '../src/features/user/UserProvider';
import { useMainTabPress } from '../src/shared/hooks/useMainTabNavigation';
import { MainTabShell } from '../src/shared/layout/MainTabShell';
import { ROUTES } from '../src/shared/constants/routes';
import { Screen } from '../src/shared/ui/Screen';

export const Route = createRoute('/', {
    component: Page,
});

function Page() {
    const navigation = Route.useNavigation();
    const onPressTab = useMainTabPress(navigation);
    const { isReady, state } = useUser();

    useEffect(() => {
        if (isReady && !state.onboardingCompleted) {
            navigation.replace(ROUTES.onboarding);
        }
    }, [isReady, navigation, state.onboardingCompleted]);

    if (!isReady) {
        return (
            <Screen>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator />
                </View>
            </Screen>
        );
    }

    if (!state.onboardingCompleted) {
        return null;
    }

    return (
        <MainTabShell activeTab="home" onPressTab={onPressTab}>
            <WitchSoupHomeScreen onPressMissions={() => navigation.navigate(ROUTES.missions)} />
        </MainTabShell>
    );
}
