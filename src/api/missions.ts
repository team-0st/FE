import { pickMissionRewardIngredient } from './mock/ingredients';
import { missionNumericId, toIngredientDto } from './notion/idMap';
import type { MissionVerifyResponse } from './notion/types';

export type MissionVerifyResult =
    | { ok: true; data: MissionVerifyResponse; ingredientId: string }
    | { ok: false; code: 'NOT_FOUND' | 'MISSION_ALREADY_COMPLETED' };

/** POST /api/missions/{id}/verify — 사진 업로드 후 즉시 완료 (노션 명세) */
export async function postMissionVerify(
    missionId: string,
    isAlreadyCompleted: boolean,
    random: () => number = Math.random,
): Promise<MissionVerifyResult> {
    await new Promise((r) => setTimeout(r, 120));
    const numericId = missionNumericId(missionId);
    if (numericId == null) {
        return { ok: false, code: 'NOT_FOUND' };
    }
    if (isAlreadyCompleted) {
        return { ok: false, code: 'MISSION_ALREADY_COMPLETED' };
    }
    const ingredientSlug = pickMissionRewardIngredient(missionId, random);
    if (ingredientSlug == null) {
        return { ok: false, code: 'NOT_FOUND' };
    }
    const dto = toIngredientDto(ingredientSlug);
    if (dto == null) {
        return { ok: false, code: 'NOT_FOUND' };
    }
    return {
        ok: true,
        data: {
            missionId: numericId,
            rewardedIngredient: dto,
        },
        ingredientId: ingredientSlug,
    };
}
