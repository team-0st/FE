import { ApiClientError, apiRequest, isApiEnabled } from './client';
import { uploadMissionVerifyPhoto, type MissionVerifyUploadInput } from './files';
import { pickMissionRewardIngredient } from './mock/ingredients';
import { getMissionById } from './mock/missions';
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
          code:
              | 'NOT_FOUND'
              | 'MISSION_ALREADY_COMPLETED'
              | 'MISSION_UNDER_REVIEW'
              | 'INVALID_FILE_TYPE'
              | 'INVALID_PHOTO'
              | 'FILE_TOO_LARGE'
              | 'NETWORK_ERROR';
      };

let completionSeq = 100;
let cachedBeMissions: MissionSummaryDto[] | null = null;

/** GET /api/v1/missions */
export async function getMissions(): Promise<MissionSummaryDto[] | null> {
    if (!isApiEnabled()) {
        return null;
    }
    const list = await apiRequest<MissionSummaryDto[]>(API_PATHS.missions);
    cachedBeMissions = list;
    return list;
}

/**
 * BE 미션 id 해석: 제목 매칭 우선 → 일일 미션(1~6) 슬러그 폴백.
 * 특별/공동은 BE에 없어 undefined (예전 ALL_MISSIONS 순번 7+ 버그 방지).
 */
async function resolveBackendMissionId(slug: string): Promise<number | undefined> {
    const fe = getMissionById(slug);
    if (fe == null) {
        return undefined;
    }

    try {
        const list = cachedBeMissions ?? (await getMissions());
        if (list != null) {
            const byTitle = list.find((item) => item.title.trim() === fe.title.trim());
            if (byTitle != null) {
                return byTitle.id;
            }
        }
    } catch {
        // 폴백
    }

    return missionNumericId(slug);
}

/**
 * POST /api/v1/files/upload → POST /api/v1/missions/{id}/verify `{ photoKey }`
 * mock(API 비활성): DEV면 즉시 APPROVED, 아니면 PENDING
 */
export async function postMissionVerify(
    missionId: string,
    todayStatus: MissionTodayStatus,
    photo: MissionVerifyUploadInput | null = null,
    random: () => number = Math.random,
): Promise<MissionVerifyResult> {
    if (isApiEnabled()) {
        const numericId = await resolveBackendMissionId(missionId);
        if (numericId == null) {
            if (__DEV__) {
                console.warn(
                    '[postMissionVerify] no BE mission for slug',
                    missionId,
                );
            }
            return { ok: false, code: 'NOT_FOUND' };
        }
        if (photo == null) {
            return { ok: false, code: 'NETWORK_ERROR' };
        }
        try {
            const uploaded = await uploadMissionVerifyPhoto(numericId, photo);
            if (__DEV__) {
                console.warn('[postMissionVerify] uploaded', uploaded.fileKey);
            }
            const data = await apiRequest<{ completionId: number; status: string }>(
                API_PATHS.missionVerify(numericId),
                {
                    method: 'POST',
                    body: { photoKey: uploaded.fileKey },
                },
            );
            return {
                ok: true,
                data: {
                    completionId: data.completionId,
                    status: 'PENDING',
                },
            };
        } catch (error) {
            if (error instanceof ApiClientError) {
                // Provider에서 재등록·재시도
                if (error.code === 'USER_NOT_FOUND') {
                    throw error;
                }
                if (error.code === 'MISSION_ALREADY_COMPLETED') {
                    return { ok: false, code: 'MISSION_ALREADY_COMPLETED' };
                }
                if (error.code === 'MISSION_UNDER_REVIEW') {
                    return { ok: false, code: 'MISSION_UNDER_REVIEW' };
                }
                if (error.code === 'MISSION_NOT_FOUND') {
                    if (__DEV__) {
                        console.warn(
                            '[postMissionVerify] MISSION_NOT_FOUND',
                            missionId,
                            'beId=',
                            numericId,
                        );
                    }
                    return { ok: false, code: 'NOT_FOUND' };
                }
                if (error.code === 'INVALID_FILE_TYPE') {
                    return { ok: false, code: 'INVALID_FILE_TYPE' };
                }
                if (error.code === 'FILE_TOO_LARGE') {
                    return { ok: false, code: 'FILE_TOO_LARGE' };
                }
                if (
                    error.code === 'INVALID_INPUT_VALUE' ||
                    error.code === 'INVALID_FILE_KEY'
                ) {
                    return { ok: false, code: 'INVALID_PHOTO' };
                }
            }
            if (__DEV__) {
                console.warn(
                    '[postMissionVerify]',
                    error instanceof ApiClientError
                        ? `${error.code} ${error.message} status=${error.status}`
                        : error,
                );
            }
            return { ok: false, code: 'NETWORK_ERROR' };
        }
    }

    const numericId = missionNumericId(missionId);
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
