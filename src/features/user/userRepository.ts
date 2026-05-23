import { readJson, writeJson } from '../../shared/storage/jsonStorage';
import { STORAGE_KEYS } from '../../shared/storage/keys';
import { DEFAULT_USER_STATE } from './defaultState';
import type { AppUserState } from './types';

type LegacyUserState = AppUserState & { teamId?: string };

export async function loadUserState(): Promise<AppUserState> {
    const saved = await readJson<LegacyUserState>(STORAGE_KEYS.appState);
    if (saved == null) {
        return DEFAULT_USER_STATE;
    }
    const { teamId: _legacyTeamId, ...rest } = saved;
    return { ...DEFAULT_USER_STATE, ...rest, missionProgress: saved.missionProgress ?? {} };
}

export async function saveUserState(state: AppUserState): Promise<void> {
    await writeJson(STORAGE_KEYS.appState, state);
}
