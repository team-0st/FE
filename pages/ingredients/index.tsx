import { createRoute } from '@granite-js/react-native';
import { useMainTabsHostBindings } from '../../src/shared/hooks/useMainTabsHostBindings';
import { MainTabsHost } from '../../src/shared/layout/MainTabsHost';
import { mainTabScreenOptions } from '../../src/shared/navigation/tabTransition';
import { useRootBackClosesApp } from '../../src/shared/navigation/useRootBackClosesApp';

export const Route = createRoute('/ingredients', {
    component: Page,
    screenOptions: () => mainTabScreenOptions(),
});

function Page() {
    const navigation = Route.useNavigation();
    const bindings = useMainTabsHostBindings(navigation);
    useRootBackClosesApp();

    return <MainTabsHost initialTab="ingredients" {...bindings} />;
}
