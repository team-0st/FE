import { createRoute } from '@granite-js/react-native';
import { IngredientsScreen } from '../../src/features/ingredients/IngredientsScreen';
import { useMainTabPress } from '../../src/shared/hooks/useMainTabNavigation';
import { MainTabShell } from '../../src/shared/layout/MainTabShell';
import { navigateSoupResult } from '../../src/shared/constants/routes';

export const Route = createRoute('/ingredients', {
    component: Page,
});

function Page() {
    const navigation = Route.useNavigation();
    const onPressTab = useMainTabPress(navigation);

    return (
        <MainTabShell activeTab="ingredients" onPressTab={onPressTab}>
            <IngredientsScreen
                onSoupMade={(recipeId, outcome) => navigateSoupResult(navigation, recipeId, outcome)}
            />
        </MainTabShell>
    );
}
