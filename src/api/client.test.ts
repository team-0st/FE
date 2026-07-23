import { getAuthSession, refreshAuthSession } from './authSession';
import {
    __resetApiClientInflightForTests,
    apiRequest,
    getApiBaseUrl,
} from './client';

jest.mock('./authSession', () => ({
    getAuthSession: jest.fn(),
    refreshAuthSession: jest.fn(),
}));

const getAuthSessionMock = getAuthSession as jest.MockedFunction<
    typeof getAuthSession
>;
const refreshAuthSessionMock = refreshAuthSession as jest.MockedFunction<
    typeof refreshAuthSession
>;

const SESSION = {
    accessToken: 'access-old',
    refreshToken: 'refresh-old',
    tokenType: 'Bearer' as const,
    accessTokenExpiresIn: 3600,
    refreshTokenExpiresIn: 1209600,
};

function apiResponse(status: number, envelope: unknown): Response {
    return {
        status,
        json: jest.fn(async () => envelope),
    } as unknown as Response;
}

describe('apiRequest Bearer 인증', () => {
    beforeEach(() => {
        getAuthSessionMock.mockReset();
        refreshAuthSessionMock.mockReset();
        __resetApiClientInflightForTests();
        global.fetch = jest.fn();
    });

    it('보호 API에는 Bearer 토큰만 보내고 X-Device-Id는 보내지 않는다', async () => {
        getAuthSessionMock.mockResolvedValueOnce(SESSION);
        (global.fetch as jest.Mock).mockResolvedValueOnce(
            apiResponse(200, {
                success: true,
                data: { ok: true },
                error: null,
            }),
        );

        await apiRequest('/api/v1/home');

        expect(global.fetch).toHaveBeenCalledWith(
            `${getApiBaseUrl()}/api/v1/home`,
            expect.objectContaining({
                headers: expect.objectContaining({
                    Authorization: 'Bearer access-old',
                }),
            }),
        );
        const headers = (global.fetch as jest.Mock).mock.calls[0]?.[1]?.headers;
        expect(headers).not.toHaveProperty('X-Device-Id');
    });

    it('401이면 refresh token을 한 번 회전하고 새 access token으로 원 요청을 한 번 재시도한다', async () => {
        getAuthSessionMock.mockResolvedValueOnce(SESSION);
        refreshAuthSessionMock.mockResolvedValueOnce({
            ...SESSION,
            accessToken: 'access-new',
            refreshToken: 'refresh-new',
        });
        (global.fetch as jest.Mock)
            .mockResolvedValueOnce(
                apiResponse(401, {
                    success: false,
                    data: null,
                    error: { code: 'ACCESS_TOKEN_EXPIRED', message: '만료' },
                }),
            )
            .mockResolvedValueOnce(
                apiResponse(200, {
                    success: true,
                    data: { ok: true },
                    error: null,
                }),
            );

        await expect(
            apiRequest<{ ok: boolean }>('/api/v1/home'),
        ).resolves.toEqual({ ok: true });

        expect(refreshAuthSessionMock).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledTimes(2);
        expect((global.fetch as jest.Mock).mock.calls[1]?.[1]?.headers).toEqual(
            expect.objectContaining({ Authorization: 'Bearer access-new' }),
        );
    });

    it('등록 같은 공개 API는 인증 세션을 읽지 않는다', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce(
            apiResponse(200, {
                success: true,
                data: { userId: 1 },
                error: null,
            }),
        );

        await apiRequest('/api/v1/users/register', {
            method: 'POST',
            withAuth: false,
        });

        expect(getAuthSessionMock).not.toHaveBeenCalled();
        expect(refreshAuthSessionMock).not.toHaveBeenCalled();
    });

    it('동일 GET이 동시에 호출되면 fetch는 한 번만 나간다', async () => {
        getAuthSessionMock.mockResolvedValue(SESSION);
        let resolveFetch!: (value: Response) => void;
        const fetchPromise = new Promise<Response>((resolve) => {
            resolveFetch = resolve;
        });
        (global.fetch as jest.Mock).mockReturnValueOnce(fetchPromise);

        const p1 = apiRequest<{ ok: boolean }>('/api/v1/home');
        const p2 = apiRequest<{ ok: boolean }>('/api/v1/home');
        await Promise.resolve();
        await Promise.resolve();
        expect(global.fetch).toHaveBeenCalledTimes(1);

        resolveFetch(
            apiResponse(200, {
                success: true,
                data: { ok: true },
                error: null,
            }),
        );
        await expect(Promise.all([p1, p2])).resolves.toEqual([
            { ok: true },
            { ok: true },
        ]);
    });
});
