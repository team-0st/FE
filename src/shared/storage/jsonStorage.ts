import { Storage } from '@apps-in-toss/framework';

const memory = new Map<string, string>();

async function getItem(key: string): Promise<string | null> {
    try {
        return await Storage.getItem(key);
    } catch {
        return memory.get(key) ?? null;
    }
}

async function setItem(key: string, value: string): Promise<void> {
    try {
        await Storage.setItem(key, value);
    } catch {
        memory.set(key, value);
    }
}

export async function readJson<T>(key: string): Promise<T | null> {
    const raw = await getItem(key);
    if (raw == null || raw === '') {
        return null;
    }
    return JSON.parse(raw) as T;
}

export async function writeJson<T>(key: string, value: T): Promise<void> {
    await setItem(key, JSON.stringify(value));
}
