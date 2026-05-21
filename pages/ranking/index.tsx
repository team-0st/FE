import { createRoute } from '@granite-js/react-native';
import { RankingScreen } from '../../src/features/ranking/RankingScreen';
import { useMainTabPress } from '../../src/shared/hooks/useMainTabNavigation';
import { MainTabShell } from '../../src/shared/layout/MainTabShell';

export const Route = createRoute('/ranking', {
    component: Page,
});

function Page() {
    const navigation = Route.useNavigation();
    const onPressTab = useMainTabPress(navigation);

    return (
        <MainTabShell activeTab="ranking" onPressTab={onPressTab}>
            <RankingScreen />
        </MainTabShell>
    );
}
