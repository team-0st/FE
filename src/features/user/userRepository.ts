import { readJson, writeJson } from '../../shared/storage/jsonStorage';
import { STORAGE_KEYS } from '../../shared/storage/keys';
import { DEFAULT_USER_STATE } from './defaultState';
import { normalizeIngredientInventory } from './ingredientInventory';
import type { AppUserState, MissionProgress } from './types';

type LegacyUserState = Partial<AppUserState> & {
    teamId?: string;
    onboarding?: unknown;
    preSurveyDone?: boolean;
    postSurveyDone?: boolean;
    streakDays?: number;
    gachaTickets?: number;
    missionProgress?: Record<string, MissionProgress & { status?: string; submittedAt?: string }>;
};

function normalizeMissionProgress(
    raw: LegacyUserState['missionProgress'],
): AppUserState['missionProgress'] {
    if (raw == null) {
        return {};
    }
    const next: AppUserState['missionProgress'] = {};
    for (const [id, progress] of Object.entries(raw)) {
        const legacyStatus = progress.status as string | undefined;
        if (legacyStatus === 'pending_review') {
            next[id] = { status: 'available' };
            continue;
        }
        if (progress.status === 'completed' || legacyStatus === 'completed') {
            next[id] = {
                status: 'completed',
                completedAt: progress.completedAt,
                rewardIngredientId: progress.rewardIngredientId,
            };
        }
    }
    return next;
}

export async function loadUserState(): Promise<AppUserState> {
    const saved = await readJson<LegacyUserState>(STORAGE_KEYS.appState);
    if (saved == null) {
        return DEFAULT_USER_STATE;
    }
    const {
        teamId: _teamId,
        onboarding: _onboarding,
        preSurveyDone: _preSurveyDone,
        postSurveyDone: _postSurveyDone,
        streakDays: _streakDays,
        gachaTickets: _gachaTickets,
        missionProgress,
        ...rest
    } = saved;
    const legacyRecipeIdMap: Record<string, string> = {
        'weekly-calm': 'weekly-01',
        'weekly-forest': 'weekly-02',
    };
    const completedRecipeIds = (rest.completedRecipeIds ?? []).map(
        (id) => legacyRecipeIdMap[id] ?? id,
    );

    return {
        ...DEFAULT_USER_STATE,
        ...rest,
        phoneMasked: rest.phoneMasked ?? null,
        almangPayoutConsent: rest.almangPayoutConsent ?? DEFAULT_USER_STATE.almangPayoutConsent,
        almangConsentAt: rest.almangConsentAt ?? null,
        ecoJam: rest.ecoJam ?? DEFAULT_USER_STATE.ecoJam,
        ingredientInventory: normalizeIngredientInventory(rest.ingredientInventory),
        completedRecipeIds,
        missionProgress: normalizeMissionProgress(missionProgress),
        ecoJamLedger: rest.ecoJamLedger ?? [],
        pendingRealRewards: rest.pendingRealRewards ?? [],
    };
}

export async function saveUserState(state: AppUserState): Promise<void> {
    await writeJson(STORAGE_KEYS.appState, state);
}
