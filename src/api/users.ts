import { getOrCreateDeviceId } from '../shared/device/deviceId';

export type RegisterUserResponse = {
    userId: number;
    onboardingCompleted: boolean;
};

/** POST /api/users/register — BE 연동 전 mock */
export async function postRegisterUser(): Promise<RegisterUserResponse> {
    const deviceId = await getOrCreateDeviceId();
    await new Promise((resolve) => setTimeout(resolve, 40));
    const hash = deviceId.split('').reduce((acc: number, ch: string) => acc + ch.charCodeAt(0), 0);
    return {
        userId: 1000 + (hash % 9000),
        onboardingCompleted: false,
    };
}
