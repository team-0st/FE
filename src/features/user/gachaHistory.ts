import type { AppUserState, GachaHistoryEntry } from './types';

const HISTORY_MAX = 30;

export function appendGachaHistory(
    state: AppUserState,
    label: string,
    positive: boolean,
): AppUserState {
    const entry: GachaHistoryEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        at: new Date().toISOString(),
        label,
        positive,
    };
    const nextHistory = [entry, ...state.gachaHistory].slice(0, HISTORY_MAX);
    return { ...state, gachaHistory: nextHistory };
}
