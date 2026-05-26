import { createRoute } from '@granite-js/react-native';
import { RecipesScreen } from '../../src/features/recipes/RecipesScreen';
import { useMainTabPress } from '../../src/shared/hooks/useMainTabNavigation';
import { MainTabShell } from '../../src/shared/layout/MainTabShell';

export const Route = createRoute('/recipes', {
    component: Page,
});

function Page() {
    const navigation = Route.useNavigation();
    const onPressTab = useMainTabPress(navigation);

    return (
        <MainTabShell activeTab="recipes" onPressTab={onPressTab}>
            <RecipesScreen />
        </MainTabShell>
    );
}
