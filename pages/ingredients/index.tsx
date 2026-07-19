import { createRoute } from '@granite-js/react-native';
import { IngredientsScreen } from '../../src/features/ingredients/IngredientsScreen';
import { useMainTabPress } from '../../src/shared/hooks/useMainTabNavigation';
import { MainTabShell } from '../../src/shared/layout/MainTabShell';
import { mainTabScreenOptions } from '../../src/shared/navigation/tabTransition';
import { navigateSoupResult } from '../../src/shared/constants/routes';

export const Route = createRoute('/ingredients', {
    component: Page,
    screenOptions: () => mainTabScreenOptions(),
});

function Page() {
    const navigation = Route.useNavigation();
    const onPressTab = useMainTabPress(navigation, 'ingredients');

    return (
        <MainTabShell activeTab="ingredients" onPressTab={onPressTab}>
            <IngredientsScreen
                onSoupMade={(recipeId, outcome) => navigateSoupResult(navigation, recipeId, outcome)}
            />
        </MainTabShell>
    );
}
