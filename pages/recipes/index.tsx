import { createRoute } from '@granite-js/react-native';
import { RecipesScreen } from '../../src/features/recipes/RecipesScreen';
import { useMainTabPress } from '../../src/shared/hooks/useMainTabNavigation';
import { MainTabShell } from '../../src/shared/layout/MainTabShell';
import { mainTabScreenOptions } from '../../src/shared/navigation/tabTransition';
import { useRootBackClosesApp } from '../../src/shared/navigation/useRootBackClosesApp';

export const Route = createRoute('/recipes', {
    component: Page,
    screenOptions: () => mainTabScreenOptions(),
});

function Page() {
    const navigation = Route.useNavigation();
    const onPressTab = useMainTabPress(navigation, 'recipes');
    useRootBackClosesApp();

    return (
        <MainTabShell activeTab="recipes" onPressTab={onPressTab}>
            <RecipesScreen />
        </MainTabShell>
    );
}
