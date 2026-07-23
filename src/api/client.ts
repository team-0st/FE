import { API_BASE_URL } from '../shared/constants/apiBaseUrl.runtime';
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
    const trimmed = API_BASE_URL.trim();
    if (trimmed.length === 0) {
        return null;
    }
    return trimmed.replace(/\/$/, '');
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
    /** 호출측에서 취소할 때 전달 (언마운트·연타 방지) */
    signal?: AbortSignal;
};

/** 동일 GET이 동시에 여러 번 나가면 하나로 합친다 */
const inflightGetRequests = new Map<string, Promise<unknown>>();

function requestHeaders(
    options: ApiRequestOptions,
    accessToken?: string,
): Record<string, string> {
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

function isAbortError(error: unknown): boolean {
    return (
        (error instanceof DOMException && error.name === 'AbortError') ||
        (error instanceof Error && error.name === 'AbortError')
    );
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
            // RN/DOM AbortSignal 타입 불일치 우회
            signal: options.signal as RequestInit['signal'],
            body:
                options.formData != null
                    ? (options.formData as unknown as BodyInit_)
                    : options.body != null
                      ? JSON.stringify(options.body)
                      : undefined,
        });
    } catch (error) {
        if (isAbortError(error) || options.signal?.aborted) {
            throw new ApiClientError('ABORTED', '요청이 취소되었습니다.', 0);
        }
        throw new ApiClientError(
            'NETWORK_ERROR',
            '네트워크 요청에 실패했습니다.',
            0,
        );
    }

    let envelope: ApiEnvelope<T>;
    try {
        envelope = (await response.json()) as ApiEnvelope<T>;
    } catch {
        throw new ApiClientError(
            'NETWORK_ERROR',
            '응답을 해석하지 못했습니다.',
            response.status,
        );
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

function getInflightKey(
    path: string,
    options: ApiRequestOptions,
): string | null {
    const method = options.method ?? 'GET';
    if (method !== 'GET' || options.body != null || options.formData != null) {
        return null;
    }
    const withAuth = options.withAuth !== false;
    return `${method}:${withAuth ? '1' : '0'}:${path}`;
}

async function apiRequestOnce<T>(
    path: string,
    options: ApiRequestOptions,
): Promise<T> {
    const base = getApiBaseUrl();
    if (base == null) {
        throw new ApiClientError(
            'API_DISABLED',
            'EXPO_PUBLIC_API_BASE_URL이 비어 있습니다.',
            0,
        );
    }

    const withAuth = options.withAuth !== false;
    const session = withAuth ? await getAuthSession() : null;
    let result = await executeRequest<T>(
        base,
        path,
        options,
        session?.accessToken,
    );

    if (withAuth && result.status === 401) {
        if (options.signal?.aborted) {
            throw new ApiClientError('ABORTED', '요청이 취소되었습니다.', 0);
        }
        const refreshed = await refreshAuthSession(base);
        if (refreshed != null) {
            result = await executeRequest<T>(
                base,
                path,
                options,
                refreshed.accessToken,
            );
        }
    }

    return unwrapEnvelope(result.status, result.envelope);
}

export async function apiRequest<T>(
    path: string,
    options: ApiRequestOptions = {},
): Promise<T> {
    const inflightKey = getInflightKey(path, options);
    if (inflightKey == null) {
        return apiRequestOnce<T>(path, options);
    }

    const existing = inflightGetRequests.get(inflightKey);
    if (existing != null) {
        return existing as Promise<T>;
    }

    const pending = apiRequestOnce<T>(path, options).finally(() => {
        inflightGetRequests.delete(inflightKey);
    });
    inflightGetRequests.set(inflightKey, pending);
    return pending;
}

/** 테스트용 — in-flight GET 맵 비우기 */
export function __resetApiClientInflightForTests(): void {
    inflightGetRequests.clear();
}
