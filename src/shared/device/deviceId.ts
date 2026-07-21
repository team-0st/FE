import { getAnonymousKey } from '@apps-in-toss/framework';
import { readJson, writeJson } from '../storage/jsonStorage';
import { STORAGE_KEYS } from '../storage/keys';

/** BE `RegisterUserRequest.deviceId` maxLength — OpenAPI 기준 */
export const DEVICE_ID_MAX_LENGTH = 64;

function createDeviceId(): string {
    const random = Math.random().toString(16).slice(2);
    const time = Date.now().toString(16);
    return `550e8400-e29b-41d4-a716-${time.padStart(12, '0').slice(0, 12)}${random.slice(0, 3)}`;
}

/**
 * BE는 deviceId 64자 제한.
 * `getAnonymousKey` 해시가 더 길면 등록이 실패하고 이후 가챠·제작이 USER_NOT_FOUND가 된다.
 */
export function normalizeDeviceId(raw: string): string {
    const trimmed = raw.trim();
    if (trimmed.length === 0) {
        return createDeviceId();
    }
    if (trimmed.length <= DEVICE_ID_MAX_LENGTH) {
        return trimmed;
    }
    return trimmed.slice(0, DEVICE_ID_MAX_LENGTH);
}

/**
 * `getAnonymousKey`는 비게임 미니앱 전용 사용자 식별키예요 (토스 로그인/사업자 등록 불필요).
 * 샌드박스·미지원 SDK 환경에서는 실패하거나 undefined를 반환하므로 아래에서 랜덤 UUID로 폴백해요.
 */
async function resolveAnonymousHash(): Promise<string | null> {
    try {
        const result = await getAnonymousKey();
        if (
            result != null &&
            typeof result === 'object' &&
            result.type === 'HASH' &&
            typeof result.hash === 'string' &&
            result.hash.length > 0
        ) {
            return result.hash;
        }
    } catch {
        // 샌드박스/미지원 환경 — 아래 폴백으로 진행
    }
    return null;
}

/**
 * 한 번 저장된 deviceId를 유지한다.
 * (익명키가 나중에 바뀌어도 BE 유저와 어긋나지 않게)
 */
export async function getOrCreateDeviceId(): Promise<string> {
    const saved = await readJson<string>(STORAGE_KEYS.deviceId);
    if (saved != null && saved.length > 0) {
        const normalized = normalizeDeviceId(saved);
        if (normalized !== saved) {
            await writeJson(STORAGE_KEYS.deviceId, normalized);
        }
        return normalized;
    }

    const anon = await resolveAnonymousHash();
    const deviceId = normalizeDeviceId(anon ?? createDeviceId());
    await writeJson(STORAGE_KEYS.deviceId, deviceId);
    return deviceId;
}
