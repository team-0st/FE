import { apiRequest, ApiClientError, isApiEnabled } from './client';
import { API_PATHS } from './notion/types';

export type AdminReviewStatus = 'APPROVED' | 'REJECTED';

export type AdminMissionPendingItem = {
    completionId: number;
    userId: number;
    userNickname: string | null;
    missionId: number;
    missionTitle: string;
    photoKey: string;
    /** BE 추가 예정 — 있으면 미리보기에 우선 사용 */
    photoUrl?: string | null;
    submittedAt: string;
};

export type AdminMissionReviewedItem = AdminMissionPendingItem & {
    status: AdminReviewStatus;
    reviewedAt: string | null;
};

export type AdminCommunityProofPendingItem = {
    proofId: number;
    communityMissionId: number;
    communityMissionTitle: string;
    requirementId: number;
    proofOrder: number;
    requirementTitle: string | null;
    userId: number;
    nickname: string | null;
    submittedAt: string;
    imageKeys: string[];
    /** BE 추가 예정 — 있으면 미리보기에 우선 사용 */
    imageUrls?: string[] | null;
};

export type AdminCommunityProofReviewedItem = AdminCommunityProofPendingItem & {
    status: AdminReviewStatus;
    reviewedAt: string | null;
};

type CommunityPendingPage = {
    items: AdminCommunityProofPendingItem[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
};

type CommunityReviewedPage = {
    items: AdminCommunityProofReviewedItem[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
};

/** BE 공개 에셋 베이스 — photoKey 폴백용 (현재 미션 경로는 403일 수 있음). */
export const PUBLIC_ASSETS_BASE_URL = 'https://assets.zero-st.com';

export function publicAssetUrl(fileKey: string): string {
    const trimmed = fileKey.trim().replace(/^\//, '');
    return `${PUBLIC_ASSETS_BASE_URL}/${trimmed}`;
}

/** 일일 검수 — photoUrl 우선, 없으면 key로 폴백 */
export function resolveDailyReviewPhotoUri(item: AdminMissionPendingItem): string | null {
    const url = item.photoUrl?.trim();
    if (url != null && url.length > 0) {
        return url;
    }
    if (item.photoKey.trim().length > 0) {
        return publicAssetUrl(item.photoKey);
    }
    return null;
}

/** 공동 검수 — imageUrls 우선, 없으면 imageKeys 폴백 */
export function resolveCommunityReviewPhotoUris(
    item: AdminCommunityProofPendingItem,
): string[] {
    const urls = (item.imageUrls ?? [])
        .map((u) => u.trim())
        .filter((u) => u.length > 0);
    if (urls.length > 0) {
        return urls;
    }
    return item.imageKeys
        .map((k) => k.trim())
        .filter((k) => k.length > 0)
        .map(publicAssetUrl);
}

function bySubmittedAtAsc<T extends { submittedAt: string }>(a: T, b: T): number {
    return a.submittedAt.localeCompare(b.submittedAt);
}

/** GET /api/v1/admin/missions/completions/pending — ADMIN만. 일반 유저는 null */
export async function getAdminMissionCompletionsPending(): Promise<
    AdminMissionPendingItem[] | null
> {
    if (!isApiEnabled()) {
        return null;
    }
    try {
        const items = await apiRequest<AdminMissionPendingItem[]>(
            API_PATHS.adminMissionCompletionsPending,
        );
        return [...items].sort(bySubmittedAtAsc);
    } catch (error) {
        if (
            error instanceof ApiClientError &&
            (error.status === 403 || error.code === 'ADMIN_ACCESS_DENIED')
        ) {
            return null;
        }
        throw error;
    }
}

/** GET /api/v1/admin/missions/completions/reviewed */
export async function getAdminMissionCompletionsReviewed(): Promise<
    AdminMissionReviewedItem[] | null
> {
    if (!isApiEnabled()) {
        return null;
    }
    try {
        const items = await apiRequest<AdminMissionReviewedItem[]>(
            API_PATHS.adminMissionCompletionsReviewed,
        );
        return [...items].sort((a, b) => {
            const aKey = a.reviewedAt ?? a.submittedAt;
            const bKey = b.reviewedAt ?? b.submittedAt;
            return bKey.localeCompare(aKey);
        });
    } catch (error) {
        if (
            error instanceof ApiClientError &&
            (error.status === 403 || error.code === 'ADMIN_ACCESS_DENIED')
        ) {
            return null;
        }
        if (
            error instanceof ApiClientError &&
            (error.status === 404 || error.code === 'RESOURCE_NOT_FOUND')
        ) {
            return [];
        }
        throw error;
    }
}

/** POST /api/v1/admin/missions/completions/{id}/review */
export async function postAdminMissionCompletionReview(
    completionId: number,
    status: AdminReviewStatus,
): Promise<{ completionId: number; status: string }> {
    return apiRequest(API_PATHS.adminMissionCompletionReview(completionId), {
        method: 'POST',
        body: { status },
    });
}

/** GET /api/v1/admin/community-missions/proofs/pending */
export async function getAdminCommunityProofsPending(params?: {
    page?: number;
    size?: number;
}): Promise<CommunityPendingPage | null> {
    if (!isApiEnabled()) {
        return null;
    }
    const page = params?.page ?? 0;
    const size = params?.size ?? 50;
    const path = `${API_PATHS.adminCommunityProofsPending}?page=${page}&size=${size}`;
    try {
        const data = await apiRequest<CommunityPendingPage>(path);
        return {
            ...data,
            items: [...(data.items ?? [])].sort(bySubmittedAtAsc),
        };
    } catch (error) {
        if (
            error instanceof ApiClientError &&
            (error.status === 403 || error.code === 'ADMIN_ACCESS_DENIED')
        ) {
            return null;
        }
        throw error;
    }
}

/** GET /api/v1/admin/community-missions/proofs/reviewed */
export async function getAdminCommunityProofsReviewed(params?: {
    page?: number;
    size?: number;
}): Promise<CommunityReviewedPage | null> {
    if (!isApiEnabled()) {
        return null;
    }
    const page = params?.page ?? 0;
    const size = params?.size ?? 50;
    const path = `${API_PATHS.adminCommunityProofsReviewed}?page=${page}&size=${size}`;
    try {
        const data = await apiRequest<CommunityReviewedPage>(path);
        return {
            ...data,
            items: [...(data.items ?? [])].sort((a, b) => {
                const aKey = a.reviewedAt ?? a.submittedAt;
                const bKey = b.reviewedAt ?? b.submittedAt;
                return bKey.localeCompare(aKey);
            }),
        };
    } catch (error) {
        if (
            error instanceof ApiClientError &&
            (error.status === 403 || error.code === 'ADMIN_ACCESS_DENIED')
        ) {
            return null;
        }
        if (
            error instanceof ApiClientError &&
            (error.status === 404 || error.code === 'RESOURCE_NOT_FOUND')
        ) {
            return {
                items: [],
                page,
                size,
                totalElements: 0,
                totalPages: 0,
                hasNext: false,
            };
        }
        throw error;
    }
}

/** POST /api/v1/admin/community-missions/proofs/{proofId}/review */
export async function postAdminCommunityProofReview(
    proofId: number,
    status: AdminReviewStatus,
): Promise<{ proofId: number; status: string }> {
    return apiRequest(API_PATHS.adminCommunityProofReview(proofId), {
        method: 'POST',
        body: { status },
    });
}
