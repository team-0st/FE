import { saveAuthSession } from './authSession';
import { apiRequest, isApiEnabled } from './client';
import { postRegisterUser } from './users';

jest.mock('./client', () => ({
    apiRequest: jest.fn(),
    isApiEnabled: jest.fn(),
}));

jest.mock('./authSession', () => ({
    saveAuthSession: jest.fn(),
}));

jest.mock('../shared/device/deviceId', () => ({
    getOrCreateDeviceId: jest.fn(async () => 'legacy-device-id'),
}));

const apiRequestMock = apiRequest as jest.MockedFunction<typeof apiRequest>;
const isApiEnabledMock = isApiEnabled as jest.MockedFunction<typeof isApiEnabled>;
const saveAuthSessionMock = saveAuthSession as jest.MockedFunction<typeof saveAuthSession>;

describe('postRegisterUser 토큰 등록', () => {
    beforeEach(() => {
        apiRequestMock.mockReset();
        isApiEnabledMock.mockReset();
        saveAuthSessionMock.mockReset();
    });

    it('BE 임시 유저 등록은 body 없이 호출하고 발급 토큰을 저장한다', async () => {
        const response = {
            userId: 7,
            onboardingCompleted: false,
            accessToken: 'access',
            refreshToken: 'refresh',
            tokenType: 'Bearer',
            accessTokenExpiresIn: 3600,
            refreshTokenExpiresIn: 1209600,
        };
        isApiEnabledMock.mockReturnValue(true);
        apiRequestMock.mockResolvedValueOnce(response);

        await expect(postRegisterUser()).resolves.toEqual(response);

        expect(apiRequestMock).toHaveBeenCalledWith('/api/v1/users/register', {
            method: 'POST',
            withAuth: false,
        });
        expect(saveAuthSessionMock).toHaveBeenCalledWith({
            accessToken: 'access',
            refreshToken: 'refresh',
            tokenType: 'Bearer',
            accessTokenExpiresIn: 3600,
            refreshTokenExpiresIn: 1209600,
        });
    });
});
