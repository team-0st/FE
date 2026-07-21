import { readJson, writeJson } from '../shared/storage/jsonStorage';
import {
    clearAuthSession,
    getAuthSession,
    refreshAuthSession,
    saveAuthSession,
    type AuthSession,
} from './authSession';

jest.mock('../shared/storage/jsonStorage', () => ({
    readJson: jest.fn(),
    writeJson: jest.fn(),
}));

const readJsonMock = readJson as jest.MockedFunction<typeof readJson>;
const writeJsonMock = writeJson as jest.MockedFunction<typeof writeJson>;

const SESSION: AuthSession = {
    accessToken: 'access-old',
    refreshToken: 'refresh-old',
    tokenType: 'Bearer',
    accessTokenExpiresIn: 3600,
    refreshTokenExpiresIn: 1209600,
};

describe('authSession', () => {
    beforeEach(() => {
        readJsonMock.mockReset();
        writeJsonMock.mockReset();
    });

    it('등록·로그인 토큰 응답을 인증 세션으로 저장하고 다시 읽는다', async () => {
        writeJsonMock.mockResolvedValueOnce();
        readJsonMock.mockResolvedValueOnce(SESSION);

        await saveAuthSession(SESSION);

        expect(writeJsonMock).toHaveBeenCalledWith('zerost.authSession.v1', SESSION);
        await expect(getAuthSession()).resolves.toEqual(SESSION);
    });

    it('refresh token을 회전하고 새 세션을 저장한다', async () => {
        readJsonMock.mockResolvedValueOnce(SESSION);
        writeJsonMock.mockResolvedValueOnce();
        const fetcher = jest.fn(async () => ({
            status: 200,
            json: async () => ({
                success: true,
                data: {
                    accessToken: 'access-new',
                    refreshToken: 'refresh-new',
                    tokenType: 'Bearer',
                    accessTokenExpiresIn: 3600,
                    refreshTokenExpiresIn: 1209600,
                },
                error: null,
            }),
        })) as unknown as typeof fetch;

        const refreshed = await refreshAuthSession('https://api.example.com', fetcher);

        expect(fetcher).toHaveBeenCalledWith(
            'https://api.example.com/api/v1/auth/refresh',
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ refreshToken: 'refresh-old' }),
            }),
        );
        expect(refreshed?.accessToken).toBe('access-new');
        expect(writeJsonMock).toHaveBeenCalledWith(
            'zerost.authSession.v1',
            expect.objectContaining({ accessToken: 'access-new', refreshToken: 'refresh-new' }),
        );
    });

    it('갱신 실패 시 만료 세션을 제거한다', async () => {
        readJsonMock.mockResolvedValueOnce(SESSION);
        writeJsonMock.mockResolvedValueOnce();
        const fetcher = jest.fn(async () => ({
            status: 401,
            json: async () => ({
                success: false,
                data: null,
                error: { code: 'INVALID_REFRESH_TOKEN', message: '만료' },
            }),
        })) as unknown as typeof fetch;

        await expect(refreshAuthSession('https://api.example.com', fetcher)).resolves.toBeNull();
        expect(writeJsonMock).toHaveBeenCalledWith('zerost.authSession.v1', null);
    });

    it('일시적인 네트워크 실패는 다시 시도할 수 있도록 refresh token을 지우지 않는다', async () => {
        readJsonMock.mockResolvedValueOnce(SESSION);
        const fetcher = jest.fn(async () => {
            throw new Error('offline');
        }) as unknown as typeof fetch;

        await expect(refreshAuthSession('https://api.example.com', fetcher)).resolves.toBeNull();
        expect(writeJsonMock).not.toHaveBeenCalled();
    });

    it('명시적으로 로그아웃하면 저장된 세션을 제거한다', async () => {
        writeJsonMock.mockResolvedValueOnce();

        await clearAuthSession();

        expect(writeJsonMock).toHaveBeenCalledWith('zerost.authSession.v1', null);
    });
});
