import { pickMissionRewardIngredient } from './mock/ingredients';

export type MissionApproveResult =
    | { ok: true; ingredientId: string }
    | { ok: false; code: 'NOT_FOUND' | 'ALREADY_COMPLETED' };

/** BE `POST /missions/:id/approve` mock */
export async function postMissionApprove(
    missionId: string,
    random: () => number = Math.random,
): Promise<MissionApproveResult> {
    await new Promise((r) => setTimeout(r, 120));
    const ingredientId = pickMissionRewardIngredient(missionId, random);
    if (ingredientId == null) {
        return { ok: false, code: 'NOT_FOUND' };
    }
    return { ok: true, ingredientId };
}
