import { createRoute } from '@granite-js/react-native';
import { RankingScreen } from '../../src/features/ranking/RankingScreen';

export const Route = createRoute('/ranking', {
    component: Page,
});

function Page() {
    return <RankingScreen />;
}
