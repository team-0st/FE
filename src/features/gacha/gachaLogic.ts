import { getIngredientById } from '@api/mock/ingredients';
import { getAlmangRewardMessage } from '../user/almangPayoutCopy';
import type { AppUserState } from '../user/types';
import {
    GACHA_COMMON_INGREDIENT_POOL,
    GACHA_CONSOLATION_ECO_JAM,
    GACHA_HIDDEN_INGREDIENT_POOL,
    GACHA_PULL_COST_ECO_JAM,
    GACHA_WEIGHT_TABLE,
    type GachaWeightEntry,
} from './gachaConfig';
import type { GachaReward } from './gachaTypes';

function pickWeightedEntry(random: () => number): GachaWeightEntry {
    const roll = random() * 100;
    let acc = 0;
    for (const entry of GACHA_WEIGHT_TABLE) {
        acc += entry.weight;
        if (roll < acc) {
            return entry;
        }
    }
    return GACHA_WEIGHT_TABLE[GACHA_WEIGHT_TABLE.length - 1] ?? {
        kind: 'consolation',
        amount: GACHA_CONSOLATION_ECO_JAM,
        weight: 15,
    };
}

function pickFromPool(pool: string[], random: () => number): string {
    if (pool.length === 0) {
        return 'cabbage';
    }
    const index = Math.floor(random() * pool.length);
    return pool[index] ?? pool[0] ?? 'cabbage';
}

export function rollGachaReward(random: () => number = Math.random): GachaReward {
    const entry = pickWeightedEntry(random);
    switch (entry.kind) {
        case 'almang':
            return { type: 'ALMANG_POINT', amount: entry.amount };
        case 'common_ingredient':
            return {
                type: 'INGREDIENT',
                ingredientId: pickFromPool(GACHA_COMMON_INGREDIENT_POOL, random),
                amount: entry.count,
                rarity: 'COMMON',
            };
        case 'hidden_ingredient':
            return {
                type: 'INGREDIENT',
                ingredientId: pickFromPool(GACHA_HIDDEN_INGREDIENT_POOL, random),
                amount: entry.count,
                rarity: 'HIDDEN',
            };
        case 'consolation':
            return { type: 'FAIL', consolationEcoJam: entry.amount };
    }
}

export function formatGachaRewardMessage(reward: GachaReward, state?: AppUserState): string {
    switch (reward.type) {
        case 'FAIL':
            return `아쉽게도 꽝이에요. 위로의 에코잼 ${reward.consolationEcoJam}개를 드렸어요!`;
        case 'ECO_JAM':
            return `에코잼 ${reward.amount}개를 받았어요!`;
        case 'INGREDIENT': {
            const item = getIngredientById(reward.ingredientId);
            const label = item != null ? item.name : '재료';
            const rare = reward.rarity === 'HIDDEN' ? '희귀 ' : '';
            return `${rare}${label} ${reward.amount}개를 받았어요!`;
        }
        case 'ALMANG_POINT':
            return state != null
                ? getAlmangRewardMessage(state, reward.amount)
                : `알맹상점 포인트 ${reward.amount}P가 적립됐어요. 매장에서 이용할 수 있어요.`;
    }
}

function addIngredient(
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

export function applyGachaReward(state: AppUserState, reward: GachaReward): AppUserState {
    let next = state;
    switch (reward.type) {
        case 'FAIL':
            if (reward.consolationEcoJam > 0) {
                next = { ...next, ecoJam: next.ecoJam + reward.consolationEcoJam };
            }
            break;
        case 'ECO_JAM':
            next = { ...next, ecoJam: next.ecoJam + reward.amount };
            break;
        case 'INGREDIENT':
            next = addIngredient(next, reward.ingredientId, reward.amount);
            break;
        case 'ALMANG_POINT':
            next = { ...next, totalPoints: next.totalPoints + reward.amount };
            break;
    }
    return next;
}

export function applyGachaPull(
    state: AppUserState,
    reward: GachaReward,
    costEcoJam = GACHA_PULL_COST_ECO_JAM,
): AppUserState | null {
    if (state.ecoJam < costEcoJam) {
        return null;
    }
    let next: AppUserState = { ...state, ecoJam: state.ecoJam - costEcoJam };
    return applyGachaReward(next, reward);
}

export function canAffordGachaPull(
    state: AppUserState,
    costEcoJam = GACHA_PULL_COST_ECO_JAM,
): boolean {
    return state.ecoJam >= costEcoJam;
}
