import { createRoute } from '@granite-js/react-native';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { HomeScreen } from '../src/features/home/HomeScreen';
import { useUser } from '../src/features/user/UserProvider';
import { useMainTabPress } from '../src/shared/hooks/useMainTabNavigation';
import { MainTabShell } from '../src/shared/layout/MainTabShell';
import { navigateMissionDetail, ROUTES } from '../src/shared/constants/routes';
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
            <HomeScreen
                onPressMissions={() => navigation.navigate(ROUTES.missions)}
                onPressMission={(id) => navigateMissionDetail(navigation, id)}
                onPressShop={() => navigation.replace(ROUTES.shop)}
            />
        </MainTabShell>
    );
}
