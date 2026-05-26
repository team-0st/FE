import { MISSION_INGREDIENT_REWARD } from '@api/mock/ingredients';
import type { Recipe } from '@api/mock/recipes';
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

export function checkIn(state: AppUserState, today = formatDateKey(new Date())): AppUserState {
    if (state.lastCheckInDate === today) {
        return state;
    }
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = formatDateKey(yesterday);
    const streakDays = state.lastCheckInDate === yesterdayKey ? state.streakDays + 1 : 1;
    return {
        ...state,
        lastCheckInDate: today,
        streakDays,
    };
}

export function finishOnboarding(state: AppUserState, shopId: string): AppUserState {
    return {
        ...state,
        shopId,
        onboardingCompleted: true,
    };
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

export function approveMission(state: AppUserState, missionId: string, points: number): AppUserState {
    const now = new Date().toISOString();
    const wasCompleted = state.missionProgress[missionId]?.status === 'completed';
    let next: AppUserState = {
        ...state,
        missionProgress: {
            ...state.missionProgress,
            [missionId]: { status: 'completed', completedAt: now },
        },
    };
    if (wasCompleted) {
        return next;
    }
    const weeklyMissionDone = Math.min(next.weeklyMissionTotal, next.weeklyMissionDone + 1);
    next = {
        ...next,
        weeklyMissionDone,
        totalPoints: next.totalPoints + points,
    };
    const ingredientId = MISSION_INGREDIENT_REWARD[missionId];
    if (ingredientId != null) {
        next = addIngredient(next, ingredientId, 1);
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

export function completeRecipe(state: AppUserState, recipe: Recipe): AppUserState {
    if (state.completedRecipeIds.includes(recipe.id)) {
        return state;
    }
    const ecoGain = recipe.ecoJamReward ?? 0;
    return {
        ...state,
        completedRecipeIds: [...state.completedRecipeIds, recipe.id],
        ecoJam: state.ecoJam + ecoGain,
    };
}
