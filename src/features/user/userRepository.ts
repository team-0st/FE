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
            next[id] = {
                status: 'pending_review',
                completionId: progress.completionId,
                submittedAt: progress.submittedAt,
            };
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

    const lastCheckInDate = rest.lastCheckInDate ?? null;
    const savedDates = Array.isArray(rest.checkInDates) ? rest.checkInDates : [];
    const checkInDates =
        lastCheckInDate != null && !savedDates.includes(lastCheckInDate)
            ? [...savedDates, lastCheckInDate].sort()
            : savedDates;

    return {
        ...DEFAULT_USER_STATE,
        ...rest,
        userId: rest.userId ?? null,
        deviceId: rest.deviceId ?? null,
        phoneMasked: rest.phoneMasked ?? null,
        phoneNumber: rest.phoneNumber ?? null,
        almangPayoutConsent: rest.almangPayoutConsent ?? DEFAULT_USER_STATE.almangPayoutConsent,
        almangConsentAt: rest.almangConsentAt ?? null,
        privacyConsentAt: rest.privacyConsentAt ?? null,
        lastCheckInDate,
        checkInDates,
        ecoJam: rest.ecoJam ?? DEFAULT_USER_STATE.ecoJam,
        totalCo2ReductionGrams:
            rest.totalCo2ReductionGrams ?? DEFAULT_USER_STATE.totalCo2ReductionGrams,
        ingredientInventory: normalizeIngredientInventory(rest.ingredientInventory),
        completedRecipeIds,
        unlockedRecipeIds: Array.isArray(rest.unlockedRecipeIds) ? rest.unlockedRecipeIds : [],
        lastSoupSession: rest.lastSoupSession ?? null,
        missionProgress: normalizeMissionProgress(missionProgress),
        ecoJamLedger: rest.ecoJamLedger ?? [],
        almangPointsLedger: rest.almangPointsLedger ?? [],
        pendingRealRewards: rest.pendingRealRewards ?? [],
        lastShareRewardDate: rest.lastShareRewardDate ?? null,
        hiddenTodayRecipePinId: rest.hiddenTodayRecipePinId ?? null,
    };
}

export async function saveUserState(state: AppUserState): Promise<void> {
    await writeJson(STORAGE_KEYS.appState, state);
}
