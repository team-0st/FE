import type { CheckInSuccessDto } from '@api/checkIn';
import { pickMissionRewardIngredient } from '@api/mock/ingredients';
import type { Recipe } from '@api/mock/recipes';
import type { SoupBrewOutcome } from '../soup/soupRewardLogic';
import { DEFAULT_USER_STATE } from './defaultState';
import type { AppUserState, MissionProgressStatus } from './types';

export function formatDateKey(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

export function isCheckedInToday(state: AppUserState, today = formatDateKey(new Date())): boolean {
    return state.lastCheckInDate === today;
}

/** BE 출석 API 응답을 로컬 상태에 반영 (FE는 계산하지 않음) */
export function applyCheckInFromServer(
    state: AppUserState,
    payload: CheckInSuccessDto,
    today = formatDateKey(new Date()),
): AppUserState {
    return {
        ...state,
        lastCheckInDate: today,
        streakDays: payload.streakDays,
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

/** 샌드박스·QA: 온보딩·재료·미션·출석 등 진행을 초기 상태로 되돌림 */
export function resetOnboarding(_state: AppUserState): AppUserState {
    return { ...DEFAULT_USER_STATE };
}

export function setShopId(state: AppUserState, shopId: string): AppUserState {
    return { ...state, shopId };
}

export function getMissionStatus(state: AppUserState, missionId: string): MissionProgressStatus {
    return state.missionProgress[missionId]?.status ?? 'available';
}

export function submitMissionReview(state: AppUserState, missionId: string): AppUserState {
    const now = new Date().toISOString();
    return {
        ...state,
        missionProgress: {
            ...state.missionProgress,
            [missionId]: { status: 'pending_review', submittedAt: now },
        },
    };
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

export function approveMission(
    state: AppUserState,
    missionId: string,
    random: () => number = Math.random,
): AppUserState {
    const now = new Date().toISOString();
    const wasCompleted = state.missionProgress[missionId]?.status === 'completed';
    const rewardIngredientId = pickMissionRewardIngredient(missionId, random);
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
    if (rewardIngredientId != null) {
        next = addIngredient(next, rewardIngredientId, 1);
    }
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
    outcome: SoupBrewOutcome,
): AppUserState {
    if (state.completedRecipeIds.includes(recipe.id)) {
        return state;
    }
    let next: AppUserState = {
        ...state,
        completedRecipeIds: [...state.completedRecipeIds, recipe.id],
    };
    if (outcome.kind === 'ecoJam' && (outcome.ecoJamAmount ?? 0) > 0) {
        next = { ...next, ecoJam: next.ecoJam + (outcome.ecoJamAmount ?? 0) };
    }
    return next;
}

export function addEcoJam(state: AppUserState, amount: number): AppUserState {
    if (amount <= 0) {
        return state;
    }
    return { ...state, ecoJam: state.ecoJam + amount };
}
