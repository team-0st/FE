import { pickMissionRewardIngredient } from './mock/ingredients';
import { missionNumericId, toIngredientDto } from './notion/idMap';
import type { IngredientDto } from './notion/types';

export type MissionTodayStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | null;

export type MissionVerifyPendingResponse = {
    completionId: number;
    status: 'PENDING';
};

export type MissionVerifyApprovedResponse = {
    completionId: number;
    status: 'APPROVED';
    rewardedIngredient: IngredientDto;
};

export type MissionCompletionItem = {
    completionId: number;
    missionId: number;
    missionTitle: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    rewardedIngredient?: IngredientDto;
    submittedAt: string;
    reviewedAt?: string;
};

export type MissionVerifyResult =
    | { ok: true; data: MissionVerifyPendingResponse | MissionVerifyApprovedResponse; ingredientId?: string }
    | { ok: false; code: 'NOT_FOUND' | 'MISSION_ALREADY_COMPLETED' | 'MISSION_UNDER_REVIEW' };

let completionSeq = 100;

/** POST /api/missions/{id}/verify — 노션 명세 (PENDING, DEV에서 자동 승인) */
export async function postMissionVerify(
    missionId: string,
    todayStatus: MissionTodayStatus,
    random: () => number = Math.random,
): Promise<MissionVerifyResult> {
    await new Promise((r) => setTimeout(r, 120));
    const numericId = missionNumericId(missionId);
    if (numericId == null) {
        return { ok: false, code: 'NOT_FOUND' };
    }
    if (todayStatus === 'APPROVED') {
        return { ok: false, code: 'MISSION_ALREADY_COMPLETED' };
    }
    if (todayStatus === 'PENDING') {
        return { ok: false, code: 'MISSION_UNDER_REVIEW' };
    }
    const completionId = completionSeq + 1;
    completionSeq += 1;
    if (__DEV__) {
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
                completionId,
                status: 'APPROVED',
                rewardedIngredient: dto,
            },
            ingredientId: ingredientSlug,
        };
    }
    return {
        ok: true,
        data: {
            completionId,
            status: 'PENDING',
        },
    };
}

/** GET /api/missions/completions — mock */
export async function getMissionCompletions(): Promise<MissionCompletionItem[]> {
    await new Promise((r) => setTimeout(r, 40));
    return [];
}
