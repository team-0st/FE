import { getIngredientById } from '@api/mock/ingredients';
import type { ImageSourcePropType } from 'react-native';
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

export type GachaTabPhase = 'idle' | 'pulling' | 'result';

/**
 * 가챠 탭 표시 상태. `active`는 이 탭이 현재 보이는 탭인지 여부다.
 * `generation`은 탭을 나갈 때마다(active: true→false) 증가하는 토큰으로,
 * 이탈 이전에 시작된 pull의 늦은 결과가 복귀 후 화면에 다시 반영되지 않도록 막는 데 쓴다.
 * `isPullPending`은 서버 pull 요청이 아직 끝나지 않았는지를 나타내며 `phase`와는 독립적으로
 * 유지된다 — 이탈로 `phase`가 idle로 초기화돼도 요청이 끝나기 전까지는 true로 남아 중복 뽑기를 막는다.
 */
export type GachaTabState = {
    active: boolean;
    phase: GachaTabPhase;
    lastReward: GachaReward | null;
    failArt: ImageSourcePropType;
    idleFailArt: ImageSourcePropType;
    isPullPending: boolean;
    generation: number;
};

export type GachaTabEvent =
    | { type: 'TAB_ACTIVE_CHANGED'; active: boolean }
    | { type: 'PULL_STARTED' }
    | { type: 'PULL_ABANDONED_SETTLED' }
    | { type: 'PULL_SETTLED'; outcome: 'idle' }
    | {
          type: 'PULL_SETTLED';
          outcome: 'result';
          reward: GachaReward;
          failArt?: ImageSourcePropType;
      };

export function createInitialGachaTabState(
    active: boolean,
    idleFailArt: ImageSourcePropType,
): GachaTabState {
    return {
        active,
        phase: 'idle',
        lastReward: null,
        failArt: idleFailArt,
        idleFailArt,
        isPullPending: false,
        generation: 0,
    };
}

export function reduceGachaTabState(state: GachaTabState, event: GachaTabEvent): GachaTabState {
    switch (event.type) {
        case 'TAB_ACTIVE_CHANGED': {
            if (event.active) {
                return { ...state, active: true };
            }
            return {
                ...state,
                active: false,
                phase: 'idle',
                lastReward: null,
                failArt: state.idleFailArt,
                generation: state.generation + 1,
            };
        }
        case 'PULL_STARTED':
            return { ...state, phase: 'pulling', isPullPending: true };
        case 'PULL_ABANDONED_SETTLED':
            return { ...state, isPullPending: false };
        case 'PULL_SETTLED':
            if (event.outcome === 'idle') {
                return { ...state, phase: 'idle', isPullPending: false };
            }
            return {
                ...state,
                phase: 'result',
                lastReward: event.reward,
                failArt: event.failArt ?? state.failArt,
                isPullPending: false,
            };
        default:
            return state;
    }
}

/** pull 시작 시점 generation과 현재 generation이 같을 때만 그 결과를 화면에 반영해야 한다. */
export function isGachaPullOutcomeCurrent(
    startGeneration: number,
    currentGeneration: number,
): boolean {
    return startGeneration === currentGeneration;
}
