import { createRoute } from '@granite-js/react-native';
import { TeamScreen } from '../../src/features/team/TeamScreen';

export const Route = createRoute('/team', {
    component: Page,
});

function Page() {
    return <TeamScreen />;
}
