import { ApiClientError, apiRequest, isApiEnabled } from './client';
import { uploadMissionVerifyPhoto, type MissionVerifyUploadInput } from './files';
import { pickMissionRewardIngredient } from './mock/ingredients';
import { ALL_MISSIONS, getMissionById } from './mock/missions';
import type { Mission } from './mock/types';
import {
    ingredientSlugFromNumeric,
    missionNumericId,
    toIngredientDto,
} from './notion/idMap';
import type {
    DailyMissionSectionsDto,
    MissionCompletionItem,
    MissionRewardClaimResponse,
    MissionSummaryDto,
    MissionVerifyApprovedResponse,
    MissionVerifyPendingResponse,
} from './notion/types';
import { API_PATHS } from './notion/types';
import { getCachedCommunityMission } from './communityMissions';

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

export type MissionClaimResult =
    | { ok: true; ingredientId: string; data: MissionRewardClaimResponse }
    | {
          ok: false;
          code:
              | 'NOT_FOUND'
              | 'MISSION_REWARD_CLAIM_NOT_AVAILABLE'
              | 'MISSION_REWARD_ALREADY_CLAIMED'
              | 'NETWORK_ERROR';
      };

let completionSeq = 100;
let cachedBeMissions: MissionSummaryDto[] | null = null;
let cachedSections: DailyMissionSectionsDto | null = null;

function normalizeMissionSummary(raw: MissionSummaryDto): MissionSummaryDto {
    return {
        id: Number(raw.id),
        title: raw.title,
        description: raw.description ?? null,
        imageUrl: raw.imageUrl ?? null,
        todayStatus: raw.todayStatus ?? null,
        rewardClaimable: Boolean(raw.rewardClaimable),
        rewardClaimed: Boolean(raw.rewardClaimed),
        rewardClaimedAt: raw.rewardClaimedAt ?? null,
    };
}

/** BE 미션 → FE slug (제목 정확/키워드 매칭, 없으면 be-{id}) */
export function resolveMissionSlugFromBe(dto: {
    id: number;
    title: string;
}): string {
    const title = dto.title.trim();
    const byTitle = ALL_MISSIONS.find((m) => m.title.trim() === title);
    if (byTitle != null) {
        return byTitle.id;
    }

    if (/텀블러/.test(title)) {
        return 'tumbler';
    }
    if (/장바구니/.test(title)) {
        return 'bag';
    }
    if (/다회용/.test(title)) {
        return 'reusable';
    }
    if (/분리\s*배출|분리수거|재활용/.test(title)) {
        return 'recycle';
    }
    if (/대중교통|교통카드|버스|지하철/.test(title)) {
        return 'transit';
    }
    if (/배달|포장/.test(title)) {
        return 'pickup-not-delivery';
    }
    if (/알맹/.test(title)) {
        return 'almang-visit';
    }
    if (/리필/.test(title)) {
        return 'refill-station';
    }
    if (/플로깅/.test(title)) {
        return 'plogging';
    }

    return `be-${dto.id}`;
}

export function missionFromBeSummary(dto: MissionSummaryDto): Mission {
    const slug = resolveMissionSlugFromBe(dto);
    const mock = getMissionById(slug);
    return {
        id: slug,
        title: dto.title,
        description: dto.description ?? mock?.description ?? '',
        points: mock?.points ?? 20,
        emoji: mock?.emoji ?? '📷',
        authHint: mock?.authHint ?? '사진 1장',
        authType: mock?.authType ?? 'photo',
    };
}

function flattenSections(sections: DailyMissionSectionsDto): MissionSummaryDto[] {
    const list = [...sections.generalMissions];
    if (sections.specialMission != null) {
        list.push(sections.specialMission);
    }
    return list;
}

/** GET /api/v1/missions — 섹션 응답 */
export async function getDailyMissionSections(): Promise<DailyMissionSectionsDto | null> {
    if (!isApiEnabled()) {
        return null;
    }
    const raw = await apiRequest<DailyMissionSectionsDto>(API_PATHS.missions);
    const sections: DailyMissionSectionsDto = {
        generalMissions: (raw.generalMissions ?? []).map(normalizeMissionSummary),
        specialMission:
            raw.specialMission != null
                ? normalizeMissionSummary(raw.specialMission)
                : null,
    };
    cachedSections = sections;
    cachedBeMissions = flattenSections(sections);
    return sections;
}

