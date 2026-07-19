import type { AppUserState, PointsLedgerEntry } from './types';

const LEDGER_MAX = 30;

export function appendAlmangPointsLedger(
    state: AppUserState,
    label: string,
    delta: number,
): AppUserState {
    if (delta === 0) {
        return state;
    }
    const entry: PointsLedgerEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        at: new Date().toISOString(),
        label,
        delta,
    };
    const nextLedger = [entry, ...state.almangPointsLedger].slice(0, LEDGER_MAX);
    return { ...state, almangPointsLedger: nextLedger };
}
