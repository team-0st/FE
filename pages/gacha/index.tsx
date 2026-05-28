import { createRoute } from '@granite-js/react-native';
import { GachaScreen } from '../../src/features/gacha/GachaScreen';
import { useMainTabPress } from '../../src/shared/hooks/useMainTabNavigation';
import { MainTabShell } from '../../src/shared/layout/MainTabShell';

export const Route = createRoute('/gacha', {
    component: Page,
});

function Page() {
    const navigation = Route.useNavigation();
    const onPressTab = useMainTabPress(navigation);

    return (
        <MainTabShell activeTab="gacha" onPressTab={onPressTab}>
            <GachaScreen />
        </MainTabShell>
    );
}
