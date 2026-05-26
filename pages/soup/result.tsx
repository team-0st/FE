import { createRoute } from '@granite-js/react-native';
import { SoupResultScreen } from '../../src/features/soup/SoupResultScreen';
import { ROUTES } from '../../src/shared/constants/routes';

export const Route = createRoute('/soup/result', {
    component: Page,
    validateParams: (params: Readonly<object | undefined>): { recipeId: string } => ({
        recipeId: String((params as { recipeId?: string } | undefined)?.recipeId ?? ''),
    }),
});

function Page() {
    const { recipeId } = Route.useParams();
    const navigation = Route.useNavigation();

    return (
        <SoupResultScreen
            recipeId={recipeId}
            onPressDone={() => navigation.replace(ROUTES.ingredients)}
        />
    );
}
