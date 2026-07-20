import { createRoute } from '@granite-js/react-native';
import { useState } from 'react';
import { decodeSoupCraftFromRoute } from '@api/mock/soupCraftMock';
import type { SoupCraftResponse } from '@api/notion/types';
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
        rewardGrade: string;
        rewardIngredientId: string;
    } => {
        const p = params as {
            recipeId?: string;
            soupId?: string;
            result?: string;
            rewardType?: string;
            rewardAmount?: string;
            rewardDescription?: string;
            rewardGrade?: string;
            rewardIngredientId?: string;
        } | undefined;
        return {
            recipeId: String(p?.recipeId ?? ''),
            soupId: String(p?.soupId ?? ''),
            result: String(p?.result ?? 'FAIL'),
            rewardType: String(p?.rewardType ?? ''),
            rewardAmount: String(p?.rewardAmount ?? '0'),
            rewardDescription: String(p?.rewardDescription ?? ''),
            rewardGrade: String(p?.rewardGrade ?? ''),
            rewardIngredientId: String(p?.rewardIngredientId ?? ''),
        };
    },
});

function Page() {
    const params = Route.useParams();
    const navigation = Route.useNavigation();
    const initial = decodeSoupCraftFromRoute(params);
    const [craft, setCraft] = useState<SoupCraftResponse>(initial);

    return (
        <SoupResultScreen
            recipeId={params.recipeId}
            craft={craft}
            onCraftUpdated={setCraft}
            onPressDone={() => navigation.replace(ROUTES.ingredients)}
        />
    );
}
