import { apiRequest, ApiClientError, isApiEnabled } from './client';
import { API_PATHS } from './notion/types';

export type AdminAssetType = 'ECO_JAM' | 'POINT';

export type AdminUserSummary = {
    userId: number;
    nickname: string | null;
    phoneNumber: string | null;
    onboardingCompleted: boolean;
    ecoJam: number;
    point: number;
};

export type AdminAssetGrantResult = {
    grantedUserCount: number;
    totalGrantedAmount: number;
    results: Array<{
        userId: number;
        grantedAmount: number;
        balanceAfter: number;
    }>;
};

/** GET /api/v1/admin/users — ADMIN만. 일반 유저는 null */
export async function getAdminUsers(): Promise<AdminUserSummary[] | null> {
    if (!isApiEnabled()) {
        return null;
    }
    try {
        return await apiRequest<AdminUserSummary[]>(API_PATHS.adminUsers);
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

/** POST /api/v1/admin/assets/grant */
export async function postAdminAssetGrant(params: {
    userIds: number[];
    assetType: AdminAssetType;
    amount: number;
}): Promise<AdminAssetGrantResult> {
    return apiRequest<AdminAssetGrantResult>(API_PATHS.adminAssetsGrant, {
        method: 'POST',
        body: params,
    });
}
