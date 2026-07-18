import { INGREDIENTS } from '@api/mock/ingredients';
import {
    ECO_JAM_GACHA_PULL_COST,
    ECO_JAM_TEST_GRANT,
} from '../../shared/constants/ecoJamPolicy';
import type { GachaRewardType } from './gachaTypes';

/** @deprecated ecoJamPolicy 사용 권장 */
export const GACHA_PULL_COST_ECO_JAM = ECO_JAM_GACHA_PULL_COST;

/** 샌드박스·QA: 가챠 화면 테스트 충전량 */
export const GACHA_TEST_ECO_JAM_GRANT = ECO_JAM_TEST_GRANT;

type WeightedEntry = {
    type: GachaRewardType;
    weight: number;
};

/** 합계 100 — 노션 Gachas.result_type (FAIL = 꽝) */
export const GACHA_WEIGHT_TABLE: WeightedEntry[] = [
    { type: 'FAIL', weight: 35 },
    { type: 'ECO_JAM', weight: 30 },
    { type: 'INGREDIENT', weight: 28 },
    { type: 'ALMANG_POINT', weight: 7 },
];

export const GACHA_INGREDIENT_POOL = INGREDIENTS.map((item) => item.id);

export const GACHA_REWARD_LABEL: Record<GachaRewardType, string> = {
    FAIL: '꽝',
    ECO_JAM: '에코잼',
    INGREDIENT: '재료',
    ALMANG_POINT: '알맹상점 포인트',
};

export const GACHA_PROBABILITY_HINT =
    '꽝 35% · 에코잼 30% · 재료 28% · 알맹 포인트 7% (희소)';