/** flat 목록 (verify id 해석·캐시용) */
export async function getMissions(): Promise<MissionSummaryDto[] | null> {
    if (!isApiEnabled()) {
        return null;
    }
    if (cachedBeMissions != null) {
        return cachedBeMissions;
    }
    const sections = await getDailyMissionSections();
    return sections != null ? flattenSections(sections) : null;
}

export function getCachedDailyMissionSections(): DailyMissionSectionsDto | null {
    return cachedSections;
}

/** 상세·네비용 — mock + BE 캐시 (+ 공동 미션 `community-{id}`) */
export function getMissionForUi(id: string): Mission | undefined {
    const local = getMissionById(id);
    if (local != null) {
        return local;
    }
    const community = getCachedCommunityMission(id);
    if (community != null) {
        return community;
    }
    const list =
        cachedBeMissions ??
        flattenSections(cachedSections ?? { generalMissions: [], specialMission: null });
    const match = list.find((item) => resolveMissionSlugFromBe(item) === id);
    return match != null ? missionFromBeSummary(match) : undefined;
}

/**
 * BE 미션 id 해석: 캐시 제목/slug 매칭 → 일일 슬러그 폴백.
 */
async function resolveBackendMissionId(slug: string): Promise<number | undefined> {
    const beKey = /^be-(\d+)$/.exec(slug);
    if (beKey != null) {
        return Number(beKey[1]);
    }

    const fe = getMissionById(slug);
    try {
        const list = cachedBeMissions ?? (await getMissions());
        if (list != null && fe != null) {
            const byTitle = list.find(
                (item) => item.title.trim() === fe.title.trim(),
            );
            if (byTitle != null) {
                return byTitle.id;
            }
        }
        if (list != null) {
            const bySlug = list.find(
                (item) => resolveMissionSlugFromBe(item) === slug,
            );
            if (bySlug != null) {
                return bySlug.id;
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

/** POST /api/v1/missions/completions/{id}/claim */
export async function postMissionRewardClaim(
    completionId: number,
): Promise<MissionClaimResult> {
    if (!isApiEnabled()) {
        return { ok: false, code: 'NETWORK_ERROR' };
    }
    try {
        const data = await apiRequest<MissionRewardClaimResponse>(
            API_PATHS.missionRewardClaim(completionId),
            { method: 'POST' },
        );
        const ingredientId =
            ingredientSlugFromNumeric(data.rewardedIngredient.id) ??
            `be-${data.rewardedIngredient.id}`;
        return { ok: true, ingredientId, data };
    } catch (error) {
        if (error instanceof ApiClientError) {
            if (error.code === 'MISSION_COMPLETION_NOT_FOUND') {
                return { ok: false, code: 'NOT_FOUND' };
            }
            if (error.code === 'MISSION_REWARD_CLAIM_NOT_AVAILABLE') {
                return { ok: false, code: 'MISSION_REWARD_CLAIM_NOT_AVAILABLE' };
            }
            if (error.code === 'MISSION_REWARD_ALREADY_CLAIMED') {
                return { ok: false, code: 'MISSION_REWARD_ALREADY_CLAIMED' };
            }
        }
        return { ok: false, code: 'NETWORK_ERROR' };
    }
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
            rewardClaimable?: boolean;
            rewardClaimed?: boolean;
            rewardedIngredient?: {
                id: number;
                name: string;
                imageUrl: string | null;
            } | null;
            submittedAt: string;
            reviewedAt?: string | null;
            rewardClaimedAt?: string | null;
        }>
    >(API_PATHS.missionCompletions);

    return items.map((item) => ({
        completionId: item.completionId,
        missionId: item.missionId,
        missionTitle: item.missionTitle,
        status: item.status as MissionCompletionItem['status'],
        rewardClaimable: Boolean(item.rewardClaimable),
        rewardClaimed: Boolean(item.rewardClaimed),
        rewardedIngredient: item.rewardedIngredient ?? undefined,
        submittedAt: item.submittedAt,
        reviewedAt: item.reviewedAt ?? undefined,
        rewardClaimedAt: item.rewardClaimedAt ?? undefined,
    }));
}
