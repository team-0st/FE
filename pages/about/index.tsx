import { createRoute } from '@granite-js/react-native';
import { AboutZerostScreen } from '../../src/features/about/AboutZerostScreen';

export const Route = createRoute('/about', {
    component: Page,
});

function Page() {
    return <AboutZerostScreen />;
}
