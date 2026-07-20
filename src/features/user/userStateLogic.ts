import type { CheckInSuccessDto } from '@api/checkIn';
import type { Recipe } from '@api/mock/recipes';
import type { SoupCraftResponse } from '@api/notion/types';
import { gradeFromCraft, gradeRank } from '../soup/soupRewardGrades';
import { getCarbonReduction } from '../missions/carbonReduction';
import { appendEcoJamLedger } from './ecoJamLedger';
import { appendAlmangPointsLedger } from './almangPointsLedger';
import { DEFAULT_USER_STATE } from './defaultState';
import {
    SHARE_REWARD_ECO_JAM_AMOUNT,
    SHARE_REWARD_LEDGER_LABEL,
} from '../../shared/constants/shareRewardPolicy';
import type {
    AlmangPayoutConsent,
    AppUserState,
    CameraConsent,
    LocationConsent,
    MissionProgressStatus,
    PendingRealReward,
} from './types';

export function formatDateKey(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

export function isCheckedInToday(state: AppUserState, today = formatDateKey(new Date())): boolean {
    return state.lastCheckInDate === today || state.checkInDates.includes(today);
}

/** 로컬 자정 기준 날짜 키를 delta일 이동 */
export function shiftDateKey(dateKey: string, deltaDays: number): string {
    const parts = dateKey.split('-').map(Number);
    const year = parts[0] ?? 1970;
    const month = parts[1] ?? 1;
    const day = parts[2] ?? 1;
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + deltaDays);
    return formatDateKey(date);
}

/** 해당 주의 월요일(로컬) */
export function startOfWeekMonday(date: Date): Date {
    const local = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const day = local.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    local.setDate(local.getDate() + diffToMonday);
    return local;
}

/** 월~일 7일 날짜 키 */
export function weekDateKeys(date = new Date()): string[] {
    const monday = startOfWeekMonday(date);
    return Array.from({ length: 7 }, (_, index) => {
        const cell = new Date(monday);
        cell.setDate(monday.getDate() + index);
        return formatDateKey(cell);
    });
}

const WEEKDAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'] as const;

export function weekDayLabel(index: number): string {
    return WEEKDAY_LABELS[index] ?? '';
}

/** 연속 출석일 (오늘 출석 전이면 어제까지 이어진 일수) */
export function computeCheckInStreak(
    checkInDates: string[],
    today = formatDateKey(new Date()),
): number {
    const set = new Set(checkInDates);
    let cursor = set.has(today) ? today : shiftDateKey(today, -1);
    let streak = 0;
    while (set.has(cursor)) {
        streak += 1;
        cursor = shiftDateKey(cursor, -1);
    }
    return streak;
}

function mergeCheckInDate(dates: string[], today: string): string[] {
    if (dates.includes(today)) {
        return dates;
    }
    const next = [...dates, today].sort();
    if (next.length <= 90) {
        return next;
    }
    return next.slice(next.length - 90);
}

export function applyCheckInFromServer(
    state: AppUserState,
    payload: CheckInSuccessDto,
    today = formatDateKey(new Date()),
): AppUserState {
    return {
        ...state,
        lastCheckInDate: today,
        checkInDates: mergeCheckInDate(state.checkInDates, today),
        ingredientInventory: payload.ingredientInventory,
    };
}

/** BE에만 오늘 출석이 있을 때 로컬 UI 동기화 (보상 재지급 없음) */
export function syncCheckedInToday(
    state: AppUserState,
    today = formatDateKey(new Date()),
): AppUserState {
    if (isCheckedInToday(state, today)) {
        return state;
    }
    return {
        ...state,
        lastCheckInDate: today,
        checkInDates: mergeCheckInDate(state.checkInDates, today),
    };
}

