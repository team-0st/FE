import { saveAuthSession } from './authSession';
import { apiRequest } from './client';
import { postLogin } from './auth';

jest.mock('./client', () => ({
    apiRequest: jest.fn(),
}));

jest.mock('./authSession', () => ({
    saveAuthSession: jest.fn(),
}));

const apiRequestMock = apiRequest as jest.MockedFunction<typeof apiRequest>;
const saveAuthSessionMock = saveAuthSession as jest.MockedFunction<typeof saveAuthSession>;

describe('postLogin', () => {
    it('휴대전화번호·비밀번호로 로그인하고 회전 가능한 토큰을 저장한다', async () => {
        const response = {
            userId: 7,
            nickname: '테스터',
            phoneNumber: '010-1234-5678',
            onboardingCompleted: true,
            accessToken: 'access',
            refreshToken: 'refresh',
            tokenType: 'Bearer',
            accessTokenExpiresIn: 3600,
            refreshTokenExpiresIn: 1209600,
        };
        apiRequestMock.mockResolvedValueOnce(response);

        await expect(postLogin('010-1234-5678', 'password123')).resolves.toEqual(response);

        expect(apiRequestMock).toHaveBeenCalledWith('/api/v1/auth/login', {
            method: 'POST',
            withAuth: false,
            body: {
                phoneNumber: '010-1234-5678',
                password: 'password123',
            },
        });
        expect(saveAuthSessionMock).toHaveBeenCalledWith(
            expect.objectContaining({ accessToken: 'access', refreshToken: 'refresh' }),
        );
    });
});
