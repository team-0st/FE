import { ApiClientError, apiRequest, isApiEnabled } from './client';
import type { MissionVerifyUploadInput } from './files';
import { uploadCommunityMissionPhoto } from './files';
import type { CoopMission } from './mock/types';
import {
    API_PATHS,
    type CommunityMissionProgressDto,
} from './notion/types';

type GetCommunityMissionsOptions = {
    signal?: AbortSignal;
};

/** BE CommunityMissionProofRequirementResponse 기준 */
export type CommunityProofRequirementDto = {
    requirementId: number;
    proofOrder: number;
    title: string | null;
    description: string | null;
    requiredImageCount: number;
    submitted: boolean;
    reviewStatus: string | null;
};

export type CommunityMissionDetailDto = CommunityMissionProgressDto & {
    proofRequirements: CommunityProofRequirementDto[];
};

export type CompleteCommunityMissionResult = {
    completionId: number;
    communityMissionId: number;
    succeeded: boolean;
    rewardGranted: boolean;
    rewardedEcoJam: number;
    rewardedIngredients: Array<{
        id: number;
        name: string;
        imageUrl: string | null;
    }>;
    completedAt: string;
};

export type CommunityProofSubmitResult =
    | { ok: true; pending: true }
    | {
          ok: false;
          code:
              | 'NOT_FOUND'
              | 'LOCKED'
              | 'ALREADY_DONE'
              | 'INVALID_PHOTO'
              | 'NETWORK_ERROR'
              | string;
      };

const communityMissionUiCache = new Map<string, CoopMission>();
let cachedCommunityList: CommunityMissionProgressDto[] | null = null;

function difficultyFromBe(raw: string): 1 | 2 | 3 {
    const upper = raw.toUpperCase();
    if (upper.includes('THREE') || upper.includes('3')) {
        return 3;
    }
    if (upper.includes('TWO') || upper.includes('2')) {
        return 2;
    }
    return 1;
}

export function communityMissionRouteId(beId: number): string {
    return `community-${beId}`;
}

export function parseCommunityMissionRouteId(id: string): number | null {
    const match = /^community-(\d+)$/.exec(id);
    if (match == null) {
        return null;
    }
    return Number(match[1]);
}

export function communityToCoopMission(dto: CommunityMissionProgressDto): CoopMission {
    const mission: CoopMission = {
        id: communityMissionRouteId(dto.id),
        kind: 'coop',
        title: dto.title,
        description: dto.description ?? '',
        points: 40,
        emoji: '🤝',
        authHint: '사진 인증',
        authType: 'photo',
        difficulty: difficultyFromBe(dto.difficulty),
        unlockAfter: null,
    };
    communityMissionUiCache.set(mission.id, mission);
    return mission;
}

export function getCachedCommunityMission(id: string): CoopMission | undefined {
    return communityMissionUiCache.get(id);
}

export function communityProgressStatus(
    dto: CommunityMissionProgressDto,
): 'available' | 'pending_review' | 'claimable' | 'completed' {
    if (dto.completed || dto.succeeded) {
        return 'completed';
    }
    if (dto.readyToComplete) {
        return 'claimable';
    }
    if (dto.submittedProofCount > dto.approvedProofCount) {
        return 'pending_review';
    }
    return 'available';
}

/** GET /api/v1/community-missions */
export async function getCommunityMissions(
    options: GetCommunityMissionsOptions = {},
): Promise<CommunityMissionProgressDto[] | null> {
    if (!isApiEnabled()) {
        return null;
    }
    const list = await apiRequest<CommunityMissionProgressDto[]>(
        API_PATHS.communityMissions,
        {
            signal: options.signal,
        },
    );
    cachedCommunityList = list;
    for (const item of list) {
        communityToCoopMission(item);
    }
    return list;
}

export function getCachedCommunityMissions(): CommunityMissionProgressDto[] | null {
    return cachedCommunityList;
}

/** GET /api/v1/community-missions/{id} */
export async function getCommunityMissionDetail(
    communityMissionId: number,
): Promise<CommunityMissionDetailDto | null> {
    if (!isApiEnabled()) {
        return null;
    }
    const raw = await apiRequest<CommunityMissionDetailDto>(
        API_PATHS.communityMissionDetail(communityMissionId),
    );
    const detail = {
        ...raw,
        proofRequirements: (raw.proofRequirements ?? []).map((req) => ({
            requirementId: Number(req.requirementId),
            proofOrder: Number(req.proofOrder ?? 0),
            title: req.title ?? null,
            description: req.description ?? null,
            requiredImageCount: Number(req.requiredImageCount ?? 1),
            submitted: Boolean(req.submitted),
            reviewStatus: req.reviewStatus ?? null,
        })),
    };
    communityToCoopMission(detail);
    return detail;
}

