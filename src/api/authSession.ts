import { readJson, writeJson } from '../shared/storage/jsonStorage';
import { STORAGE_KEYS } from '../shared/storage/keys';

export type AuthSession = {
    accessToken: string;
    refreshToken: string;
    tokenType: 'Bearer' | string;
    accessTokenExpiresIn: number;
    refreshTokenExpiresIn: number;
};

type AuthEnvelope<T> = {
    success: boolean;
    data: T | null;
    error: { code: string; message: string } | null;
};

let refreshInFlight: Promise<AuthSession | null> | null = null;

export async function getAuthSession(): Promise<AuthSession | null> {
    try {
        return await readJson<AuthSession>(STORAGE_KEYS.authSession);
    } catch {
        await clearAuthSession();
        return null;
    }
}

/** mock/로컬 전용 토큰은 실 BE 세션으로 보지 않는다. */
export function isLiveAuthSession(session: AuthSession | null): boolean {
    if (session == null) {
        return false;
    }
    const token = session.accessToken?.trim() ?? '';
    if (token.length === 0) {
        return false;
    }
    if (token === 'mock-access-token' || token.startsWith('mock-')) {
        return false;
    }
    // JWT: header.payload.sig
    return token.split('.').length === 3;
}

export async function saveAuthSession(session: AuthSession): Promise<void> {
    await writeJson(STORAGE_KEYS.authSession, session);
}

export async function clearAuthSession(): Promise<void> {
    await writeJson(STORAGE_KEYS.authSession, null);
}

async function requestRefresh(
    baseUrl: string,
    fetcher: typeof fetch,
): Promise<AuthSession | null> {
    const current = await getAuthSession();
    if (current == null || current.refreshToken.length === 0) {
        return null;
    }

    try {
        const response = await fetcher(`${baseUrl}/api/v1/auth/refresh`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken: current.refreshToken }),
        });
        const envelope = (await response.json()) as AuthEnvelope<AuthSession>;
        if (response.status < 200 || response.status >= 300 || !envelope.success || envelope.data == null) {
            await clearAuthSession();
            return null;
        }
        await saveAuthSession(envelope.data);
        return envelope.data;
    } catch {
        return null;
    }
}

export function refreshAuthSession(
    baseUrl: string,
    fetcher: typeof fetch = fetch,
): Promise<AuthSession | null> {
    if (refreshInFlight != null) {
        return refreshInFlight;
    }
    refreshInFlight = requestRefresh(baseUrl, fetcher).finally(() => {
        refreshInFlight = null;
    });
    return refreshInFlight;
}