export function saveOnboardingProfile(
    state: AppUserState,
    payload: {
        nickname: string;
        phoneMasked: string | null;
        phoneNumber?: string | null;
        almangPayoutConsent: AlmangPayoutConsent;
        consentAt: string | null;
        privacyConsentAt: string;
    },
): AppUserState {
    return {
        ...state,
        nickname: payload.nickname,
        phoneMasked: payload.phoneMasked,
        phoneNumber: payload.phoneNumber ?? null,
        almangPayoutConsent: payload.almangPayoutConsent,
        almangConsentAt: payload.consentAt,
        privacyConsentAt: payload.privacyConsentAt,
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

export function setLocationConsent(state: AppUserState, consent: LocationConsent): AppUserState {
    return {
        ...state,
        locationConsent: consent,
        locationConsentAt: new Date().toISOString(),
    };
}

export function setCameraConsent(state: AppUserState, consent: CameraConsent): AppUserState {
    return {
        ...state,
        cameraConsent: consent,
        cameraConsentAt: new Date().toISOString(),
    };
}

export function getMissionStatus(state: AppUserState, missionId: string): MissionProgressStatus {
    return state.missionProgress[missionId]?.status ?? 'available';
}

export function getMissionTodayStatus(state: AppUserState, missionId: string): 'PENDING' | 'APPROVED' | 'REJECTED' | null {
    const progress = state.missionProgress[missionId];
    if (progress == null || progress.status === 'available') {
        return null;
    }
    if (progress.status === 'pending_review') {
        return 'PENDING';
    }
    if (progress.status === 'rejected') {
        return 'REJECTED';
    }
    return 'APPROVED';
}

export function applyRegisterUser(
    state: AppUserState,
    payload: { userId: number; deviceId: string; onboardingCompleted: boolean },
): AppUserState {
    return {
        ...state,
        userId: payload.userId,
        deviceId: payload.deviceId,
        onboardingCompleted: state.onboardingCompleted || payload.onboardingCompleted,
    };
}

export function submitMissionPendingReview(
    state: AppUserState,
    missionId: string,
    completionId: number,
): AppUserState {
    const now = new Date().toISOString();
    return {
        ...state,
        missionProgress: {
            ...state.missionProgress,
            [missionId]: {
                status: 'pending_review',
                completionId,
                submittedAt: now,
            },
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
    const carbonReduction = getCarbonReduction(missionId);
    if (carbonReduction?.grams != null) {
        next = {
            ...next,
            totalCo2ReductionGrams: next.totalCo2ReductionGrams + carbonReduction.grams,
        };
    }
    return next;
}

/** BE completions → 로컬 pending/approved 동기화 */
export function applyMissionCompletionsToState(
    state: AppUserState,
    items: Array<{
        completionId: number;
        missionId: number;
        status: 'PENDING' | 'APPROVED' | 'REJECTED';
        rewardedIngredient?: { id: number } | null;
    }>,
    missionSlugFromNumeric: (id: number) => string | undefined,
    ingredientSlugFromNumeric: (id: number) => string | undefined,
): AppUserState {
    let next = state;
    for (const item of items) {
        if (item.status !== 'APPROVED') {
            continue;
        }
        const slug = missionSlugFromNumeric(item.missionId);
        if (slug == null) {
            continue;
        }
        if (next.missionProgress[slug]?.status === 'completed') {
            continue;
        }
        const rewardSlug =
            item.rewardedIngredient != null
                ? (ingredientSlugFromNumeric(item.rewardedIngredient.id) ??
                  `be-${item.rewardedIngredient.id}`)
                : undefined;
        if (rewardSlug == null) {
            continue;
        }
        next = completeMissionVerify(next, slug, rewardSlug);
    }
    for (const item of items) {
        if (item.status !== 'PENDING') {
            continue;
        }
        const slug = missionSlugFromNumeric(item.missionId);
        if (slug == null) {
            continue;
        }
        const current = next.missionProgress[slug]?.status;
        if (current === 'completed' || current === 'pending_review') {
            continue;
        }
        next = submitMissionPendingReview(next, slug, item.completionId);
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

function addIngredientStock(
    state: AppUserState,
    ingredientId: string,
    amount: number,
): AppUserState {
    const current = state.ingredientInventory[ingredientId] ?? 0;
    return {
        ...state,
        ingredientInventory: {
            ...state.ingredientInventory,
            [ingredientId]: current + amount,
        },
    };
}

/** 스프 보상만 적용 (레시피 완료 마킹 제외) */
export function applySoupCraftReward(
    state: AppUserState,
    recipe: Recipe,
    craft: SoupCraftResponse,
    ledgerLabel = `${recipe.name} 보상`,
): AppUserState {
    let next = state;
    if (craft.rewardIngredientId != null) {
        next = addIngredientStock(next, craft.rewardIngredientId, 1);
    }

    // BE는 INGREDIENT 등급에도 에코잼·포인트를 함께 줄 수 있음 → rewardEcoJam/rewardPoint 우선
    const eco =
        craft.rewardEcoJam ??
        (craft.rewardType === 'ECO_JAM' ? (craft.rewardAmount ?? 0) : 0);
    if (eco > 0) {
        next = { ...next, ecoJam: next.ecoJam + eco };
        next = appendEcoJamLedger(next, ledgerLabel, eco);
    }

    const pointGain =
        craft.rewardPoint ??
        (craft.rewardType === 'ALMANG_POINT' ? (craft.rewardAmount ?? 0) : 0);
    if (pointGain > 0) {
        next = { ...next, totalPoints: next.totalPoints + pointGain };
        next = appendAlmangPointsLedger(next, ledgerLabel, pointGain);
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

    return next;
}

/**
 * 리롤로 등급이 올랐을 때 추가 보상만 지급.
 * 동일 등급이면 변화 없음.
 */
export function applySoupRerollDelta(
    state: AppUserState,
    recipe: Recipe,
    prev: SoupCraftResponse,
    nextCraft: SoupCraftResponse,
): AppUserState {
    const prevRank = gradeRank(gradeFromCraft(prev));
    const nextRank = gradeRank(gradeFromCraft(nextCraft));
    if (nextRank <= prevRank) {
        return state;
    }
    if (
        prev.rewardType === 'ALMANG_POINT' &&
        nextCraft.rewardType === 'ALMANG_POINT' &&
        (nextCraft.rewardAmount ?? 0) > (prev.rewardAmount ?? 0)
    ) {
        const gain = (nextCraft.rewardAmount ?? 0) - (prev.rewardAmount ?? 0);
        let next = { ...state, totalPoints: state.totalPoints + gain };
        next = appendAlmangPointsLedger(next, `${recipe.name} 리롤`, gain);
        return next;
    }
    return applySoupCraftReward(state, recipe, nextCraft, `${recipe.name} 리롤`);
}

export function unlockHiddenRecipe(state: AppUserState, recipeId: string): AppUserState {
    if (state.unlockedRecipeIds.includes(recipeId) || state.completedRecipeIds.includes(recipeId)) {
        return state;
    }
    return {
        ...state,
        unlockedRecipeIds: [...state.unlockedRecipeIds, recipeId],
    };
}

export function completeRecipe(
    state: AppUserState,
    recipe: Recipe,
    craft: SoupCraftResponse,
): AppUserState {
    // 재제작이어도 리롤 세션은 항상 갱신
    const session = { recipeId: recipe.id, craft, rerollUsed: false as const };
    if (state.completedRecipeIds.includes(recipe.id)) {
        return {
            ...state,
            lastSoupSession: session,
        };
    }
    let next: AppUserState = {
        ...state,
        completedRecipeIds: [...state.completedRecipeIds, recipe.id],
        unlockedRecipeIds: state.unlockedRecipeIds.includes(recipe.id)
            ? state.unlockedRecipeIds
            : [...state.unlockedRecipeIds, recipe.id],
        lastSoupSession: session,
    };
    return applySoupCraftReward(next, recipe, craft);
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

export type ShareRewardClaimResult =
    | { ok: true; ecoJamGranted: number }
    | { ok: false; reason: 'already_claimed' };

/** 공유 에코잼 보상 — 계정당 1회 */
export function claimShareReward(
    state: AppUserState,
    today = formatDateKey(new Date()),
): { state: AppUserState; result: ShareRewardClaimResult } {
    if (state.lastShareRewardDate != null) {
        return { state, result: { ok: false, reason: 'already_claimed' } };
    }
    let next = addEcoJam(state, SHARE_REWARD_ECO_JAM_AMOUNT, SHARE_REWARD_LEDGER_LABEL);
    next = { ...next, lastShareRewardDate: today };
    return { state: next, result: { ok: true, ecoJamGranted: SHARE_REWARD_ECO_JAM_AMOUNT } };
}