/** POST .../proofs/{requirementId} */
export async function submitCommunityMissionProof(
    communityMissionId: number,
    requirementId: number,
    photoKeys: string[],
): Promise<{ ok: true } | { ok: false; code: string }> {
    if (!isApiEnabled()) {
        return { ok: false, code: 'NETWORK_ERROR' };
    }
    try {
        await apiRequest(
            API_PATHS.communityMissionProof(communityMissionId, requirementId),
            {
                method: 'POST',
                body: { photoKeys },
            },
        );
        return { ok: true };
    } catch (error) {
        if (error instanceof ApiClientError) {
            return { ok: false, code: error.code };
        }
        return { ok: false, code: 'NETWORK_ERROR' };
    }
}

/** POST .../complete — A안 보상 수령 */
export async function completeCommunityMission(
    communityMissionId: number,
): Promise<
    | { ok: true; data: CompleteCommunityMissionResult }
    | { ok: false; code: string }
> {
    if (!isApiEnabled()) {
        return { ok: false, code: 'NETWORK_ERROR' };
    }
    try {
        const data = await apiRequest<CompleteCommunityMissionResult>(
            API_PATHS.communityMissionComplete(communityMissionId),
            { method: 'POST' },
        );
        return { ok: true, data };
    } catch (error) {
        if (error instanceof ApiClientError) {
            return { ok: false, code: error.code };
        }
        return { ok: false, code: 'NETWORK_ERROR' };
    }
}

/**
 * 다음 미제출 인증 단계에 사진 업로드 + proof 제출.
 * 한 번에 카메라 1장만 받는 MVP — requiredImageCount>1이면 같은 키를 채우지 않고 1장만 허용 시 실패 방지:
 * requiredImageCount만큼 동일 사진 키를 반복 제출하지 않고, 1장만 필요한 단계만 처리.
 * 다장 필요 시 동일 사진을 반복 업로드해 키를 채운다(임시).
 */
export async function submitCommunityMissionPhotoProof(
    communityMissionId: number,
    photo: MissionVerifyUploadInput,
): Promise<CommunityProofSubmitResult> {
    if (!isApiEnabled()) {
        return { ok: false, code: 'NETWORK_ERROR' };
    }
    try {
        const detail = await getCommunityMissionDetail(communityMissionId);
        if (detail == null) {
            return { ok: false, code: 'NOT_FOUND' };
        }
        if (!detail.unlocked) {
            return { ok: false, code: 'LOCKED' };
        }
        if (detail.completed) {
            return { ok: false, code: 'ALREADY_DONE' };
        }
        const nextReq = [...detail.proofRequirements]
            .sort((a, b) => a.proofOrder - b.proofOrder)
            .find((req) => !req.submitted);
        if (nextReq == null) {
            if (detail.readyToComplete) {
                return { ok: false, code: 'ALREADY_DONE' };
            }
            return { ok: false, code: 'NOT_FOUND' };
        }
        const need = Math.max(1, nextReq.requiredImageCount);
        const keys: string[] = [];
        for (let i = 0; i < need; i += 1) {
            const uploaded = await uploadCommunityMissionPhoto(
                communityMissionId,
                photo,
            );
            keys.push(uploaded.fileKey);
        }
        const submitted = await submitCommunityMissionProof(
            communityMissionId,
            nextReq.requirementId,
            keys,
        );
        if (!submitted.ok) {
            return { ok: false, code: submitted.code };
        }
        return { ok: true, pending: true };
    } catch (error) {
        if (error instanceof ApiClientError) {
            if (
                error.code === 'INVALID_FILE_TYPE' ||
                error.code === 'INVALID_INPUT_VALUE' ||
                error.code === 'INVALID_FILE_KEY'
            ) {
                return { ok: false, code: 'INVALID_PHOTO' };
            }
            return { ok: false, code: error.code };
        }
        return { ok: false, code: 'NETWORK_ERROR' };
    }
}
