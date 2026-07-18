import { getIngredientById } from '@api/mock/ingredients';
import { getAlmangRewardMessage } from '../user/almangPayoutCopy';
import type { AppUserState } from '../user/types';
import {
    GACHA_INGREDIENT_POOL,
    GACHA_PULL_COST_ECO_JAM,
    GACHA_WEIGHT_TABLE,
} from './gachaConfig';
import type { GachaReward, GachaRewardType } from './gachaTypes';

function pickRewardType(random: () => number): GachaRewardType {
    const roll = random() * 100;
    let acc = 0;
    for (const entry of GACHA_WEIGHT_TABLE) {
        acc += entry.weight;
        if (roll < acc) {
            return entry.type;
        }
    }
    return GACHA_WEIGHT_TABLE[GACHA_WEIGHT_TABLE.length - 1]?.type ?? 'FAIL';
}

function pickIngredientId(random: () => number): string {
    const index = Math.floor(random() * GACHA_INGREDIENT_POOL.length);
    const picked = GACHA_INGREDIENT_POOL[index];
    if (picked != null) {
        return picked;
    }
    return GACHA_INGREDIENT_POOL[0] ?? 'cabbage';
}

export function rollGachaReward(random: () => number = Math.random): GachaReward {
    const type = pickRewardType(random);
    switch (type) {
        case 'FAIL':
            return { type: 'FAIL' };
        case 'ECO_JAM':
            return { type: 'ECO_JAM', amount: 1 + Math.floor(random() * 3) };
        case 'INGREDIENT':
            return {
                type: 'INGREDIENT',
                ingredientId: pickIngredientId(random),
                amount: 1,
            };
        case 'ALMANG_POINT':
            return {
                type: 'ALMANG_POINT',
                amount: 10 + Math.floor(random() * 21),
            };
    }
}

export function formatGachaRewardMessage(reward: GachaReward, state?: AppUserState): string {
    switch (reward.type) {
        case 'FAIL':
            return '아쉽게도 꽝이에요. 다음에 다시 도전해 보세요!';
        case 'ECO_JAM':
            return `에코잼 ${reward.amount}개를 받았어요!`;
        case 'INGREDIENT': {
            const item = getIngredientById(reward.ingredientId);
            const label = item != null ? `${item.emoji} ${item.name}` : '재료';
            return `${label} ${reward.amount}개를 받았어요!`;
        }
        case 'ALMANG_POINT':
            return state != null
                ? getAlmangRewardMessage(state, reward.amount)
                : `알맹상점 포인트 ${reward.amount}P를 받았어요! (희소)`;
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
