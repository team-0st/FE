import { createRoute } from '@granite-js/react-native';
import { decodeSoupOutcome, type SoupRewardKind } from '@api/mock/soupRewardMock';
import { SoupResultScreen } from '../../src/features/soup/SoupResultScreen';
import { ROUTES } from '../../src/shared/constants/routes';

export const Route = createRoute('/soup/result', {
    component: Page,
    validateParams: (params: Readonly<object | undefined>): {
        recipeId: string;
        rewardKind: SoupRewardKind;
        rewardValue: string;
    } => {
        const p = params as { recipeId?: string; rewardKind?: string; rewardValue?: string } | undefined;
        const rewardKind = (p?.rewardKind ?? 'miss') as SoupRewardKind;
        return {
            recipeId: String(p?.recipeId ?? ''),
            rewardKind,
            rewardValue: String(p?.rewardValue ?? ''),
        };
    },
});

function Page() {
    const { recipeId, rewardKind, rewardValue } = Route.useParams();
    const navigation = Route.useNavigation();
    const outcome = decodeSoupOutcome(rewardKind, rewardValue);

    return (
        <SoupResultScreen
            recipeId={recipeId}
            outcome={outcome}
            onPressDone={() => navigation.replace(ROUTES.ingredients)}
        />
    );
}
