import { createRoute } from '@granite-js/react-native';
import { decodeSoupCraftFromRoute } from '@api/mock/soupCraftMock';
import { SoupResultScreen } from '../../src/features/soup/SoupResultScreen';
import { ROUTES } from '../../src/shared/constants/routes';

export const Route = createRoute('/soup/result', {
    component: Page,
    validateParams: (params: Readonly<object | undefined>): {
        recipeId: string;
        soupId: string;
        result: string;
        rewardType: string;
        rewardAmount: string;
        rewardDescription: string;
    } => {
        const p = params as {
            recipeId?: string;
            soupId?: string;
            result?: string;
            rewardType?: string;
            rewardAmount?: string;
            rewardDescription?: string;
        } | undefined;
        return {
            recipeId: String(p?.recipeId ?? ''),
            soupId: String(p?.soupId ?? ''),
            result: String(p?.result ?? 'FAIL'),
            rewardType: String(p?.rewardType ?? ''),
            rewardAmount: String(p?.rewardAmount ?? '0'),
            rewardDescription: String(p?.rewardDescription ?? ''),
        };
    },
});

function Page() {
    const params = Route.useParams();
    const navigation = Route.useNavigation();
    const craft = decodeSoupCraftFromRoute(params);

    return (
        <SoupResultScreen
            recipeId={params.recipeId}
            craft={craft}
            onPressDone={() => navigation.replace(ROUTES.ingredients)}
        />
    );
}
