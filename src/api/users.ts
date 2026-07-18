import { apiRequest, isApiEnabled } from './client';
import { API_PATHS, type RegisterUserResponse } from './notion/types';
import { getOrCreateDeviceId } from '../shared/device/deviceId';

export type { RegisterUserResponse };

/** POST /api/v1/users/register — URL 없으면 mock */
export async function postRegisterUser(): Promise<RegisterUserResponse> {
    const deviceId = await getOrCreateDeviceId();

    if (isApiEnabled()) {
        return apiRequest<RegisterUserResponse>(API_PATHS.usersRegister, {
            method: 'POST',
            body: { deviceId },
            withDeviceId: false,
        });
    }

    await new Promise((resolve) => setTimeout(resolve, 40));
    const hash = deviceId.split('').reduce((acc: number, ch: string) => acc + ch.charCodeAt(0), 0);
    return {
        userId: 1000 + (hash % 9000),
        onboardingCompleted: false,
    };
}
