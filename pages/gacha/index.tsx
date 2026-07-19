import { createRoute } from '@granite-js/react-native';
import { GachaScreen } from '../../src/features/gacha/GachaScreen';
import { useMainTabPress } from '../../src/shared/hooks/useMainTabNavigation';
import { MainTabShell } from '../../src/shared/layout/MainTabShell';
import { mainTabScreenOptions } from '../../src/shared/navigation/tabTransition';

export const Route = createRoute('/gacha', {
    component: Page,
    screenOptions: () => mainTabScreenOptions(),
});

function Page() {
    const navigation = Route.useNavigation();
    const onPressTab = useMainTabPress(navigation, 'gacha');

    return (
        <MainTabShell activeTab="gacha" onPressTab={onPressTab}>
            <GachaScreen />
        </MainTabShell>
    );
}
