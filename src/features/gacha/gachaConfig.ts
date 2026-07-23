import { INGREDIENTS } from '@api/mock/ingredients';
import {
    ECO_JAM_GACHA_CONSOLATION,
    ECO_JAM_GACHA_PULL_COST,
} from '../../shared/constants/ecoJamPolicy';

/** @deprecated ecoJamPolicy 사용 권장 */
export const GACHA_PULL_COST_ECO_JAM = ECO_JAM_GACHA_PULL_COST;

export const GACHA_CONSOLATION_ECO_JAM = ECO_JAM_GACHA_CONSOLATION;

/** 노션 에코잼 가챠 보상안 — weight 합계 100 */
export type GachaWeightEntry =
    | { kind: 'almang'; amount: number; weight: number }
    | { kind: 'common_ingredient'; count: number; weight: number }
    | { kind: 'hidden_ingredient'; count: number; weight: number }
    | { kind: 'consolation'; amount: number; weight: number };

export const GACHA_WEIGHT_TABLE: GachaWeightEntry[] = [
    { kind: 'almang', amount: 200, weight: 8 },
    { kind: 'almang', amount: 300, weight: 5 },
    { kind: 'almang', amount: 500, weight: 2 },
    { kind: 'almang', amount: 100, weight: 40 },
    { kind: 'common_ingredient', count: 2, weight: 10 },
    { kind: 'common_ingredient', count: 1, weight: 18 },
    { kind: 'hidden_ingredient', count: 1, weight: 2 },
    { kind: 'consolation', amount: ECO_JAM_GACHA_CONSOLATION, weight: 15 },
];

export const GACHA_COMMON_INGREDIENT_POOL = INGREDIENTS.filter((i) => i.type === 'COMMON').map(
    (i) => i.id,
);
export const GACHA_HIDDEN_INGREDIENT_POOL = INGREDIENTS.filter((i) => i.type === 'HIDDEN').map(
    (i) => i.id,
);

/** @deprecated — 공통+히든 합집합. 신규 코드는 COMMON/HIDDEN 풀 사용 */
export const GACHA_INGREDIENT_POOL = INGREDIENTS.map((item) => item.id);

export const GACHA_REWARD_LABEL = {
    FAIL: '꽝',
    ECO_JAM: '에코잼',
    INGREDIENT: '재료',
    ALMANG_POINT: '알맹상점 포인트(매장)',
} as const;

export const GACHA_PROBABILITY_HINT =
    '알맹P 55% · 일반재료 28% · 희귀재료 2% · 꽝(에코잼30) 15% · 1회 100잼';
