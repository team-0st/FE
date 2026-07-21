import {
    ApiClientError,
    getApiBaseUrl,
    isApiEnabled,
    type ApiEnvelope,
} from './client';
import { getDeviceIdHeader, getOrCreateDeviceId } from '../shared/device/deviceId';
import { API_PATHS } from './notion/types';

export type FileUploadResponse = {
    fileUrl: string;
    fileKey: string;
};

export type MissionVerifyUploadInput = {
    previewUri: string;
    /** openCamera base64:true 원문(prefix 없음) 또는 data: URI */
    uploadPayload: string;
};

function isHeicPayload(value: string): boolean {
    const lower = value.toLowerCase();
    return (
        lower.includes('image/heic') ||
        lower.includes('image/heif') ||
        lower.includes('.heic') ||
        lower.includes('.heif')
    );
}

/** preview / uploadPayload에서 raw base64 추출 */
function extractRawBase64(photo: MissionVerifyUploadInput): string {
    const candidates = [photo.uploadPayload, photo.previewUri];
    for (const raw of candidates) {
        if (raw.length === 0) {
            continue;
        }
        if (isHeicPayload(raw)) {
            throw new ApiClientError(
                'INVALID_FILE_TYPE',
                '지원하지 않는 파일 형식입니다.',
                400,
            );
        }
        if (raw.startsWith('data:image/')) {
            const comma = raw.indexOf(',');
            if (comma < 0) {
                continue;
            }
            const meta = raw.slice(0, comma).toLowerCase();
            if (meta.includes('heic') || meta.includes('heif')) {
                throw new ApiClientError(
                    'INVALID_FILE_TYPE',
                    '지원하지 않는 파일 형식입니다.',
                    400,
                );
            }
            return raw.slice(comma + 1).replace(/\s/g, '');
        }
        if (raw.startsWith('data:')) {
            throw new ApiClientError(
                'INVALID_FILE_TYPE',
                '지원하지 않는 파일 형식입니다.',
                400,
            );
        }
    }

    const base64 = photo.uploadPayload.trim().replace(/\s/g, '');
    if (base64.length > 64 && !base64.includes('://') && !base64.startsWith('/')) {
        return base64;
    }

    throw new ApiClientError(
        'INVALID_INPUT_VALUE',
        '업로드용 사진 데이터가 없습니다.',
        400,
    );
}

function decodeBase64(base64: string): Uint8Array {
    const clean = base64.replace(/[\s\n\r]/g, '');
    const atobFn = (globalThis as { atob?: (data: string) => string }).atob;
    if (typeof atobFn !== 'function') {
        throw new ApiClientError('NETWORK_ERROR', 'base64 디코더를 사용할 수 없습니다.', 0);
    }
    let binary: string;
    try {
        binary = atobFn(clean);
    } catch {
        throw new ApiClientError('INVALID_INPUT_VALUE', '사진 데이터를 읽지 못했어요.', 400);
    }
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

function detectImageFormat(
    bytes: Uint8Array,
): { mime: string; ext: string } | null {
    if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xd8) {
        return { mime: 'image/jpeg', ext: 'jpg' };
    }
    // PNG — AIT가 jpeg이 아닌 바이너리를 줄 수 있음
    if (
        bytes.length >= 4 &&
        bytes[0] === 0x89 &&
        bytes[1] === 0x50 &&
        bytes[2] === 0x4e &&
        bytes[3] === 0x47
    ) {
        return { mime: 'image/png', ext: 'png' };
    }
    return null;
}

function buildImageMultipart(
    fieldName: string,
    filename: string,
    mime: string,
    imageBytes: Uint8Array,
): { body: Uint8Array; contentType: string } {
    const boundary = `----ZerostFormBoundary${Date.now().toString(16)}`;
    const encoder = new TextEncoder();
    const head = encoder.encode(
        `--${boundary}\r\n` +
            `Content-Disposition: form-data; name="${fieldName}"; filename="${filename}"\r\n` +
            `Content-Type: ${mime}\r\n\r\n`,
    );
    const tail = encoder.encode(`\r\n--${boundary}--\r\n`);
    const body = new Uint8Array(head.length + imageBytes.length + tail.length);
    body.set(head, 0);
    body.set(imageBytes, head.length);
    body.set(tail, head.length + imageBytes.length);
    return {
        body,
        contentType: `multipart/form-data; boundary=${boundary}`,
    };
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
    return bytes.buffer.slice(
        bytes.byteOffset,
        bytes.byteOffset + bytes.byteLength,
    ) as ArrayBuffer;
}

/**
 * iOS RN `fetch`+Uint8Array/FormData는 빈 바디·비JSON을 자주 냄.
 * XMLHttpRequest로 바이너리 multipart를 보낸다.
 */
