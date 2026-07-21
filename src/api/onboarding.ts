import { apiRequest, isApiEnabled } from './client';
import { API_PATHS, type OnboardingCompleteResponse } from './notion/types';

export type OnboardingCompleteRequest = {
    nickname: string;
    /** `010-1234-5678` */
    phoneNumber: string;
    password: string;
    shopId: number;
};

/** POST /api/v1/onboarding/complete — URL 없으면 no-op mock */
export async function postOnboardingComplete(
    request: OnboardingCompleteRequest,
): Promise<OnboardingCompleteResponse | null> {
    if (!isApiEnabled()) {
        await new Promise((r) => setTimeout(r, 40));
        return null;
    }
    return apiRequest<OnboardingCompleteResponse>(API_PATHS.onboardingComplete, {
        method: 'POST',
        body: request,
    });
}

/** `01012345678` → `010-1234-5678` */
export function formatPhoneForApi(digits: string): string {
    const normalized = digits.replace(/\D/g, '');
    if (normalized.length !== 11) {
        return digits;
    }
    return `${normalized.slice(0, 3)}-${normalized.slice(3, 7)}-${normalized.slice(7)}`;
}
