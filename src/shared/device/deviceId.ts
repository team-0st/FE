import { getAnonymousKey } from '@apps-in-toss/framework';
import { readJson, writeJson } from '../storage/jsonStorage';
import { STORAGE_KEYS } from '../storage/keys';

function createDeviceId(): string {
    const random = Math.random().toString(16).slice(2);
    const time = Date.now().toString(16);
    return `550e8400-e29b-41d4-a716-${time.padStart(12, '0').slice(0, 12)}${random.slice(0, 3)}`;
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

export async function getOrCreateDeviceId(): Promise<string> {
    const anon = await resolveAnonymousHash();
    if (anon != null) {
        const saved = await readJson<string>(STORAGE_KEYS.deviceId);
        if (saved !== anon) {
            await writeJson(STORAGE_KEYS.deviceId, anon);
        }
        return anon;
    }

    const saved = await readJson<string>(STORAGE_KEYS.deviceId);
    if (saved != null && saved.length > 0) {
        return saved;
    }
    const deviceId = createDeviceId();
    await writeJson(STORAGE_KEYS.deviceId, deviceId);
    return deviceId;
}

export function getDeviceIdHeader(deviceId: string): Record<string, string> {
    return { 'X-Device-Id': deviceId };
}