function postMultipartXhr(
    url: string,
    headers: Record<string, string>,
    body: Uint8Array,
): Promise<{ status: number; text: string }> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = () => {
            resolve({ status: xhr.status, text: xhr.responseText ?? '' });
        };
        xhr.onerror = () => {
            reject(new Error('xhr network error'));
        };
        xhr.ontimeout = () => {
            reject(new Error('xhr timeout'));
        };
        xhr.open('POST', url);
        xhr.timeout = 60_000;
        Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
        });
        xhr.send(toArrayBuffer(body));
    });
}

function parseUploadEnvelope(
    status: number,
    text: string,
): FileUploadResponse {
    if (status === 413) {
        throw new ApiClientError(
            'FILE_TOO_LARGE',
            '사진이 너무 커요.',
            413,
        );
    }

    let envelope: ApiEnvelope<FileUploadResponse>;
    try {
        envelope = JSON.parse(text) as ApiEnvelope<FileUploadResponse>;
    } catch {
        if (__DEV__) {
            console.warn(
                '[uploadMissionVerifyPhoto] non-json',
                status,
                text.slice(0, 200),
            );
        }
        throw new ApiClientError(
            'NETWORK_ERROR',
            `응답을 해석하지 못했습니다. (${status})`,
            status,
        );
    }

    if (!envelope.success) {
        throw new ApiClientError(
            envelope.error?.code ?? 'NETWORK_ERROR',
            envelope.error?.message ?? '요청에 실패했습니다.',
            status,
        );
    }

    if (envelope.data == null) {
        throw new ApiClientError('NETWORK_ERROR', '업로드 응답이 비어 있습니다.', status);
    }

    return envelope.data;
}

/**
 * POST /api/v1/files/upload?missionId=
 * multipart `file` + query `missionId`
 */
export async function uploadMissionVerifyPhoto(
    missionNumericId: number,
    photo: MissionVerifyUploadInput,
): Promise<FileUploadResponse> {
    if (!isApiEnabled()) {
        return {
            fileKey: `mock/missions/${missionNumericId}/${Date.now()}.jpg`,
            fileUrl: photo.previewUri,
        };
    }

    const base = getApiBaseUrl();
    if (base == null) {
        throw new ApiClientError('API_DISABLED', 'EXPO_PUBLIC_API_BASE_URL이 비어 있습니다.', 0);
    }

    const rawBase64 = extractRawBase64(photo);
    const imageBytes = decodeBase64(rawBase64);
    if (imageBytes.length === 0) {
        throw new ApiClientError('INVALID_INPUT_VALUE', '빈 파일은 업로드할 수 없습니다.', 400);
    }

    const format = detectImageFormat(imageBytes);
    if (format == null) {
        if (__DEV__) {
            console.warn(
                '[uploadMissionVerifyPhoto] unknown magic',
                imageBytes.length,
                imageBytes[0],
                imageBytes[1],
                imageBytes[2],
                imageBytes[3],
            );
        }
        throw new ApiClientError(
            'INVALID_FILE_TYPE',
            '지원하지 않는 파일 형식입니다.',
            400,
        );
    }

    // nginx 기본 ~1MB. multipart 헤더 여유 두고 사전 차단
    const MAX_IMAGE_BYTES = 900_000;
    if (imageBytes.length > MAX_IMAGE_BYTES) {
        if (__DEV__) {
            console.warn(
                '[uploadMissionVerifyPhoto] too large before upload',
                imageBytes.length,
            );
        }
        throw new ApiClientError(
            'FILE_TOO_LARGE',
            '사진이 너무 커요.',
            413,
        );
    }

    const { body, contentType } = buildImageMultipart(
        'file',
        `mission-${missionNumericId}.${format.ext}`,
        format.mime,
        imageBytes,
    );

    const deviceId = await getOrCreateDeviceId();
    const headers: Record<string, string> = {
        Accept: 'application/json',
        'Content-Type': contentType,
        ...getDeviceIdHeader(deviceId),
    };

    const url = `${base}${API_PATHS.filesUpload}?missionId=${missionNumericId}`;

    if (__DEV__) {
        console.warn(
            '[uploadMissionVerifyPhoto] uploading',
            format.mime,
            imageBytes.length,
            'bytes',
            'multipart',
            body.length,
        );
    }

    let status: number;
    let text: string;
    try {
        const xhrResult = await postMultipartXhr(url, headers, body);
        status = xhrResult.status;
        text = xhrResult.text;
    } catch (error) {
        if (__DEV__) {
            console.warn('[uploadMissionVerifyPhoto] xhr failed, try fetch', error);
        }
        // 폴백: fetch + ArrayBuffer
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: toArrayBuffer(body) as unknown as BodyInit_,
            });
            status = response.status;
            text = await response.text();
        } catch (fetchError) {
            if (__DEV__) {
                console.warn('[uploadMissionVerifyPhoto] fetch failed', fetchError);
            }
            throw new ApiClientError('NETWORK_ERROR', '네트워크 요청에 실패했습니다.', 0);
        }
    }

    return parseUploadEnvelope(status, text);
}
