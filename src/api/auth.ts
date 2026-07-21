import { saveAuthSession } from './authSession';
import { apiRequest } from './client';
import { API_PATHS } from './notion/types';

export type LoginResponse = {
    userId: number;
    nickname: string;
    phoneNumber: string;
    onboardingCompleted: boolean;
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    accessTokenExpiresIn: number;
    refreshTokenExpiresIn: number;
};

export async function postLogin(
    phoneNumber: string,
    password: string,
): Promise<LoginResponse> {
    const response = await apiRequest<LoginResponse>(API_PATHS.authLogin, {
        method: 'POST',
        withAuth: false,
        body: { phoneNumber, password },
    });
    await saveAuthSession({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        tokenType: response.tokenType,
        accessTokenExpiresIn: response.accessTokenExpiresIn,
        refreshTokenExpiresIn: response.refreshTokenExpiresIn,
    });
    return response;
}
