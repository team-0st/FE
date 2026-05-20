import { readJson, writeJson } from '../../shared/storage/jsonStorage';
import { STORAGE_KEYS } from '../../shared/storage/keys';
import { DEFAULT_USER_STATE } from './defaultState';
import type { AppUserState } from './types';

export async function loadUserState(): Promise<AppUserState> {
    const saved = await readJson<AppUserState>(STORAGE_KEYS.appState);
    if (saved == null) {
        return DEFAULT_USER_STATE;
    }
    return { ...DEFAULT_USER_STATE, ...saved, missionProgress: saved.missionProgress ?? {} };
}

export async function saveUserState(state: AppUserState): Promise<void> {
    await writeJson(STORAGE_KEYS.appState, state);
}
