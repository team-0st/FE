import { getAuthSession, isLiveAuthSession } from '@api/authSession';
import { isApiEnabled } from '@api/client';
import { postRegisterUser } from '@api/users';
import { getOrCreateDeviceId } from '../../shared/device/deviceId';
import type { AppUserState } from './types';
import { applyRegisterUser } from './userStateLogic';

/**
 * 디바이스 등록·세션 복구. UI와 분리된 등록 오케스트레이션.
 */
export async function ensureRegisteredUser(
    base: AppUserState,
    options?: { force?: boolean },
): Promise<AppUserState> {
    const deviceId = await getOrCreateDeviceId();
    const session = isApiEnabled() ? await getAuthSession() : null;
    const hasAuthSession = !isApiEnabled() || isLiveAuthSession(session);
    if (base.userId != null && options?.force !== true && hasAuthSession) {
        return { ...base, deviceId };
    }
    try {
        const registered = await postRegisterUser();
        const registeredState = applyRegisterUser(
            { ...base, userId: options?.force === true ? null : base.userId },
            {
                userId: registered.userId,
                deviceId,
                onboardingCompleted: registered.onboardingCompleted,
            },
        );
        if (
            isApiEnabled() &&
            (options?.force === true ||
                (base.userId != null && !hasAuthSession))
        ) {
            return { ...registeredState, onboardingCompleted: false };
        }
        return registeredState;
    } catch {
        if (isApiEnabled()) {
            return { ...base, deviceId, userId: null, onboardingCompleted: false };
        }
        return applyRegisterUser(base, {
            userId: 1001,
            deviceId,
            onboardingCompleted: base.onboardingCompleted,
        });
    }
}
