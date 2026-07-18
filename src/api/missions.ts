import { ApiClientError, apiRequest, isApiEnabled } from './client';
import { pickMissionRewardIngredient } from './mock/ingredients';
import { missionNumericId, toIngredientDto } from './notion/idMap';
import type {
    IngredientDto,
    MissionCompletionItem,
    MissionSummaryDto,
    MissionVerifyApprovedResponse,
    MissionVerifyPendingResponse,
} from './notion/types';
import { API_PATHS } from './notion/types';

export type MissionTodayStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | null;

export type { MissionCompletionItem, MissionVerifyApprovedResponse, MissionVerifyPendingResponse };

export type MissionVerifyResult =
    | {
          ok: true;
          data: MissionVerifyPendingResponse | MissionVerifyApprovedResponse;
          ingredientId?: string;
      }
    | {
          ok: false;
          code: 'NOT_FOUND' | 'MISSION_ALREADY_COMPLETED' | 'MISSION_UNDER_REVIEW' | 'NETWORK_ERROR';
      };

let completionSeq = 100;

const MISSION_VERIFY_PHOTO_STUB = 'https://zerost.local/mission-verify/pending-upload';

/** GET /api/v1/missions */
export async function getMissions(): Promise<MissionSummaryDto[] | null> {
    if (!isApiEnabled()) {
        return null;
    }
    return apiRequest<MissionSummaryDto[]>(API_PATHS.missions);
}

/** POST /api/v1/missions/{id}/verify — BE는 JSON `photoUrl` (업로드 API는 추후) */
export async function postMissionVerify(
    missionId: string,
    todayStatus: MissionTodayStatus,
    random: () => number = Math.random,
    photoUrl: string = MISSION_VERIFY_PHOTO_STUB,
): Promise<MissionVerifyResult> {
    const numericId = missionNumericId(missionId);

    if (isApiEnabled()) {
        if (numericId == null) {
            return { ok: false, code: 'NOT_FOUND' };
        }
        try {
            const data = await apiRequest<{ completionId: number; status: string }>(
                API_PATHS.missionVerify(numericId),
                {
                    method: 'POST',
                    body: { photoUrl },
                },
            );
            // BE 제출 직후는 PENDING. 승인·보상은 completions 폴링으로 반영.
            return {
                ok: true,
                data: {
                    completionId: data.completionId,
                    status: 'PENDING',
                },
            };
        } catch (error) {
            if (error instanceof ApiClientError) {
                if (error.code === 'MISSION_ALREADY_COMPLETED') {
                    return { ok: false, code: 'MISSION_ALREADY_COMPLETED' };
                }
                if (error.code === 'MISSION_UNDER_REVIEW') {
                    return { ok: false, code: 'MISSION_UNDER_REVIEW' };
                }
                if (error.code === 'MISSION_NOT_FOUND') {
                    return { ok: false, code: 'NOT_FOUND' };
                }
            }
            return { ok: false, code: 'NETWORK_ERROR' };
        }
    }

    await new Promise((r) => setTimeout(r, 120));
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

/** GET /api/v1/missions/completions */
export async function getMissionCompletions(): Promise<MissionCompletionItem[]> {
    if (!isApiEnabled()) {
        await new Promise((r) => setTimeout(r, 40));
        return [];
    }

    const items = await apiRequest<
        Array<{
            completionId: number;
            missionId: number;
            missionTitle: string;
            status: string;
            rewardedIngredient?: IngredientDto | null;
            submittedAt: string;
            reviewedAt?: string | null;
        }>
    >(API_PATHS.missionCompletions);

    return items.map((item) => ({
        completionId: item.completionId,
        missionId: item.missionId,
        missionTitle: item.missionTitle,
        status: item.status as MissionCompletionItem['status'],
        rewardedIngredient: item.rewardedIngredient ?? undefined,
        submittedAt: item.submittedAt,
        reviewedAt: item.reviewedAt ?? undefined,
    }));
}
