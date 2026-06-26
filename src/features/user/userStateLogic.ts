import type { CheckInSuccessDto } from '@api/checkIn';
import type { Recipe } from '@api/mock/recipes';
import type { SoupCraftResponse } from '@api/notion/types';
import { appendEcoJamLedger } from './ecoJamLedger';
import { DEFAULT_USER_STATE } from './defaultState';
import type { AppUserState, MissionProgressStatus, PendingRealReward } from './types';

export function formatDateKey(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

export function isCheckedInToday(state: AppUserState, today = formatDateKey(new Date())): boolean {
    return state.lastCheckInDate === today;
}

export function applyCheckInFromServer(
    state: AppUserState,
    payload: CheckInSuccessDto,
    today = formatDateKey(new Date()),
): AppUserState {
    return {
        ...state,
        lastCheckInDate: today,
        ingredientInventory: payload.ingredientInventory,
    };
}

export function finishOnboarding(state: AppUserState, shopId: string): AppUserState {
    return {
        ...state,
        shopId,
        onboardingCompleted: true,
    };
}

export function resetOnboarding(_state: AppUserState): AppUserState {
    return { ...DEFAULT_USER_STATE };
}

export function setShopId(state: AppUserState, shopId: string): AppUserState {
    return { ...state, shopId };
}

export function getMissionStatus(state: AppUserState, missionId: string): MissionProgressStatus {
    return state.missionProgress[missionId]?.status ?? 'available';
}

function addIngredient(state: AppUserState, ingredientId: string, amount = 1): AppUserState {
    const current = state.ingredientInventory[ingredientId] ?? 0;
    return {
        ...state,
        ingredientInventory: {
            ...state.ingredientInventory,
            [ingredientId]: current + amount,
        },
    };
}

export function completeMissionVerify(
    state: AppUserState,
    missionId: string,
    rewardIngredientId: string,
): AppUserState {
    const now = new Date().toISOString();
    const wasCompleted = state.missionProgress[missionId]?.status === 'completed';
    let next: AppUserState = {
        ...state,
        missionProgress: {
            ...state.missionProgress,
            [missionId]: {
                status: 'completed',
                completedAt: now,
                rewardIngredientId,
            },
        },
    };
    if (wasCompleted) {
        return next;
    }
    const weeklyMissionDone = Math.min(next.weeklyMissionTotal, next.weeklyMissionDone + 1);
    next = { ...next, weeklyMissionDone };
    next = addIngredient(next, rewardIngredientId, 1);
    return next;
}

export function consumeIngredientsForSlots(
    state: AppUserState,
    slots: string[],
): AppUserState | null {
    const inventory = { ...state.ingredientInventory };
    for (const id of slots) {
        const count = inventory[id] ?? 0;
        if (count < 1) {
            return null;
        }
        inventory[id] = count - 1;
        if (inventory[id] === 0) {
            delete inventory[id];
        }
    }
    return { ...state, ingredientInventory: inventory };
}

export function completeRecipe(
    state: AppUserState,
    recipe: Recipe,
    craft: SoupCraftResponse,
): AppUserState {
    if (state.completedRecipeIds.includes(recipe.id)) {
        return state;
    }
    let next: AppUserState = {
        ...state,
        completedRecipeIds: [...state.completedRecipeIds, recipe.id],
    };
    if (craft.result !== 'SUCCESS') {
        return next;
    }
    if (craft.rewardType === 'ECO_JAM' && (craft.rewardAmount ?? 0) > 0) {
        const gain = craft.rewardAmount ?? 0;
        next = { ...next, ecoJam: next.ecoJam + gain };
        next = appendEcoJamLedger(next, `${recipe.name} 보상`, gain);
    }
    if (craft.rewardType === 'REAL_ITEM') {
        const pending: PendingRealReward = {
            id: `reward-${recipe.id}-${Date.now()}`,
            recipeId: recipe.id,
            label: craft.rewardDescription ?? recipe.realRewardLabel ?? '실물 리워드',
            createdAt: new Date().toISOString(),
            status: 'pending_contact',
        };
        next = {
            ...next,
            pendingRealRewards: [pending, ...next.pendingRealRewards],
        };
    }
    if (craft.rewardType === 'ALMANG_POINT' && (craft.rewardAmount ?? 0) > 0) {
        next = { ...next, totalPoints: next.totalPoints + (craft.rewardAmount ?? 0) };
    }
    return next;
}

export function addEcoJam(state: AppUserState, amount: number, label = '에코잼 지급'): AppUserState {
    if (amount <= 0) {
        return state;
    }
    let next = { ...state, ecoJam: state.ecoJam + amount };
    next = appendEcoJamLedger(next, label, amount);
    return next;
}

export function spendEcoJam(state: AppUserState, amount: number, label: string): AppUserState | null {
    if (amount <= 0 || state.ecoJam < amount) {
        return null;
    }
    let next = { ...state, ecoJam: state.ecoJam - amount };
    next = appendEcoJamLedger(next, label, -amount);
    return next;
}
