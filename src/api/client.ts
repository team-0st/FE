import { getAuthSession, refreshAuthSession } from './authSession';

export type ApiEnvelope<T> = {
    success: boolean;
    data: T | null;
    error: { code: string; message: string } | null;
};

export class ApiClientError extends Error {
    readonly code: string;
    readonly status: number;

    constructor(code: string, message: string, status: number) {
        super(message);
        this.name = 'ApiClientError';
        this.code = code;
        this.status = status;
    }
}

export function getApiBaseUrl(): string | null {
    const raw = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
    if (raw == null || raw.length === 0) {
        return null;
    }
    return raw.replace(/\/$/, '');
}

/** `EXPO_PUBLIC_API_BASE_URL`이 있으면 실 BE, 없으면 mock */
export function isApiEnabled(): boolean {
    return getApiBaseUrl() != null;
}

type ApiRequestOptions = {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: unknown;
    /** false면 Authorization 생략 (register/login/refresh) */
    withAuth?: boolean;
    /** multipart 등 — Content-Type을 직접 넣지 않음 */
    formData?: FormData;
};

function requestHeaders(options: ApiRequestOptions, accessToken?: string): Record<string, string> {
    const headers: Record<string, string> = {
        Accept: 'application/json',
    };

    if (options.formData == null) {
        headers['Content-Type'] = 'application/json';
    }
    if (accessToken != null && accessToken.length > 0) {
        headers.Authorization = `Bearer ${accessToken}`;
    }
    return headers;
}

async function executeRequest<T>(
    base: string,
    path: string,
    options: ApiRequestOptions,
    accessToken?: string,
): Promise<{ status: number; envelope: ApiEnvelope<T> }> {
    let response: Response;
    try {
        response = await fetch(`${base}${path}`, {
            method: options.method ?? 'GET',
            headers: requestHeaders(options, accessToken),
            body:
                options.formData != null
                    ? (options.formData as unknown as BodyInit_)
                    : options.body != null
                      ? JSON.stringify(options.body)
                      : undefined,
        });
    } catch {
        throw new ApiClientError('NETWORK_ERROR', '네트워크 요청에 실패했습니다.', 0);
    }

    let envelope: ApiEnvelope<T>;
    try {
        envelope = (await response.json()) as ApiEnvelope<T>;
    } catch {
        throw new ApiClientError('NETWORK_ERROR', '응답을 해석하지 못했습니다.', response.status);
    }
    return { status: response.status, envelope };
}

function unwrapEnvelope<T>(status: number, envelope: ApiEnvelope<T>): T {
    if (!envelope.success) {
        throw new ApiClientError(
            envelope.error?.code ?? 'NETWORK_ERROR',
            envelope.error?.message ?? '요청에 실패했습니다.',
            status,
        );
    }
    return envelope.data as T;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    const base = getApiBaseUrl();
    if (base == null) {
        throw new ApiClientError('API_DISABLED', 'EXPO_PUBLIC_API_BASE_URL이 비어 있습니다.', 0);
    }

    const withAuth = options.withAuth !== false;
    const session = withAuth ? await getAuthSession() : null;
    let result = await executeRequest<T>(base, path, options, session?.accessToken);

    if (withAuth && result.status === 401) {
        const refreshed = await refreshAuthSession(base);
        if (refreshed != null) {
            result = await executeRequest<T>(base, path, options, refreshed.accessToken);
        }
    }

    return unwrapEnvelope(result.status, result.envelope);
}
