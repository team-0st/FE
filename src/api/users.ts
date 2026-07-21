import { apiRequest, isApiEnabled } from './client';
import { API_PATHS, type RegisterUserResponse } from './notion/types';
import { getOrCreateDeviceId } from '../shared/device/deviceId';
import { saveAuthSession } from './authSession';

export type { RegisterUserResponse };

/** POST /api/v1/users/register — URL 없으면 mock */
export async function postRegisterUser(): Promise<RegisterUserResponse> {
    if (isApiEnabled()) {
        const registered = await apiRequest<RegisterUserResponse>(API_PATHS.usersRegister, {
            method: 'POST',
            withAuth: false,
        });
        await saveAuthSession({
            accessToken: registered.accessToken,
            refreshToken: registered.refreshToken,
            tokenType: registered.tokenType,
            accessTokenExpiresIn: registered.accessTokenExpiresIn,
            refreshTokenExpiresIn: registered.refreshTokenExpiresIn,
        });
        return registered;
    }

    const deviceId = await getOrCreateDeviceId();
    await new Promise((resolve) => setTimeout(resolve, 40));
    const hash = deviceId.split('').reduce((acc: number, ch: string) => acc + ch.charCodeAt(0), 0);
    return {
        userId: 1000 + (hash % 9000),
        onboardingCompleted: false,
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        tokenType: 'Bearer',
        accessTokenExpiresIn: 3600,
        refreshTokenExpiresIn: 1209600,
    };
}
