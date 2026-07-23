import { ApiClientError, apiRequest, isApiEnabled } from './client';
import { API_PATHS } from './notion/types';

export type AdminTesterLink = {
    shareUrl: string;
    deepLink: string | null;
    deploymentId: string | null;
    tossShareUrl: string | null;
    updatedAt: string | null;
};

export type CurrentTesterLink = {
    deepLink: string | null;
    deploymentId: string | null;
    tossShareUrl: string | null;
};

/** GET /api/v1/admin/tester-link — ADMIN만. 일반 유저는 null */
export async function getAdminTesterLink(): Promise<AdminTesterLink | null> {
    if (!isApiEnabled()) {
        return null;
    }
    try {
        return await apiRequest<AdminTesterLink>(API_PATHS.adminTesterLink);
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

/** PUT /api/v1/admin/tester-link */
export async function putAdminTesterLink(params: {
    deepLink: string;
    tossShareUrl: string;
}): Promise<AdminTesterLink> {
    return apiRequest<AdminTesterLink>(API_PATHS.adminTesterLink, {
        method: 'PUT',
        body: params,
    });
}

/** GET /api/v1/tester-link/current (공개) */
export async function getCurrentTesterLink(): Promise<CurrentTesterLink | null> {
    if (!isApiEnabled()) {
        return null;
    }
    return apiRequest<CurrentTesterLink>(API_PATHS.testerLinkCurrent, {
        withAuth: false,
    });
}
