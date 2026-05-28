import { INGREDIENTS } from '@api/mock/ingredients';
import type { GachaRewardType } from './gachaTypes';

/** 1회 뽑기에 소모하는 에코잼 */
export const GACHA_PULL_COST_ECO_JAM = 10;

/** 샌드박스·QA: 가챠 화면 테스트 충전량 */
export const GACHA_TEST_ECO_JAM_GRANT = 50;

type WeightedEntry = {
    type: GachaRewardType;
    weight: number;
};

/** 합계 100 기준 가중치 (MVP mock — 추후 BE 확률표로 교체) */
export const GACHA_WEIGHT_TABLE: WeightedEntry[] = [
    { type: 'nothing', weight: 35 },
    { type: 'ecoJam', weight: 30 },
    { type: 'ingredient', weight: 28 },
    { type: 'shopPoints', weight: 7 },
];

export const GACHA_INGREDIENT_POOL = INGREDIENTS.map((item) => item.id);

export const GACHA_REWARD_LABEL: Record<GachaRewardType, string> = {
    nothing: '꽝',
    ecoJam: '에코잼',
    ingredient: '재료',
    shopPoints: '알맹상점 포인트',
};

export const GACHA_PROBABILITY_HINT =
    '꽝 35% · 에코잼 30% · 재료 28% · 알맹 포인트 7% (희소)';
