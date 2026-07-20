import { getDeviceIdHeader, getOrCreateDeviceId } from '../shared/device/deviceId';

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
    /** false면 X-Device-Id 생략 (register만) */
    withDeviceId?: boolean;
    /** multipart 등 — Content-Type을 직접 넣지 않음 */
    formData?: FormData;
};

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    const base = getApiBaseUrl();
    if (base == null) {
        throw new ApiClientError('API_DISABLED', 'EXPO_PUBLIC_API_BASE_URL이 비어 있습니다.', 0);
    }

    const headers: Record<string, string> = {
        Accept: 'application/json',
    };

    if (options.formData == null) {
        headers['Content-Type'] = 'application/json';
    }

    if (options.withDeviceId !== false) {
        const deviceId = await getOrCreateDeviceId();
        Object.assign(headers, getDeviceIdHeader(deviceId));
    }

    let response: Response;
    try {
        response = await fetch(`${base}${path}`, {
            method: options.method ?? 'GET',
            headers,
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

    if (!envelope.success) {
        throw new ApiClientError(
            envelope.error?.code ?? 'NETWORK_ERROR',
            envelope.error?.message ?? '요청에 실패했습니다.',
            response.status,
        );
    }

    return envelope.data as T;
}
