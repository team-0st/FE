import { readJson, writeJson } from '../../shared/storage/jsonStorage';
import { STORAGE_KEYS } from '../../shared/storage/keys';
import { DEFAULT_USER_STATE } from './defaultState';
import { normalizeIngredientInventory } from './ingredientInventory';
import type { AppUserState } from './types';

type LegacyUserState = Partial<AppUserState> & {
    teamId?: string;
    onboarding?: unknown;
    preSurveyDone?: boolean;
    postSurveyDone?: boolean;
    missionProgress?: AppUserState['missionProgress'];
};

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
        ecoJam: rest.ecoJam ?? DEFAULT_USER_STATE.ecoJam,
        gachaTickets: rest.gachaTickets ?? 0,
        ingredientInventory: normalizeIngredientInventory(rest.ingredientInventory),
        completedRecipeIds,
        missionProgress: missionProgress ?? {},
        ecoJamLedger: rest.ecoJamLedger ?? [],
        pendingRealRewards: rest.pendingRealRewards ?? [],
    };
}

export async function saveUserState(state: AppUserState): Promise<void> {
    await writeJson(STORAGE_KEYS.appState, state);
}
