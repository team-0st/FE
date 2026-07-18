import { readJson, writeJson } from '../storage/jsonStorage';
import { STORAGE_KEYS } from '../storage/keys';

function createDeviceId(): string {
    const random = Math.random().toString(16).slice(2);
    const time = Date.now().toString(16);
    return `550e8400-e29b-41d4-a716-${time.padStart(12, '0').slice(0, 12)}${random.slice(0, 3)}`;
}

export async function getOrCreateDeviceId(): Promise<string> {
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
